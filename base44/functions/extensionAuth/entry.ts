import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN_TTL = 30 * 60;
const ERROR = (code, msg, status) => ({ error: msg, code, status });

async function signToken(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyToken(token, email) {
  try {
    const decoded = atob(token);
    const parts = decoded.split(':');
    if (parts.length !== 4) return { valid: false };
    
    const [userId, timestamp, expiresAt, signature] = parts;
    const now = Math.floor(Date.now() / 1000);
    if (now > parseInt(expiresAt)) return { valid: false, expired: true };
    
    const expectedSig = await signToken(`${userId}:${timestamp}:${expiresAt}`, email);
    if (signature !== expectedSig) return { valid: false };
    
    return { valid: true, userId };
  } catch {
    return { valid: false };
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: "Method not allowed" }, { status: 405 });

  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    if (!payload.token) return Response.json(ERROR('MISSING_FIELD', 'token required', 400), { status: 400 });

    const user = await base44.auth.me();
    if (!user) return Response.json(ERROR('AUTH_FAILED', 'Authentication failed', 401), { status: 401 });

    const validation = await verifyToken(payload.token, user.email);
    if (!validation.valid) {
      const status = validation.expired ? 401 : 401;
      return Response.json(ERROR('INVALID_TOKEN', 'Token invalid or expired', status), { status });
    }

    // Issue new token
    const now = Math.floor(Date.now() / 1000);
    const newExpiresAt = now + TOKEN_TTL;
    const newTokenData = `${user.id}:${now}:${newExpiresAt}`;
    const newSig = await signToken(newTokenData, user.email);
    const newToken = btoa(`${newTokenData}:${newSig}`);

    const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email }, "-created_date", 1);
    const creatorName = profiles[0]?.display_name || user.full_name || "Creator";

    return Response.json({
      user_id: user.id,
      email: user.email,
      creator_name: creatorName,
      token: newToken,
      expires_at: new Date(newExpiresAt * 1000).toISOString(),
    });
  } catch (error) {
    console.error(error);
    return Response.json(ERROR('INTERNAL_ERROR', error.message, 500), { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN_TTL = 30 * 60; // 30 minutes
const ERROR = (code, msg, status) => ({ error: msg, code, status });

async function signToken(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: "Method not allowed" }, { status: 405 });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json(ERROR('AUTH_FAILED', 'Authentication failed', 401), { status: 401 });

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + TOKEN_TTL;
    const tokenData = `${user.id}:${now}:${expiresAt}`;
    const signature = await signToken(tokenData, user.email);
    const token = btoa(`${tokenData}:${signature}`);

    return Response.json({
      token,
      expires_in: TOKEN_TTL,
      expires_at: new Date(expiresAt * 1000).toISOString(),
    });
  } catch (error) {
    console.error(error);
    return Response.json(ERROR('INTERNAL_ERROR', error.message, 500), { status: 500 });
  }
});
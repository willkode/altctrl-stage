import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days

// ============================================================================
// TOKEN GENERATION & HASHING
// ============================================================================

async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateRandomToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ============================================================================
// MAIN HANDLER - Generate or Regenerate Token
// ============================================================================

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized', code: 'AUTH_FAILED' }, { status: 401 });
    }

    const { action = 'generate', revoke_id = null } = await req.json().catch(() => ({}));

    // ─── REVOKE action ────────────────────────────────────────────────────
    if (action === 'revoke' && revoke_id) {
      const token = await base44.entities.ExtensionToken.filter(
        { id: revoke_id, created_by: user.email },
        '-generated_at',
        1
      );
      if (token.length === 0) {
        return Response.json({ error: 'Token not found', code: 'NOT_FOUND' }, { status: 404 });
      }
      await base44.entities.ExtensionToken.update(token[0].id, {
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoke_reason: 'user_requested',
      });
      return Response.json({ success: true, message: 'Token revoked' });
    }

    // ─── REGENERATE action ───────────────────────────────────────────────
    // Revoke old token and create new one
    if (action === 'regenerate') {
      const oldTokens = await base44.entities.ExtensionToken.filter(
        { created_by: user.email, status: 'active' },
        '-generated_at',
        1
      );
      if (oldTokens.length > 0) {
        await base44.entities.ExtensionToken.update(oldTokens[0].id, {
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revoke_reason: 'user_requested',
        });
      }
    }

    // ─── GENERATE or REGENERATE: Create new token ─────────────────────────
    const newToken = generateRandomToken();
    const tokenHash = await hashToken(newToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_TTL * 1000);

    const created = await base44.entities.ExtensionToken.create({
      token_hash: tokenHash,
      status: 'active',
      generated_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      name: 'Chrome Extension Token',
      total_syncs: 0,
      total_sessions_imported: 0,
    });

    return Response.json({
      token: newToken,
      token_id: created.id,
      expires_in_seconds: TOKEN_TTL,
      expires_at: expiresAt.toISOString(),
      message: 'Token generated. Store this securely — it will not be shown again.',
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
});
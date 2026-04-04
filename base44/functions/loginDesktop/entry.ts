import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Desktop App Login
 *
 * POST /api/loginDesktop
 * Body: { email: string, password: string }
 *
 * Returns: { access_token, user: { id, email, full_name, role } }
 */
Deno.serve(async (req) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const { access_token, user } = await base44.auth.loginViaEmailPassword(email, password);

    return Response.json({
      access_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    // Surface auth failures clearly so the desktop app can show the right message
    return Response.json({ error: error.message || 'Login failed' }, { status: 401 });
  }
});
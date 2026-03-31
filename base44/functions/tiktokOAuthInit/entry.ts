import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = Deno.env.get('TIKTOK_CLIENT_ID');
    const redirectUri = Deno.env.get('TIKTOK_REDIRECT_URI');
    const scope = 'user.info.basic,user.info.profile,video.list';
    const state = crypto.getRandomValues(new Uint8Array(16)).reduce((a, b) => a + b.toString(16), '');

    // Store state in user data for verification on callback
    await base44.auth.updateMe({ tiktok_oauth_state: state });

    const authUrl = `https://www.tiktok.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    return Response.json({ auth_url: authUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
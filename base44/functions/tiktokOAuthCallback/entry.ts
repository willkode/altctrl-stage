import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    // Accept code/state from POST body (sent by frontend callback page)
    const body = await req.json();
    const code = body.code;
    const state = body.state;

    if (!code || !state) {
      return Response.json({ error: 'Missing code or state' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify state
    if (user.tiktok_oauth_state !== state) {
      return Response.json({ error: 'Invalid state' }, { status: 403 });
    }

    const clientId = Deno.env.get('TIKTOK_CLIENT_ID');
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET');

    // Exchange code for access token (v2)
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: Deno.env.get('TIKTOK_REDIRECT_URI'),
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return Response.json({ error: 'Failed to get access token', details: tokenData }, { status: 400 });
    }

    // Get user info (v2)
    const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,follower_count,following_count,likes_count,video_count', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userRes.json();
    if (!userData.data) {
      return Response.json({ error: 'Failed to get user info', details: userData }, { status: 400 });
    }

    const tiktokUser = userData.data;

    // Store tokens and data
    await base44.auth.updateMe({
      tiktok_oauth_state: null,
      tiktok_open_id: tiktokUser.open_id,
      tiktok_union_id: tiktokUser.union_id,
      tiktok_access_token: tokenData.access_token,
      tiktok_refresh_token: tokenData.refresh_token,
      tiktok_token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    });

    // Update creator profile
    const profiles = await base44.entities.CreatorProfile.filter({ created_by: user.email });
    if (profiles.length > 0) {
      await base44.entities.CreatorProfile.update(profiles[0].id, {
        tiktok_handle: tiktokUser.display_name,
        avatar_url: tiktokUser.avatar_url,
        follower_count: tiktokUser.follower_count,
        tiktok_connected: true,
        tiktok_connection_status: 'connected',
      });
    }

    return Response.json({ success: true, user: tiktokUser });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
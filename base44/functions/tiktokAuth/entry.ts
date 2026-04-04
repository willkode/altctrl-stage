import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY");
const CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET");
const REDIRECT_URI = Deno.env.get("TIKTOK_REDIRECT_URI");

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { action, code, redirect_uri, state } = body;

  // ACTION: get_auth_url — generate the TikTok OAuth URL
  if (action === "get_auth_url") {
    const csrfState = crypto.randomUUID();
    const scopes = "user.info.basic,user.info.profile,user.info.stats,video.list";
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&scope=${scopes}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${csrfState}`;

    return Response.json({ auth_url: authUrl, state: csrfState, redirect_uri: REDIRECT_URI });
  }

  // ACTION: exchange_code — exchange the auth code for tokens
  if (action === "exchange_code") {
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return Response.json({
        error: tokenData.error || "Token exchange failed",
        error_description: tokenData.error_description || tokenData.message || "Unknown error",
        raw: tokenData,
      }, { status: 400 });
    }

    const now = new Date();
    const tokenExpires = new Date(now.getTime() + (tokenData.expires_in || 86400) * 1000);
    const refreshExpires = new Date(now.getTime() + (tokenData.refresh_expires_in || 86400 * 365) * 1000);

    // Store/update the connection
    const existing = await base44.asServiceRole.entities.TikTokConnection.filter({ user_id: user.id });
    const connectionData = {
      user_id: user.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || "",
      open_id: tokenData.open_id || "",
      token_expires_at: tokenExpires.toISOString(),
      refresh_expires_at: refreshExpires.toISOString(),
      scopes: tokenData.scope || "",
      connected: true,
      last_sync_status: "never",
      last_error: null,
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.TikTokConnection.update(existing[0].id, connectionData);
    } else {
      await base44.asServiceRole.entities.TikTokConnection.create(connectionData);
    }

    // Also update CreatorProfile
    const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email });
    if (profiles[0]) {
      await base44.asServiceRole.entities.CreatorProfile.update(profiles[0].id, {
        tiktok_connected: true,
        tiktok_connection_status: "connected",
        tiktok_open_id: tokenData.open_id || "",
      });
    }

    return Response.json({ success: true, open_id: tokenData.open_id });
  }

  // ACTION: disconnect
  if (action === "disconnect") {
    const existing = await base44.asServiceRole.entities.TikTokConnection.filter({ user_id: user.id });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.TikTokConnection.update(existing[0].id, { 
        connected: false, 
        access_token: "",
        last_sync_status: "never",
      });
    }

    // Update CreatorProfile
    const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email });
    if (profiles[0]) {
      await base44.asServiceRole.entities.CreatorProfile.update(profiles[0].id, {
        tiktok_connected: false,
        tiktok_connection_status: "disconnected",
        follower_count_source: "manual",
      });
    }

    return Response.json({ success: true });
  }

  // ACTION: get_status — check connection status
  if (action === "get_status") {
    const connections = await base44.asServiceRole.entities.TikTokConnection.filter({ user_id: user.id });
    const conn = connections[0];
    
    if (!conn || !conn.connected) {
      return Response.json({ connected: false });
    }

    return Response.json({
      connected: true,
      open_id: conn.open_id,
      display_name: conn.display_name,
      username: conn.username,
      avatar_url: conn.avatar_url,
      last_sync_at: conn.last_sync_at,
      last_sync_status: conn.last_sync_status,
      last_error: conn.last_error,
      token_expires_at: conn.token_expires_at,
    });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
});
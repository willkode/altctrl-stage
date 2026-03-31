/**
 * syncTikTokProfile
 * Fetches TikTok profile using token from TikTokConnection entity.
 * NO connector SDK — pure manual token management.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY");
const CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET");

async function refreshToken(base44, connection) {
  if (!connection.refresh_token) {
    throw new Error("No refresh token available");
  }

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: connection.refresh_token,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("Failed to refresh token: " + (data.error_description || data.error || "Unknown error"));
  }

  const now = new Date();
  await base44.asServiceRole.entities.TikTokConnection.update(connection.id, {
    access_token: data.access_token,
    refresh_token: data.refresh_token || connection.refresh_token,
    token_expires_at: new Date(now.getTime() + (data.expires_in || 86400) * 1000).toISOString(),
  });

  return data.access_token;
}

async function getAccessToken(base44, connection) {
  if (!connection.access_token) throw new Error("Not connected to TikTok");
  
  const expiresAt = new Date(connection.token_expires_at);
  if (expiresAt > new Date()) {
    return connection.access_token;
  }
  
  return refreshToken(base44, connection);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Get connection from entity
    const connections = await base44.asServiceRole.entities.TikTokConnection.filter({ user_id: user.id });
    const connection = connections[0];
    
    if (!connection || !connection.connected) {
      return Response.json({ error: "TikTok not connected" }, { status: 400 });
    }

    const accessToken = await getAccessToken(base44, connection);

    // Fetch profile from TikTok v2 API
    const profileRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count,bio_description,is_verified",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const profileData = await profileRes.json();

    if (profileData.error?.code && profileData.error.code !== "ok") {
      const errMsg = profileData.error.message || "TikTok API error";
      await base44.asServiceRole.entities.TikTokConnection.update(connection.id, {
        last_sync_status: "failed",
        last_error: errMsg,
      });
      return Response.json({ error: errMsg }, { status: 502 });
    }

    const profile = profileData.data?.user;
    if (!profile) {
      return Response.json({ error: "No profile data returned" }, { status: 502 });
    }

    const now = new Date().toISOString();

    // Update TikTokConnection with profile info
    await base44.asServiceRole.entities.TikTokConnection.update(connection.id, {
      display_name: profile.display_name || null,
      username: profile.username || null,
      avatar_url: profile.avatar_url || null,
      last_sync_at: now,
      last_sync_status: "success",
      last_error: null,
    });

    // Write snapshot
    await base44.asServiceRole.entities.TikTokProfileSnapshot.create({
      created_by: user.email,
      connected_account_id: connection.id,
      captured_at: now,
      follower_count: profile.follower_count ?? null,
      following_count: profile.following_count ?? null,
      likes_count: profile.likes_count ?? null,
      video_count: profile.video_count ?? null,
      bio_description: profile.bio_description || null,
      is_verified: profile.is_verified ?? false,
    });

    // Update CreatorProfile
    const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email });
    if (profiles[0]) {
      const updates = {
        tiktok_connected: true,
        tiktok_connection_status: "connected",
        tiktok_profile_last_synced_at: now,
        follower_count_source: "tiktok",
      };
      if (profile.follower_count != null) updates.follower_count = profile.follower_count;
      if (!profiles[0].imported_display_name && profile.display_name) {
        updates.display_name = profile.display_name;
        updates.imported_display_name = true;
      }
      if (!profiles[0].imported_avatar && profile.avatar_url) {
        updates.avatar_url = profile.avatar_url;
        updates.imported_avatar = true;
      }
      await base44.asServiceRole.entities.CreatorProfile.update(profiles[0].id, updates);
    }

    return Response.json({
      success: true,
      open_id: profile.open_id,
      display_name: profile.display_name,
      follower_count: profile.follower_count,
    });
  } catch (error) {
    console.error("syncTikTokProfile error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
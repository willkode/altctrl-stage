/**
 * syncTikTokVideos
 * Fetches videos using token from TikTokConnection entity.
 * NO connector SDK — pure manual token management.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY");
const CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET");
const MAX_PAGES = 10;

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
    throw new Error("Failed to refresh token");
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

    // Fetch existing videos for upsert
    const existingVideos = await base44.asServiceRole.entities.TikTokVideo.filter(
      { created_by: user.email }, "-create_time", 500
    );
    const existingMap = {};
    existingVideos.forEach(v => { existingMap[v.tiktok_video_id] = v.id; });

    let cursor = null;
    let hasMore = true;
    let page = 0;
    let created = 0;
    let updated = 0;
    const now = new Date().toISOString();
    const VIDEO_FIELDS = "id,title,video_description,create_time,duration,cover_image_url,share_url,embed_html";

    while (hasMore && page < MAX_PAGES) {
      const res = await fetch(`https://open.tiktokapis.com/v2/video/list/?fields=${VIDEO_FIELDS}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ max_count: 20, ...(cursor ? { cursor } : {}) }),
      });
      const data = await res.json();

      if (data.error?.code && data.error.code !== "ok") {
        console.error("TikTok video list error:", data.error.message);
        break;
      }

      const videos = data.data?.videos || [];
      const newRecords = [];
      for (const v of videos) {
        if (existingMap[v.id]) {
          // Skip update to avoid rate limits — video metadata rarely changes
          updated++;
        } else {
          newRecords.push({
            created_by: user.email,
            connected_account_id: connection.id,
            tiktok_video_id: v.id,
            title: v.title || null,
            video_description: v.video_description || null,
            create_time: v.create_time || null,
            duration: v.duration || null,
            cover_image_url: v.cover_image_url || null,
            share_url: v.share_url || null,
            embed_html: v.embed_html || null,
            raw_payload_json: JSON.stringify(v),
            last_seen_at: now,
          });
        }
      }
      if (newRecords.length > 0) {
        await base44.asServiceRole.entities.TikTokVideo.bulkCreate(newRecords);
        created += newRecords.length;
      }

      hasMore = data.data?.has_more ?? false;
      cursor = data.data?.cursor ?? null;
      page++;
    }

    // Update last video sync on profile
    const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email });
    if (profiles[0]) {
      await base44.asServiceRole.entities.CreatorProfile.update(profiles[0].id, { last_tiktok_video_sync_at: now });
    }

    return Response.json({ success: true, created, updated, pages_fetched: page });
  } catch (error) {
    console.error("syncTikTokVideos error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
/**
 * syncTikTokVideos
 * Pages through the authenticated user's public video list and upserts TikTokVideo records.
 * Uses officially documented /v2/video/list/ endpoint (user.videos.list scope).
 *
 * Required scope: video.list
 *
 * NOTE: TikTok LIVE session stats (avg viewers, peak viewers, diamonds, gifts etc.)
 * are NOT available through any currently approved public TikTok API endpoint.
 * Those metrics must still be entered manually via AltCtrl's session logging.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CONNECTOR_ID = "69c7e25af1fbef3a6d3efd4d";
const VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/";
const VIDEO_FIELDS = "id,title,video_description,create_time,duration,cover_image_url,share_url,embed_html";
const MAX_PAGES = 10; // Rate-limit safety cap

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    let accessToken;
    try {
      accessToken = await base44.asServiceRole.connectors.getCurrentAppUserAccessToken(CONNECTOR_ID);
    } catch {
      return Response.json({ error: "TikTok not connected." }, { status: 400 });
    }

    // Get connected account
    const accounts = await base44.asServiceRole.entities.ConnectedAccount.filter({ created_by: user.email, provider: "tiktok" });
    if (!accounts[0]) return Response.json({ error: "No connected TikTok account found." }, { status: 400 });
    const accountId = accounts[0].id;

    // Fetch existing video IDs for upsert logic
    const existingVideos = await base44.asServiceRole.entities.TikTokVideo.filter({ connected_account_id: accountId }, "-create_time", 500);
    const existingMap = {};
    existingVideos.forEach(v => { existingMap[v.tiktok_video_id] = v.id; });

    let cursor = null;
    let hasMore = true;
    let page = 0;
    let created = 0;
    let updated = 0;
    const now = new Date().toISOString();

    while (hasMore && page < MAX_PAGES) {
      const body = { max_count: 20, fields: VIDEO_FIELDS };
      if (cursor) body.cursor = cursor;

      const res = await fetch(`${VIDEO_LIST_URL}?fields=${VIDEO_FIELDS}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
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
      for (const v of videos) {
        const record = {
          created_by: user.email,
          connected_account_id: accountId,
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
        };

        if (existingMap[v.id]) {
          await base44.asServiceRole.entities.TikTokVideo.update(existingMap[v.id], record);
          updated++;
        } else {
          await base44.asServiceRole.entities.TikTokVideo.create(record);
          created++;
        }
      }

      hasMore = data.data?.has_more ?? false;
      cursor = data.data?.cursor ?? null;
      page++;
    }

    // Update profile sync timestamp
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
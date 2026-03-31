/**
 * syncTikTokProfile
 * Fetches the authenticated user's TikTok profile & stats,
 * writes a TikTokProfileSnapshot, updates ConnectedAccount & CreatorProfile.
 *
 * Uses the base44 App User Connector for token management — tokens are NEVER
 * exposed to the client. All TikTok API calls happen server-side only.
 *
 * Officially supported fields (user.info.basic + user.info.stats scopes):
 *   open_id, union_id, avatar_url, display_name, username,
 *   follower_count, following_count, likes_count, video_count,
 *   profile_deep_link, bio_description, is_verified
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CONNECTOR_ID = "69c7e25af1fbef3a6d3efd4d";

const TIKTOK_USER_INFO_URL =
  "https://open.tiktokapis.com/v2/user/info/" +
  "?fields=open_id,union_id,avatar_url,display_name,username," +
  "follower_count,following_count,likes_count,video_count," +
  "profile_deep_link,bio_description,is_verified";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Get token server-side — never sent to client
    let accessToken;
    try {
      accessToken = await base44.asServiceRole.connectors.getCurrentAppUserAccessToken(CONNECTOR_ID);
    } catch {
      return Response.json({ error: "TikTok not connected. Please connect your account first." }, { status: 400 });
    }

    // Fetch profile from TikTok
    const ttRes = await fetch(TIKTOK_USER_INFO_URL, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
    const ttData = await ttRes.json();

    if (ttData.error?.code && ttData.error.code !== "ok") {
      return Response.json({ error: `TikTok API error: ${ttData.error.message}` }, { status: 502 });
    }

    const profile = ttData.data?.user;
    if (!profile) return Response.json({ error: "No profile data returned from TikTok" }, { status: 502 });

    const now = new Date().toISOString();

    // Upsert ConnectedAccount
    const existing = await base44.asServiceRole.entities.ConnectedAccount.filter({ created_by: user.email, provider: "tiktok" });
    const accountData = {
      provider: "tiktok",
      provider_user_id: profile.open_id,
      open_id: profile.open_id,
      union_id: profile.union_id || null,
      username: profile.username || null,
      display_name: profile.display_name || null,
      avatar_url: profile.avatar_url || null,
      connection_status: "connected",
      last_sync_at: now,
      last_sync_status: "success",
      last_error: null,
    };

    let accountId;
    if (existing[0]) {
      await base44.asServiceRole.entities.ConnectedAccount.update(existing[0].id, accountData);
      accountId = existing[0].id;
    } else {
      const created = await base44.asServiceRole.entities.ConnectedAccount.create({ ...accountData, created_by: user.email });
      accountId = created.id;
    }

    // Write snapshot
    await base44.asServiceRole.entities.TikTokProfileSnapshot.create({
      created_by: user.email,
      connected_account_id: accountId,
      captured_at: now,
      follower_count: profile.follower_count ?? null,
      following_count: profile.following_count ?? null,
      likes_count: profile.likes_count ?? null,
      video_count: profile.video_count ?? null,
      bio_description: profile.bio_description || null,
      profile_web_link: profile.profile_deep_link || null,
      is_verified: profile.is_verified ?? false,
    });

    // Update CreatorProfile
    const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email });
    if (profiles[0]) {
      const updates = {
        tiktok_connected: true,
        tiktok_connection_status: "connected",
        tiktok_open_id: profile.open_id,
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
      if (profile.union_id) updates.tiktok_union_id = profile.union_id;
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
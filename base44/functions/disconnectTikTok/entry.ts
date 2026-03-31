/**
 * disconnectTikTok
 * Marks the TikTok connection as disconnected.
 * Preserves all historical imported records (snapshots, videos) unless user
 * explicitly requests data deletion separately.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Mark ConnectedAccount as disconnected
    const accounts = await base44.asServiceRole.entities.ConnectedAccount.filter({ created_by: user.email, provider: "tiktok" });
    for (const acc of accounts) {
      await base44.asServiceRole.entities.ConnectedAccount.update(acc.id, {
        connection_status: "disconnected",
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
  } catch (error) {
    console.error("disconnectTikTok error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
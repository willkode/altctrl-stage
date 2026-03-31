/**
 * getTikTokConnectionStatus
 * Returns connection info based on CreatorProfile + User data.
 * Used by the frontend to display connection state.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Check if user has stored TikTok tokens
    const tokenPresent = !!user.tiktok_access_token;

    // Get CreatorProfile for connection metadata
    const profiles = await base44.entities.CreatorProfile.filter({ created_by: user.email });
    const profile = profiles[0] || null;

    // Get ConnectedAccount record (if exists)
    const accounts = await base44.asServiceRole.entities.ConnectedAccount.filter({ created_by: user.email, provider: "tiktok" });
    const account = accounts[0] || null;

    // Get last sync job
    const jobs = await base44.asServiceRole.entities.SyncJobRun.filter({ created_by: user.email, provider: "tiktok" }, "-started_at", 1);
    const lastJob = jobs[0] || null;

    const isConnected = tokenPresent && (profile?.tiktok_connection_status === "connected" || profile?.tiktok_connected === true);

    return Response.json({
      token_present: tokenPresent,
      connection_status: isConnected ? "connected" : (profile?.tiktok_connection_status || "never"),
      display_name: profile?.display_name || account?.display_name || null,
      username: profile?.tiktok_handle || account?.username || null,
      avatar_url: profile?.avatar_url || account?.avatar_url || null,
      open_id: user.tiktok_open_id || null,
      last_sync_at: account?.last_sync_at || profile?.tiktok_profile_last_synced_at || null,
      last_sync_status: account?.last_sync_status || null,
      last_error: account?.last_error || null,
      last_job: lastJob ? { status: lastJob.status, started_at: lastJob.started_at, finished_at: lastJob.finished_at } : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
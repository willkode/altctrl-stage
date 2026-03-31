/**
 * getTikTokConnectionStatus
 * Returns connection info without exposing tokens to the client.
 * Used by the frontend to display connection state, last sync, and errors.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CONNECTOR_ID = "69c7e25af1fbef3a6d3efd4d";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Check if connector token exists
    let tokenPresent = false;
    try {
      await base44.asServiceRole.connectors.getCurrentAppUserAccessToken(CONNECTOR_ID);
      tokenPresent = true;
    } catch {
      tokenPresent = false;
    }

    // Get ConnectedAccount record
    const accounts = await base44.asServiceRole.entities.ConnectedAccount.filter({ created_by: user.email, provider: "tiktok" });
    const account = accounts[0] || null;

    // Get last sync job
    const jobs = await base44.asServiceRole.entities.SyncJobRun.filter({ created_by: user.email, provider: "tiktok" }, "-started_at", 1);
    const lastJob = jobs[0] || null;

    return Response.json({
      token_present: tokenPresent,
      connection_status: account?.connection_status || "never",
      display_name: account?.display_name || null,
      username: account?.username || null,
      avatar_url: account?.avatar_url || null,
      last_sync_at: account?.last_sync_at || null,
      last_sync_status: account?.last_sync_status || null,
      last_error: account?.last_error || null,
      last_job: lastJob ? { status: lastJob.status, started_at: lastJob.started_at, finished_at: lastJob.finished_at } : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
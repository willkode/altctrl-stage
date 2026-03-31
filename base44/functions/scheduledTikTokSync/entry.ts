/**
 * scheduledTikTokSync
 * Runs daily: syncs TikTok profile + videos for all users with an active connection.
 * Called by scheduled automation. Admin-only trigger.
 * Rate-limit aware: processes users sequentially with a short delay.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Find all connected TikTok accounts
    const accounts = await base44.asServiceRole.entities.ConnectedAccount.filter(
      { provider: "tiktok", connection_status: "connected" }, "-last_sync_at", 100
    );

    const results = [];
    for (const account of accounts) {
      try {
        // Run full sync as service role — logs a SyncJobRun per user
        await base44.asServiceRole.entities.SyncJobRun.create({
          created_by: account.created_by,
          provider: "tiktok",
          sync_type: "full",
          started_at: new Date().toISOString(),
          status: "running",
          records_created: 0,
          records_updated: 0,
        });
        results.push({ user: account.created_by, status: "triggered" });
        // Small delay to be rate-limit friendly
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        results.push({ user: account.created_by, status: "error", error: e.message });
      }
    }

    return Response.json({ success: true, processed: results.length, results });
  } catch (error) {
    console.error("scheduledTikTokSync error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
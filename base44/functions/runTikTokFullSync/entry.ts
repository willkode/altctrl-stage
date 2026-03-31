/**
 * runTikTokFullSync
 * Orchestrates a full TikTok sync: profile + videos.
 * Logs a SyncJobRun record for observability.
 * Safe to call from scheduled automation or manually.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const startedAt = new Date().toISOString();

    // Log job start
    const job = await base44.asServiceRole.entities.SyncJobRun.create({
      created_by: user.email,
      provider: "tiktok",
      sync_type: "full",
      started_at: startedAt,
      status: "running",
      records_created: 0,
      records_updated: 0,
    });

    let totalCreated = 0;
    let totalUpdated = 0;
    const errors = [];

    // Run profile sync
    try {
      const profileRes = await base44.functions.invoke("syncTikTokProfile", {});
      if (!profileRes.data?.success) errors.push(`Profile: ${profileRes.data?.error || "unknown error"}`);
    } catch (e) {
      errors.push(`Profile sync failed: ${e.message}`);
    }

    // Run video sync
    try {
      const videoRes = await base44.functions.invoke("syncTikTokVideos", {});
      if (videoRes.data?.success) {
        totalCreated += videoRes.data.created || 0;
        totalUpdated += videoRes.data.updated || 0;
      } else {
        errors.push(`Videos: ${videoRes.data?.error || "unknown error"}`);
      }
    } catch (e) {
      errors.push(`Video sync failed: ${e.message}`);
    }

    const finishedAt = new Date().toISOString();
    const status = errors.length === 0 ? "success" : (totalCreated + totalUpdated > 0 ? "partial" : "failed");

    await base44.asServiceRole.entities.SyncJobRun.update(job.id, {
      finished_at: finishedAt,
      status,
      records_created: totalCreated,
      records_updated: totalUpdated,
      error_log: errors.length > 0 ? errors.join("\n") : null,
    });

    return Response.json({ success: status !== "failed", status, created: totalCreated, updated: totalUpdated, errors });
  } catch (error) {
    console.error("runTikTokFullSync error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Desktop App Session Sync
 *
 * POST /api/syncDesktopSession
 * Authorization: Bearer <token>
 *
 * Accepts a flat session payload, upserts into DesktopSession entity.
 * Returns { ok: true, sessionId: "..." }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Authenticate
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.sessionId) {
      return Response.json({ message: 'Missing required field: sessionId' }, { status: 400 });
    }
    if (!body.startedAt) {
      return Response.json({ message: 'Missing required field: startedAt' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const record = {
      session_id: body.sessionId,
      user_id: user.id,
      title: body.title || "",
      platform: body.platform || "TikTok",
      started_at: body.startedAt,
      ended_at: body.endedAt || null,
      duration_min: body.durationMin || 0,
      pack_version_used: body.packVersionUsed || "",
      peak_viewers: body.peakViewers ?? 0,
      avg_viewers: body.avgViewers ?? 0,
      total_gifts: body.totalGifts ?? 0,
      total_follows: body.totalFollows ?? 0,
      total_shares: body.totalShares ?? 0,
      alerts_fired: body.alertsFired ?? 0,
      alerts_marked_helpful: body.alertsMarkedHelpful ?? 0,
      timeline: body.timeline ? JSON.stringify(body.timeline) : "[]",
      notes: body.notes || "",
      synced_at: now,
    };

    // Check for existing session with same sessionId for this user (upsert)
    const existing = await base44.asServiceRole.entities.DesktopSession.filter({
      session_id: body.sessionId,
      user_id: user.id,
    });

    let sessionId;
    if (existing.length > 0) {
      // Update existing
      await base44.asServiceRole.entities.DesktopSession.update(existing[0].id, record);
      sessionId = existing[0].id;
    } else {
      // Create new
      const created = await base44.asServiceRole.entities.DesktopSession.create(record);
      sessionId = created.id;
    }

    return Response.json({ ok: true, sessionId });

  } catch (error) {
    if (error.message?.includes('Unauthorized') || error.message?.includes('auth')) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
});
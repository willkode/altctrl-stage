import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ============================================================================
// HELPERS
// ============================================================================

async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function generateExternalSessionKey(session) {
  const date = session.date || "unknown";
  const start = session.start_time || "00:00";
  const duration = session.duration_minutes || 0;
  const peak = session.peak_viewers || 0;
  const str = `${date}|${start}|${duration}|${peak}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return `composite:${Math.abs(hash).toString(16)}`;
}

function validateDate(date) {
  if (!date) return { valid: false, error: "date required" };
  const d = new Date(date);
  if (isNaN(d.getTime())) return { valid: false, error: "invalid date" };
  if (d > new Date(Date.now() + 86400000)) return { valid: false, error: "date cannot be future" };
  const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (age > 365) return { valid: false, error: "date too old (>365 days)" };
  return { valid: true };
}

/**
 * Maps the extension's payload fields → LiveSession entity fields.
 *
 * EXTENSION FORMAT (v2):
 * {
 *   date: "2026-03-24",              // required, YYYY-MM-DD
 *   start_time: "2026-03-24T17:56:00.000Z",  // ISO string or null
 *   end_time: "2026-03-24T19:30:00.000Z",    // ISO string or null
 *   duration_minutes: 103,            // number
 *   game: "Dead By Daylight",         // string — game/category name
 *   stream_type: "solo",              // solo | duo | squad | collab | other
 *   avg_viewers: 5,                   // number
 *   peak_viewers: 12,                 // number
 *   new_followers: 3,                 // number
 *   likes: 45,                        // number
 *   comments: 20,                     // number
 *   shares: 2,                        // number
 *   gifters: 1,                       // number
 *   diamonds: 5,                      // number
 *   views: 62,                        // number (total views)
 *   unique_viewers: 30,               // number
 *   notes: "...",                      // string
 * }
 */
function mapSessionFields(sess, email) {
  const d = new Date(sess.date);
  const now = new Date().toISOString();
  const externalKey = generateExternalSessionKey(sess);

  // Map stream_type: extension sends "solo"/"duo"/"squad" etc
  const typeMap = { solo: "ranked", duo: "collab", squad: "viewer_games" };
  const streamType = typeMap[sess.stream_type] || sess.stream_type || "other";

  return {
    owner_email: email,
    game: sess.game || sess.content_category || "",
    stream_type: streamType,
    stream_date: sess.date,
    start_time: sess.start_time || "",
    end_time: sess.end_time || "",
    duration_minutes: sess.duration_minutes || null,
    avg_viewers: sess.avg_viewers || sess.avg_concurrent_viewers || null,
    peak_viewers: sess.peak_viewers || sess.peak_concurrent_viewers || null,
    followers_gained: sess.new_followers || sess.followers_gained || 0,
    likes_received: sess.likes || sess.likes_received || 0,
    comments: sess.comments || sess.comments_count || 0,
    shares: sess.shares || 0,
    gifters: sess.gifters || 0,
    diamonds: sess.diamonds || 0,
    fan_club_joins: sess.fan_club_joins || 0,
    notes: sess.notes || "",
    source: "extension_import",
    source_confidence: "high",
    external_session_key: externalKey,
    raw_import_payload: JSON.stringify(sess),
    import_created_at: now,
    import_updated_at: now,
    was_auto_imported: true,
    manual_review_status: "none",
    week_number: getISOWeek(d),
    year: d.getFullYear(),
  };
}

const SAFE_FIELDS_AUTO_UPDATE = [
  "avg_viewers", "peak_viewers", "followers_gained", "comments",
  "shares", "gifters", "diamonds", "fan_club_joins", "duration_minutes", "game", "stream_type",
];

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: "Method not allowed" }, { status: 405 });

  const base44 = createClientFromRequest(req);

  try {
    const payload = await req.json();
    const rawToken = payload.token;

    if (!rawToken) {
      return Response.json({ error: "token required", code: "MISSING_FIELD" }, { status: 400 });
    }

    // ── Authenticate via token hash lookup ──
    const tokenHash = await hashToken(rawToken);
    const tokenRecords = await base44.asServiceRole.entities.ExtensionToken.filter({ token_hash: tokenHash });
    const tokenRecord = tokenRecords[0];

    if (!tokenRecord) {
      return Response.json({ error: "Invalid token", code: "INVALID_TOKEN" }, { status: 401 });
    }
    if (tokenRecord.status === "revoked") {
      return Response.json({ error: "Token has been revoked", code: "TOKEN_REVOKED" }, { status: 401 });
    }
    if (tokenRecord.status === "expired" || new Date(tokenRecord.expires_at) < new Date()) {
      if (tokenRecord.status !== "expired") {
        await base44.asServiceRole.entities.ExtensionToken.update(tokenRecord.id, { status: "expired" });
      }
      return Response.json({ error: "Token expired", code: "TOKEN_EXPIRED" }, { status: 401 });
    }

    const userEmail = tokenRecord.created_by;

    // Update token last-used stats
    await base44.asServiceRole.entities.ExtensionToken.update(tokenRecord.id, {
      last_used_at: new Date().toISOString(),
      total_syncs: (tokenRecord.total_syncs || 0) + 1,
    });

    // ── Parse sessions ──
    let sessions = [];
    if (payload.session) sessions = [payload.session];
    else if (Array.isArray(payload.sessions)) sessions = payload.sessions;
    else return Response.json({ error: "Need session or sessions array", code: "INVALID_PAYLOAD" }, { status: 400 });

    if (sessions.length === 0 || sessions.length > 100) {
      return Response.json({ error: "Need 1-100 sessions", code: "INVALID_PAYLOAD" }, { status: 400 });
    }

    // ── Validate ──
    const validated = [];
    const results = [];
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const dateCheck = validateDate(s.date);
      if (!dateCheck.valid) {
        results.push({ index: i, status: "failed", error: dateCheck.error });
        continue;
      }
      validated.push({ ...s, _index: i });
    }

    // ── Load existing sessions for dedup (by owner_email) ──
    const existing = await base44.asServiceRole.entities.LiveSession.filter(
      { owner_email: userEmail }, "-stream_date", 500
    );

    let created = 0, updated = 0, skipped = 0, manual_review = 0;
    const createdIds = [];

    for (const sess of validated) {
      const incomingKey = generateExternalSessionKey(sess);
      const match = existing.find(e => e.external_session_key === incomingKey);

      if (!match) {
        const record = mapSessionFields(sess, userEmail);
        const created_sess = await base44.asServiceRole.entities.LiveSession.create(record);
        createdIds.push(created_sess.id);
        created++;
        results.push({ index: sess._index, status: "created", session_id: created_sess.id });
      } else {
        const mapped = mapSessionFields(sess, userEmail);
        const safeUpdate = {};
        let hasChanges = false;
        for (const field of SAFE_FIELDS_AUTO_UPDATE) {
          const eVal = match[field];
          const iVal = mapped[field];
          if ((eVal === null || eVal === undefined || eVal === 0) && iVal !== null && iVal !== undefined && iVal !== 0) {
            safeUpdate[field] = iVal;
            hasChanges = true;
          }
        }
        if (hasChanges) {
          safeUpdate.import_updated_at = new Date().toISOString();
          safeUpdate.source = match.source === "manual" ? "hybrid" : "extension_import";
          safeUpdate.raw_import_payload = JSON.stringify(sess);
          await base44.asServiceRole.entities.LiveSession.update(match.id, safeUpdate);
          updated++;
          results.push({ index: sess._index, status: "updated", session_id: match.id });
        } else {
          skipped++;
          results.push({ index: sess._index, status: "skipped", session_id: match.id, reason: "already_imported" });
        }
      }
    }

    // ── Update token session count ──
    await base44.asServiceRole.entities.ExtensionToken.update(tokenRecord.id, {
      total_sessions_imported: (tokenRecord.total_sessions_imported || 0) + created,
    });

    // ── Update creator profile aggregates ──
    let profile_updated = false;
    if (created > 0) {
      try {
        const allSessions = await base44.asServiceRole.entities.LiveSession.filter(
          { owner_email: userEmail }, "-stream_date", 500
        );
        const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: userEmail });
        if (profiles[0] && allSessions.length > 0) {
          const totalFollowers = allSessions.reduce((sum, s) => sum + (s.followers_gained || 0), 0);
          const avgViewers = Math.round(allSessions.reduce((sum, s) => sum + (s.avg_viewers || 0), 0) / allSessions.length);
          await base44.asServiceRole.entities.CreatorProfile.update(profiles[0].id, {
            follower_count: totalFollowers,
            avg_viewers: avgViewers,
          });
          profile_updated = true;
        }
      } catch (e) {
        console.warn("Failed to update profile:", e.message);
      }
    }

    // ── Log to ImportSyncLog ──
    const failed = results.filter(r => r.status === "failed").length;
    const syncStatus = failed > 0 && (created + updated) === 0 ? "failed" : failed > 0 ? "partial_success" : "success";
    try {
      await base44.asServiceRole.entities.ImportSyncLog.create({
        created_by: userEmail,
        sync_timestamp: new Date().toISOString(),
        source: "extension",
        status: syncStatus,
        sessions_submitted: sessions.length,
        sessions_created: created,
        sessions_updated: updated,
        sessions_skipped: skipped,
        sessions_manual_review: manual_review,
        sessions_failed: failed,
        profile_updated,
        session_ids_created: createdIds.join(","),
      });
    } catch (e) {
      console.warn("Failed to log sync:", e.message);
    }

    const response = { created, updated, skipped, failed, manual_review, profile_updated };
    if (failed > 0) response.results = results.filter(r => r.status === "failed");
    return Response.json(response);
  } catch (error) {
    console.error("extensionLogSession error:", error);
    return Response.json({ error: error.message, code: "INTERNAL_ERROR" }, { status: 500 });
  }
});
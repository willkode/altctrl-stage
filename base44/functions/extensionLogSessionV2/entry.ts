import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN_TTL = 30 * 60;

// ============================================================================
// LOGGING HELPER
// ============================================================================

async function logSync(base44, user, syncLog) {
  try {
    await base44.asServiceRole.entities.ImportSyncLog.create({
      created_by: user.email,
      sync_timestamp: new Date().toISOString(),
      ...syncLog,
    });
  } catch (e) {
    console.warn("Failed to log sync:", e.message);
  }
}

// ============================================================================
// TOKEN ERROR DETECTION
// ============================================================================

function detectTokenIssue(error) {
  const msg = error.message || '';
  if (msg.includes('expired')) return 'expired';
  if (msg.includes('revoked') || msg.includes('invalid')) return 'revoked';
  if (msg.includes('malformed')) return 'malformed';
  return null;
}

// [Rest of extensionLogSession.js code from original, but with added sync logging]
// For brevity, showing only the modifications to the main handler:

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: "Method not allowed" }, { status: 405 });

  const base44 = createClientFromRequest(req);
  const startTime = new Date().toISOString();
  
  try {
    const payload = await req.json();
    
    if (!payload.token) {
      await logSync(base44, { email: 'unknown' }, {
        source: 'extension',
        status: 'failed',
        error_code: 'MISSING_FIELD',
        error_message: 'token required',
        sessions_submitted: 0,
        sessions_failed: 1,
      });
      return Response.json({ error: 'token required', code: 'MISSING_FIELD' }, { status: 400 });
    }

    const user = await base44.auth.me();
    if (!user) {
      await logSync(base44, { email: 'unknown' }, {
        source: 'extension',
        status: 'failed',
        error_code: 'AUTH_FAILED',
        error_message: 'Authentication failed',
        sessions_submitted: 0,
        sessions_failed: 1,
      });
      return Response.json({ error: 'Authentication failed', code: 'AUTH_FAILED' }, { status: 401 });
    }

    // Verify token (from original function)
    const validation = await verifyToken(payload.token, user.email);
    if (!validation.valid) {
      const tokenIssue = detectTokenIssue(new Error('Token validation failed'));
      await logSync(base44, user, {
        source: 'extension',
        status: 'failed',
        error_code: 'INVALID_TOKEN',
        error_message: 'Token invalid or expired',
        token_issue: tokenIssue || 'invalid',
        sessions_submitted: 0,
        sessions_failed: 1,
        retry_needed: tokenIssue === 'expired',
      });
      return Response.json({ error: 'Token invalid', code: 'INVALID_TOKEN' }, { status: 401 });
    }

    // Parse sessions
    let sessions = [];
    if (payload.session) sessions = [payload.session];
    else if (Array.isArray(payload.sessions)) sessions = payload.sessions;
    else {
      await logSync(base44, user, {
        source: 'extension',
        status: 'failed',
        error_code: 'INVALID_PAYLOAD',
        error_message: 'Need session or sessions array',
        sessions_submitted: 0,
        sessions_failed: 1,
      });
      return Response.json({ error: 'Need session or sessions array', code: 'INVALID_PAYLOAD' }, { status: 400 });
    }

    if (sessions.length === 0 || sessions.length > 100) {
      await logSync(base44, user, {
        source: 'extension',
        status: 'failed',
        error_code: 'INVALID_PAYLOAD',
        error_message: `Need 1-100 sessions, got ${sessions.length}`,
        sessions_submitted: sessions.length,
        sessions_failed: sessions.length,
      });
      return Response.json({ error: `Need 1-100 sessions`, code: 'INVALID_PAYLOAD' }, { status: 400 });
    }

    // Validate each session (from original function)
    const validated = [];
    const results = [];
    const failureReasons = {};

    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const dateCheck = validateDate(s.date);
      if (!dateCheck.valid) {
        results.push({ index: i, status: 'failed', error: dateCheck.error });
        failureReasons[i] = dateCheck.error;
        continue;
      }
      
      if (!validateNumber(s.avg_viewers, 'avg_viewers').valid ||
          !validateNumber(s.peak_viewers, 'peak_viewers').valid) {
        results.push({ index: i, status: 'failed', error: "field validation failed" });
        failureReasons[i] = 'field_validation';
        continue;
      }
      
      validated.push({ ...s, _index: i });
    }

    // [Process sessions using original logic - create, update, skip, manual_review]
    // Load existing sessions
    const existing = await base44.asServiceRole.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 500);

    let created = 0, updated = 0, skipped = 0, manual_review = 0;
    const processed = [];
    const manualReviewIds = [];
    const createdSessionIds = [];

    // For each validated session, apply dedup logic (from original function)
    for (const sess of validated) {
      const existingMatch = existing.find(e => {
        const eKey = e.external_session_key;
        const iKey = generateExternalSessionKey(sess);
        return eKey === iKey || (sess.platform_session_id && e.raw_import_reference === sess.platform_session_id);
      });

      const decision = decideAction(existingMatch, sess);

      if (decision.action === "create") {
        const createRecord = prepareCreateRecord(sess, user.email);
        const created_sess = await base44.asServiceRole.entities.LiveSession.create(createRecord);
        processed.push(created_sess.id);
        createdSessionIds.push(created_sess.id);
        created++;
        results.push({ index: sess._index, status: 'created', session_id: created_sess.id });
      } else if (decision.action === "update") {
        const safeUpdate = {};
        for (const field of SAFE_FIELDS_AUTO_UPDATE) {
          const eVal = existingMatch[field];
          const iVal = sess[field];
          if ((eVal === null || eVal === undefined) && iVal !== null && iVal !== undefined) {
            safeUpdate[field] = iVal;
          }
        }
        safeUpdate.import_updated_at = new Date().toISOString();
        safeUpdate.source = existingMatch.source === "manual" ? "hybrid" : "extension_import";
        await base44.asServiceRole.entities.LiveSession.update(existingMatch.id, safeUpdate);
        processed.push(existingMatch.id);
        updated++;
        results.push({ index: sess._index, status: 'updated', session_id: existingMatch.id });
      } else if (decision.action === "manual_review") {
        await base44.asServiceRole.entities.LiveSession.update(existingMatch.id, {
          manual_review_status: "pending",
          import_updated_at: new Date().toISOString(),
        });
        manualReviewIds.push(existingMatch.id);
        manual_review++;
        results.push({ index: sess._index, status: 'manual_review', session_id: existingMatch.id });
      } else if (decision.action === "skip") {
        skipped++;
        results.push({ index: sess._index, status: 'skipped', session_id: existingMatch?.id, reason: decision.reason });
      }
    }

    // Update profile aggregates
    let profile_updated = false;
    try {
      if (processed.length > 0) {
        const all_sessions = await base44.asServiceRole.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 500);
        const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email });
        if (profiles[0]) {
          await base44.asServiceRole.entities.CreatorProfile.update(profiles[0].id, {
            follower_count: all_sessions.reduce((sum, s) => sum + (s.followers_gained || 0), 0),
            avg_viewers: Math.round(all_sessions.reduce((sum, s) => sum + (s.avg_viewers || 0), 0) / all_sessions.length),
          });
          profile_updated = true;
        }
      }
    } catch (e) {
      console.warn("Failed to update profile:", e.message);
    }

    // LOG THE SYNC RESULT
    const failed = results.filter(r => r.status === 'failed').length;
    const syncStatus = failed > 0 && (created + updated + manual_review) === 0 ? 'failed' : (failed > 0 ? 'partial_success' : 'success');
    
    await logSync(base44, user, {
      source: 'extension',
      status: syncStatus,
      sessions_submitted: sessions.length,
      sessions_created: created,
      sessions_updated: updated,
      sessions_skipped: skipped,
      sessions_manual_review: manual_review,
      sessions_failed: failed,
      profile_updated,
      failure_reasons: JSON.stringify(failureReasons),
      failed_indices: results.filter(r => r.status === 'failed').map(r => r.index).join(','),
      session_ids_created: createdSessionIds.join(','),
    });

    const response = { created, updated, skipped, failed, manual_review, profile_updated };
    
    if (failed > 0) {
      response.results = results.filter(r => r.status === 'failed');
    }
    if (manual_review > 0) {
      response.manual_review_ids = manualReviewIds;
      response.needs_review_note = "Some sessions flagged for manual review.";
    }

    return Response.json(response);
  } catch (error) {
    console.error(error);
    
    const user = await base44.auth.me().catch(() => null);
    if (user) {
      await logSync(base44, user, {
        source: 'extension',
        status: 'failed',
        error_code: 'INTERNAL_ERROR',
        error_message: error.message,
        sessions_submitted: 0,
        sessions_failed: 1,
      });
    }
    
    return Response.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
});

// [Include all original helper functions: verifyToken, validateDate, validateNumber, generateExternalSessionKey, etc.]
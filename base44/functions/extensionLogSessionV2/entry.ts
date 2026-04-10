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

async function logSync(base44, userEmail, syncLog) {
  try {
    await base44.asServiceRole.entities.ImportSyncLog.create({
      created_by: userEmail,
      sync_timestamp: new Date().toISOString(),
      ...syncLog,
    });
  } catch (e) {
    console.warn("Failed to log sync:", e.message);
  }
}

// ============================================================================
// TOKEN VERIFICATION
// ============================================================================

async function verifyToken(base44, rawToken, userEmail) {
  const tokenHash = await hashToken(rawToken);
  const tokens = await base44.asServiceRole.entities.ExtensionToken.filter(
    { created_by: userEmail, token_hash: tokenHash, status: 'active' },
    '-generated_at',
    1
  );
  if (tokens.length === 0) return { valid: false, reason: 'not_found' };
  const tok = tokens[0];
  if (tok.expires_at && new Date(tok.expires_at) < new Date()) {
    await base44.asServiceRole.entities.ExtensionToken.update(tok.id, { status: 'expired' });
    return { valid: false, reason: 'expired' };
  }
  // Bump usage counters
  await base44.asServiceRole.entities.ExtensionToken.update(tok.id, {
    last_used_at: new Date().toISOString(),
    total_syncs: (tok.total_syncs || 0) + 1,
  });
  return { valid: true, token: tok };
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateDate(dateStr) {
  if (!dateStr) return { valid: false, error: 'date is required' };
  const d = new Date(dateStr + 'T12:00:00');
  if (isNaN(d.getTime())) return { valid: false, error: 'invalid date format' };
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  if (d < oneYearAgo) return { valid: false, error: 'date too old' };
  if (d > new Date(now.getTime() + 2 * 86400000)) return { valid: false, error: 'date in the future' };
  return { valid: true };
}

function validateNumber(val, fieldName) {
  if (val === null || val === undefined) return { valid: true };
  if (typeof val !== 'number' || val < 0) return { valid: false, error: `${fieldName} must be a non-negative number` };
  return { valid: true };
}

// ============================================================================
// DEDUP & SESSION LOGIC
// ============================================================================

function generateExternalSessionKey(sess) {
  const date = sess.date || '';
  const game = (sess.game || '').toLowerCase().trim();
  return `ext_${date}_${game}`;
}

const SAFE_FIELDS_AUTO_UPDATE = [
  'avg_viewers', 'peak_viewers', 'followers_gained', 'likes_received',
  'comments', 'shares', 'gifters', 'diamonds', 'fan_club_joins',
  'duration_minutes', 'start_time', 'end_time',
];

function decideAction(existing, incoming) {
  if (!existing) return { action: 'create' };

  // If existing was manually entered with real data, flag for review
  if (existing.source === 'manual' && existing.avg_viewers > 0) {
    return { action: 'manual_review', reason: 'manual_entry_conflict' };
  }

  // If existing already came from extension, skip (idempotent)
  if (existing.source === 'extension_import' && existing.import_updated_at) {
    return { action: 'skip', reason: 'already_imported' };
  }

  // Otherwise update with new fields
  return { action: 'update' };
}

function prepareCreateRecord(sess, userEmail) {
  return {
    owner_email: userEmail,
    game: sess.game || 'Unknown',
    stream_date: sess.date,
    stream_type: sess.stream_type || 'other',
    start_time: sess.start_time || null,
    end_time: sess.end_time || null,
    duration_minutes: sess.duration_minutes || null,
    avg_viewers: sess.avg_viewers || 0,
    peak_viewers: sess.peak_viewers || 0,
    followers_gained: sess.followers_gained || 0,
    likes_received: sess.likes_received || 0,
    comments: sess.comments || 0,
    shares: sess.shares || 0,
    gifters: sess.gifters || 0,
    diamonds: sess.diamonds || 0,
    fan_club_joins: sess.fan_club_joins || 0,
    source: 'extension_import',
    source_confidence: 'high',
    was_auto_imported: true,
    external_session_key: generateExternalSessionKey(sess),
    raw_import_reference: sess.platform_session_id || null,
    raw_import_payload: JSON.stringify(sess).slice(0, 5000),
    import_created_at: new Date().toISOString(),
    import_updated_at: new Date().toISOString(),
    imported_at: new Date().toISOString(),
  };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: "Method not allowed" }, { status: 405 });

  const base44 = createClientFromRequest(req);

  try {
    const payload = await req.json();

    if (!payload.token) {
      await logSync(base44, 'unknown', {
        source: 'extension', status: 'failed',
        error_code: 'MISSING_FIELD', error_message: 'token required',
        sessions_submitted: 0, sessions_failed: 1,
      });
      return Response.json({ error: 'token required', code: 'MISSING_FIELD' }, { status: 400 });
    }

    const user = await base44.auth.me();
    if (!user) {
      await logSync(base44, 'unknown', {
        source: 'extension', status: 'failed',
        error_code: 'AUTH_FAILED', error_message: 'Authentication failed',
        sessions_submitted: 0, sessions_failed: 1,
      });
      return Response.json({ error: 'Authentication failed', code: 'AUTH_FAILED' }, { status: 401 });
    }

    // Verify token
    const validation = await verifyToken(base44, payload.token, user.email);
    if (!validation.valid) {
      await logSync(base44, user.email, {
        source: 'extension', status: 'failed',
        error_code: 'INVALID_TOKEN', error_message: `Token ${validation.reason}`,
        token_issue: validation.reason,
        sessions_submitted: 0, sessions_failed: 1,
      });
      return Response.json({ error: `Token ${validation.reason}`, code: 'INVALID_TOKEN' }, { status: 401 });
    }

    // Parse sessions
    let sessions = [];
    if (payload.session) sessions = [payload.session];
    else if (Array.isArray(payload.sessions)) sessions = payload.sessions;
    else {
      await logSync(base44, user.email, {
        source: 'extension', status: 'failed',
        error_code: 'INVALID_PAYLOAD', error_message: 'Need session or sessions array',
        sessions_submitted: 0, sessions_failed: 1,
      });
      return Response.json({ error: 'Need session or sessions array', code: 'INVALID_PAYLOAD' }, { status: 400 });
    }

    if (sessions.length === 0 || sessions.length > 100) {
      await logSync(base44, user.email, {
        source: 'extension', status: 'failed',
        error_code: 'INVALID_PAYLOAD', error_message: `Need 1-100 sessions, got ${sessions.length}`,
        sessions_submitted: sessions.length, sessions_failed: sessions.length,
      });
      return Response.json({ error: `Need 1-100 sessions`, code: 'INVALID_PAYLOAD' }, { status: 400 });
    }

    // Validate each session
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
      const avgCheck = validateNumber(s.avg_viewers, 'avg_viewers');
      const peakCheck = validateNumber(s.peak_viewers, 'peak_viewers');
      if (!avgCheck.valid || !peakCheck.valid) {
        results.push({ index: i, status: 'failed', error: 'field validation failed' });
        failureReasons[i] = 'field_validation';
        continue;
      }
      validated.push({ ...s, _index: i });
    }

    // Load existing sessions for dedup
    const existing = await base44.asServiceRole.entities.LiveSession.filter(
      { created_by: user.email }, '-stream_date', 500
    );

    let created = 0, updated = 0, skipped = 0, manual_review = 0;
    const createdSessionIds = [];
    const manualReviewIds = [];

    for (const sess of validated) {
      const iKey = generateExternalSessionKey(sess);
      const existingMatch = existing.find(e =>
        e.external_session_key === iKey ||
        (sess.platform_session_id && e.raw_import_reference === sess.platform_session_id)
      );

      const decision = decideAction(existingMatch, sess);

      if (decision.action === 'create') {
        const record = prepareCreateRecord(sess, user.email);
        const created_sess = await base44.asServiceRole.entities.LiveSession.create(record);
        createdSessionIds.push(created_sess.id);
        created++;
        results.push({ index: sess._index, status: 'created', session_id: created_sess.id });
      } else if (decision.action === 'update') {
        const safeUpdate = {};
        for (const field of SAFE_FIELDS_AUTO_UPDATE) {
          const eVal = existingMatch[field];
          const iVal = sess[field];
          if ((eVal === null || eVal === undefined) && iVal !== null && iVal !== undefined) {
            safeUpdate[field] = iVal;
          }
        }
        safeUpdate.import_updated_at = new Date().toISOString();
        safeUpdate.source = existingMatch.source === 'manual' ? 'hybrid' : 'extension_import';
        await base44.asServiceRole.entities.LiveSession.update(existingMatch.id, safeUpdate);
        updated++;
        results.push({ index: sess._index, status: 'updated', session_id: existingMatch.id });
      } else if (decision.action === 'manual_review') {
        await base44.asServiceRole.entities.LiveSession.update(existingMatch.id, {
          manual_review_status: 'pending',
          import_updated_at: new Date().toISOString(),
        });
        manualReviewIds.push(existingMatch.id);
        manual_review++;
        results.push({ index: sess._index, status: 'manual_review', session_id: existingMatch.id });
      } else {
        skipped++;
        results.push({ index: sess._index, status: 'skipped', session_id: existingMatch?.id, reason: decision.reason });
      }
    }

    // Update profile aggregates
    let profile_updated = false;
    if (created > 0 || updated > 0) {
      try {
        const all_sessions = await base44.asServiceRole.entities.LiveSession.filter({ created_by: user.email }, '-stream_date', 500);
        const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email });
        if (profiles[0] && all_sessions.length > 0) {
          await base44.asServiceRole.entities.CreatorProfile.update(profiles[0].id, {
            follower_count: all_sessions.reduce((sum, s) => sum + (s.followers_gained || 0), 0),
            avg_viewers: Math.round(all_sessions.filter(s => s.avg_viewers > 0).reduce((sum, s) => sum + s.avg_viewers, 0) / (all_sessions.filter(s => s.avg_viewers > 0).length || 1)),
          });
          profile_updated = true;
        }
      } catch (e) {
        console.warn("Failed to update profile:", e.message);
      }
    }

    // Update token stats
    if (validation.token) {
      await base44.asServiceRole.entities.ExtensionToken.update(validation.token.id, {
        total_sessions_imported: (validation.token.total_sessions_imported || 0) + created,
      });
    }

    // Log sync
    const failed = results.filter(r => r.status === 'failed').length;
    const syncStatus = failed > 0 && (created + updated + manual_review) === 0 ? 'failed' : (failed > 0 ? 'partial_success' : 'success');
    await logSync(base44, user.email, {
      source: 'extension', status: syncStatus,
      sessions_submitted: sessions.length,
      sessions_created: created, sessions_updated: updated,
      sessions_skipped: skipped, sessions_manual_review: manual_review,
      sessions_failed: failed, profile_updated,
    });

    const response = { created, updated, skipped, failed, manual_review, profile_updated };
    if (failed > 0) response.results = results.filter(r => r.status === 'failed');
    if (manual_review > 0) {
      response.manual_review_ids = manualReviewIds;
      response.needs_review_note = 'Some sessions flagged for manual review.';
    }

    return Response.json(response);
  } catch (error) {
    console.error(error);
    const user = await base44.auth.me().catch(() => null);
    if (user) {
      await logSync(base44, user.email, {
        source: 'extension', status: 'failed',
        error_code: 'INTERNAL_ERROR', error_message: error.message,
        sessions_submitted: 0, sessions_failed: 1,
      });
    }
    return Response.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
});
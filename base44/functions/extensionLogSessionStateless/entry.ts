import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ============================================================================
// TOKEN HASHING (must match extensionAuthV2.js)
// ============================================================================

async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// TOKEN VALIDATION (from Authorization header)
// ============================================================================

async function validateBearerToken(req, base44) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'missing_auth_header' };
  }

  const token = authHeader.substring(7);
  const tokenHash = await hashToken(token);
  const now = new Date();

  // Find token in database
  const tokens = await base44.asServiceRole.entities.ExtensionToken.filter(
    { token_hash: tokenHash },
    '-generated_at',
    1
  );

  if (tokens.length === 0) {
    return { valid: false, error: 'token_not_found' };
  }

  const tokenRecord = tokens[0];

  // Check status
  if (tokenRecord.status === 'revoked') {
    return { valid: false, error: 'token_revoked' };
  }

  // Check expiration
  if (new Date(tokenRecord.expires_at) < now) {
    return { valid: false, error: 'token_expired' };
  }

  // Token valid — return creator email from created_by
  return { valid: true, creatorEmail: tokenRecord.created_by, tokenId: tokenRecord.id };
}

// ============================================================================
// DEDUPE & SESSION CREATION (from original extensionLogSession.js)
// ============================================================================

function generateExternalSessionKey(session) {
  if (session.platform_session_id) {
    return `platform:${session.platform_session_id}`;
  }
  const date = session.date || 'unknown';
  const start = session.start_time || '00:00';
  const end = session.end_time || '00:00';
  const duration = session.duration_minutes || 0;
  const peak = session.peak_viewers || 0;
  const composite = `${date}|${start}|${end}|${duration}|${peak}`;
  return `composite:${compositeHash(composite)}`;
}

function compositeHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

const MATCH_TYPES = {
  EXACT_MATCH: 'exact_match',
  LIKELY_DUPLICATE: 'likely_duplicate',
  CONFLICTING_DUPLICATE: 'conflicting_duplicate',
  PARTIAL_ENRICHMENT: 'partial_enrichment',
  MANUAL_REVIEW_NEEDED: 'manual_review_needed',
};

const SAFE_FIELDS_AUTO_UPDATE = [
  'avg_viewers',
  'peak_viewers',
  'followers_gained',
  'comments',
  'shares',
  'gifters',
  'diamonds',
  'fan_club_joins',
  'duration_minutes',
  'game',
  'stream_type',
];

function classifyMatch(existing, incoming) {
  if (incoming.platform_session_id && existing.raw_import_reference === incoming.platform_session_id) {
    return MATCH_TYPES.EXACT_MATCH;
  }
  const eKey = existing.external_session_key || generateExternalSessionKey(existing);
  const iKey = generateExternalSessionKey(incoming);
  if (eKey === iKey && eKey !== 'none') {
    return hasConflictingData(existing, incoming)
      ? MATCH_TYPES.CONFLICTING_DUPLICATE
      : MATCH_TYPES.LIKELY_DUPLICATE;
  }
  if (existing.source === 'manual' && isPartialEnrichment(existing, incoming)) {
    return MATCH_TYPES.PARTIAL_ENRICHMENT;
  }
  return null;
}

function hasConflictingData(existing, incoming) {
  const fields = ['avg_viewers', 'peak_viewers', 'followers_gained', 'game'];
  for (const field of fields) {
    const eVal = existing[field];
    const iVal = incoming[field];
    if (eVal !== null && eVal !== undefined && iVal !== null && iVal !== undefined) {
      if (field.includes('viewers')) {
        const diff = Math.abs(eVal - iVal) / (eVal || 1);
        if (diff > 0.1) return true;
      } else if (eVal !== iVal) return true;
    }
  }
  return false;
}

function isPartialEnrichment(existing, incoming) {
  let addedCount = 0;
  for (const field of SAFE_FIELDS_AUTO_UPDATE) {
    const eVal = existing[field];
    const iVal = incoming[field];
    if ((eVal === null || eVal === undefined) && iVal !== null && iVal !== undefined) addedCount++;
  }
  return addedCount >= 2;
}

function decideAction(existing, incoming) {
  if (!existing) return { action: 'create', update: {} };
  const matchType = classifyMatch(existing, incoming);
  if (!matchType) return { action: 'skip', reason: 'no_match_key' };
  if (matchType === MATCH_TYPES.EXACT_MATCH || matchType === MATCH_TYPES.LIKELY_DUPLICATE) {
    const hasChanges = SAFE_FIELDS_AUTO_UPDATE.some(f => {
      const eVal = existing[f];
      const iVal = incoming[f];
      return (eVal === null || eVal === undefined) && iVal !== null && iVal !== undefined;
    });
    return hasChanges ? { action: 'update', matchType } : { action: 'skip', reason: 'already_imported', matchType };
  }
  if (matchType === MATCH_TYPES.PARTIAL_ENRICHMENT) {
    return { action: 'update', matchType };
  }
  if (matchType === MATCH_TYPES.CONFLICTING_DUPLICATE || matchType === MATCH_TYPES.MANUAL_REVIEW_NEEDED) {
    return { action: 'manual_review', matchType };
  }
  return { action: 'skip', reason: 'unknown' };
}

function prepareCreateRecord(sess, email) {
  const d = new Date(sess.date);
  const getISOWeek = (date) => {
    const dt = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    return Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
  };
  return {
    created_by: email,
    game: sess.content_category || sess.stream_title || '',
    stream_type: sess.session_type || 'ranked',
    stream_date: sess.date,
    start_time: sess.start_time || '',
    end_time: sess.end_time || '',
    duration_minutes: sess.duration_minutes || null,
    avg_viewers: sess.avg_viewers || null,
    peak_viewers: sess.peak_viewers || null,
    followers_gained: sess.followers_gained || 0,
    comments: sess.comments || 0,
    shares: sess.shares || 0,
    gifters: sess.gifters || 0,
    diamonds: sess.diamonds || 0,
    fan_club_joins: sess.fan_club_joins || 0,
    notes: sess.notes || '',
    source: 'extension_import',
    source_confidence: 'high',
    external_session_key: generateExternalSessionKey(sess),
    raw_import_payload: JSON.stringify(sess),
    import_created_at: new Date().toISOString(),
    was_auto_imported: true,
    manual_review_status: 'none',
    week_number: getISOWeek(d),
    year: d.getFullYear(),
  };
}

function validateDate(date) {
  if (!date) return { valid: false, error: 'date required' };
  const d = new Date(date);
  if (isNaN(d.getTime())) return { valid: false, error: 'invalid date' };
  if (d > new Date()) return { valid: false, error: 'date cannot be future' };
  const age = (new Date() - d) / (1000 * 60 * 60 * 24);
  if (age > 365) return { valid: false, error: 'date too old (>365 days)' };
  return { valid: true };
}

function validateNumber(val, name, min = 0) {
  if (val === null || val === undefined) return { valid: true };
  const n = Number(val);
  if (isNaN(n) || n < min) return { valid: false, error: `${name} must be >= ${min}` };
  return { valid: true };
}

// ============================================================================
// LOGGING HELPER
// ============================================================================

async function logSync(base44, creatorEmail, syncLog) {
  try {
    await base44.asServiceRole.entities.ImportSyncLog.create({
      created_by: creatorEmail,
      sync_timestamp: new Date().toISOString(),
      ...syncLog,
    });
  } catch (e) {
    console.warn('Failed to log sync:', e.message);
  }
}

// ============================================================================
// MAIN HANDLER - Stateless Extension Ingestion
// ============================================================================

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }, { status: 405 });
  }

  const base44 = createClientFromRequest(req);
  const startTime = new Date().toISOString();

  try {
    // ─── Step 1: Validate Bearer Token ────────────────────────────────────
    const tokenValidation = await validateBearerToken(req, base44);
    if (!tokenValidation.valid) {
      const syncLog = {
        source: 'extension',
        status: 'failed',
        error_code: 'INVALID_TOKEN',
        error_message: tokenValidation.error,
        token_issue: tokenValidation.error,
        sessions_submitted: 0,
        sessions_failed: 1,
      };
      // Log to dev/test if we can't determine creator email
      console.warn('Token validation failed:', tokenValidation.error);
      return Response.json(
        { error: 'Token invalid', code: tokenValidation.error },
        { status: 401 }
      );
    }

    const { creatorEmail, tokenId } = tokenValidation;

    // ─── Step 2: Parse Payload ───────────────────────────────────────────
    const payload = await req.json().catch(() => ({}));
    let sessions = [];
    if (payload.session) sessions = [payload.session];
    else if (Array.isArray(payload.sessions)) sessions = payload.sessions;
    else {
      await logSync(base44, creatorEmail, {
        source: 'extension',
        status: 'failed',
        error_code: 'INVALID_PAYLOAD',
        error_message: 'Need session or sessions array',
        sessions_submitted: 0,
        sessions_failed: 1,
      });
      return Response.json(
        { error: 'Need session or sessions array', code: 'INVALID_PAYLOAD' },
        { status: 400 }
      );
    }

    if (sessions.length === 0 || sessions.length > 100) {
      await logSync(base44, creatorEmail, {
        source: 'extension',
        status: 'failed',
        error_code: 'INVALID_PAYLOAD',
        error_message: `Need 1-100 sessions, got ${sessions.length}`,
        sessions_submitted: sessions.length,
        sessions_failed: sessions.length,
      });
      return Response.json(
        { error: `Need 1-100 sessions`, code: 'INVALID_PAYLOAD' },
        { status: 400 }
      );
    }

    // ─── Step 3: Validate Each Session ───────────────────────────────────
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

      if (
        !validateNumber(s.avg_viewers, 'avg_viewers').valid ||
        !validateNumber(s.peak_viewers, 'peak_viewers').valid
      ) {
        results.push({ index: i, status: 'failed', error: 'field validation failed' });
        failureReasons[i] = 'field_validation';
        continue;
      }

      validated.push({ ...s, _index: i });
    }

    // ─── Step 4: Load Existing Sessions & Process ──────────────────────────
    const existing = await base44.asServiceRole.entities.LiveSession.filter(
      { created_by: creatorEmail },
      '-stream_date',
      500
    );

    let created = 0,
      updated = 0,
      skipped = 0,
      manual_review = 0;
    const processed = [];
    const manualReviewIds = [];
    const createdSessionIds = [];

    for (const sess of validated) {
      const existingMatch = existing.find(e => {
        const eKey = e.external_session_key || generateExternalSessionKey(e);
        const iKey = generateExternalSessionKey(sess);
        return eKey === iKey || (sess.platform_session_id && e.raw_import_reference === sess.platform_session_id);
      });

      const decision = decideAction(existingMatch, sess);

      if (decision.action === 'create') {
        const createRecord = prepareCreateRecord(sess, creatorEmail);
        const created_sess = await base44.asServiceRole.entities.LiveSession.create(createRecord);
        processed.push(created_sess.id);
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
        processed.push(existingMatch.id);
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
      } else if (decision.action === 'skip') {
        skipped++;
        results.push({
          index: sess._index,
          status: 'skipped',
          session_id: existingMatch?.id,
          reason: decision.reason,
        });
      }
    }

    // ─── Step 5: Update Profile Aggregates ────────────────────────────────
    let profile_updated = false;
    try {
      if (processed.length > 0) {
        const all_sessions = await base44.asServiceRole.entities.LiveSession.filter(
          { created_by: creatorEmail },
          '-stream_date',
          500
        );
        const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({
          created_by: creatorEmail,
        });
        if (profiles[0]) {
          await base44.asServiceRole.entities.CreatorProfile.update(profiles[0].id, {
            follower_count: all_sessions.reduce((sum, s) => sum + (s.followers_gained || 0), 0),
            avg_viewers: Math.round(
              all_sessions.reduce((sum, s) => sum + (s.avg_viewers || 0), 0) / all_sessions.length
            ),
          });
          profile_updated = true;
        }
      }
    } catch (e) {
      console.warn('Failed to update profile:', e.message);
    }

    // ─── Step 6: Update Token Stats ───────────────────────────────────────
    try {
      await base44.asServiceRole.entities.ExtensionToken.update(tokenId, {
        last_used_at: new Date().toISOString(),
        last_used_ip: req.headers.get('x-forwarded-for') || 'unknown',
        total_syncs: { __op: 'increment', __val: 1 },
        total_sessions_imported: { __op: 'increment', __val: created + updated },
      });
    } catch (e) {
      console.warn('Failed to update token stats:', e.message);
    }

    // ─── Step 7: Log Sync Result ──────────────────────────────────────────
    const failed = results.filter(r => r.status === 'failed').length;
    const syncStatus = failed > 0 && created + updated + manual_review === 0 ? 'failed' : failed > 0 ? 'partial_success' : 'success';

    await logSync(base44, creatorEmail, {
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
      failed_indices: results
        .filter(r => r.status === 'failed')
        .map(r => r.index)
        .join(','),
      session_ids_created: createdSessionIds.join(','),
    });

    // ─── Step 8: Return Response ──────────────────────────────────────────
    const response = { created, updated, skipped, failed, manual_review, profile_updated };

    if (failed > 0) {
      response.results = results.filter(r => r.status === 'failed');
    }
    if (manual_review > 0) {
      response.manual_review_ids = manualReviewIds;
      response.needs_review_note = 'Some sessions flagged for manual review.';
    }

    return Response.json(response);
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN_TTL = 30 * 60;
const ERROR = (code, msg, status) => ({ error: msg, code, status });

// ============================================================================
// DEDUPE & INTEGRITY LAYER
// ============================================================================

function generateExternalSessionKey(session) {
  if (session.platform_session_id) {
    return `platform:${session.platform_session_id}`;
  }
  const date = session.date || "unknown";
  const start = session.start_time || "00:00";
  const end = session.end_time || "00:00";
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
  EXACT_MATCH: "exact_match",
  LIKELY_DUPLICATE: "likely_duplicate",
  CONFLICTING_DUPLICATE: "conflicting_duplicate",
  PARTIAL_ENRICHMENT: "partial_enrichment",
  MANUAL_REVIEW_NEEDED: "manual_review_needed",
};

const SAFE_FIELDS_AUTO_UPDATE = [
  "avg_viewers",
  "peak_viewers",
  "followers_gained",
  "comments",
  "shares",
  "gifters",
  "diamonds",
  "fan_club_joins",
  "duration_minutes",
  "game",
  "stream_type",
];

function classifyMatch(existing, incoming) {
  if (incoming.platform_session_id && existing.raw_import_reference === incoming.platform_session_id) {
    return MATCH_TYPES.EXACT_MATCH;
  }

  const eKey = existing.external_session_key || generateExternalSessionKey(existing);
  const iKey = generateExternalSessionKey(incoming);

  if (eKey === iKey && eKey !== "none") {
    if (hasConflictingData(existing, incoming)) {
      return MATCH_TYPES.CONFLICTING_DUPLICATE;
    }
    return MATCH_TYPES.LIKELY_DUPLICATE;
  }

  if (existing.source === "manual" && isPartialEnrichment(existing, incoming)) {
    return MATCH_TYPES.PARTIAL_ENRICHMENT;
  }

  if (isEdgeCase(existing, incoming)) {
    return MATCH_TYPES.MANUAL_REVIEW_NEEDED;
  }

  return null;
}

function hasConflictingData(existing, incoming) {
  const fields = ["avg_viewers", "peak_viewers", "followers_gained", "game"];
  for (const field of fields) {
    const eVal = existing[field];
    const iVal = incoming[field];
    if (eVal !== null && eVal !== undefined && iVal !== null && iVal !== undefined) {
      if (field.includes("viewers")) {
        const diff = Math.abs(eVal - iVal) / (eVal || 1);
        if (diff > 0.1) return true;
      } else {
        if (eVal !== iVal) return true;
      }
    }
  }
  return false;
}

function isPartialEnrichment(existing, incoming) {
  let addedCount = 0;
  for (const field of SAFE_FIELDS_AUTO_UPDATE) {
    const eVal = existing[field];
    const iVal = incoming[field];
    if ((eVal === null || eVal === undefined) && iVal !== null && iVal !== undefined) {
      addedCount++;
    }
  }
  return addedCount >= 2;
}

function isEdgeCase(existing, incoming) {
  return (
    existing.stream_date === incoming.date &&
    existing.duration_minutes === incoming.duration_minutes &&
    Math.abs((existing.peak_viewers || 0) - (incoming.peak_viewers || 0)) <= 5
  );
}

function decideAction(existing, incoming) {
  if (!existing) {
    return { action: "create", update: {} };
  }

  const matchType = classifyMatch(existing, incoming);
  if (!matchType) {
    return { action: "skip", reason: "no_match_key" };
  }

  if (matchType === MATCH_TYPES.EXACT_MATCH || matchType === MATCH_TYPES.LIKELY_DUPLICATE) {
    const hasChanges = SAFE_FIELDS_AUTO_UPDATE.some(f => {
      const eVal = existing[f];
      const iVal = incoming[f];
      return (eVal === null || eVal === undefined) && iVal !== null && iVal !== undefined;
    });
    if (hasChanges) {
      return { action: "update", matchType };
    }
    return { action: "skip", reason: "already_imported", matchType };
  }

  if (matchType === MATCH_TYPES.PARTIAL_ENRICHMENT) {
    return { action: "update", matchType };
  }

  if (matchType === MATCH_TYPES.CONFLICTING_DUPLICATE || matchType === MATCH_TYPES.MANUAL_REVIEW_NEEDED) {
    return { action: "manual_review", matchType };
  }

  return { action: "skip", reason: "unknown" };
}

function prepareCreateRecord(sess, email) {
  const d = new Date(sess.date);
  const getISOWeek = (date) => {
    const dt = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    return Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
  };

  const timestamp = new Date().toISOString();
  const externalKey = generateExternalSessionKey(sess);

  return {
    created_by: email,
    game: sess.content_category || sess.stream_title || "",
    stream_type: sess.session_type || "ranked",
    stream_date: sess.date,
    start_time: sess.start_time || "",
    end_time: sess.end_time || "",
    duration_minutes: sess.duration_minutes || null,
    avg_viewers: sess.avg_viewers || null,
    peak_viewers: sess.peak_viewers || null,
    followers_gained: sess.followers_gained || 0,
    comments: sess.comments || 0,
    shares: sess.shares || 0,
    gifters: sess.gifters || 0,
    diamonds: sess.diamonds || 0,
    fan_club_joins: sess.fan_club_joins || 0,
    notes: sess.notes || "",
    source: "extension_import",
    source_confidence: "high",
    external_session_key: externalKey,
    raw_import_payload: JSON.stringify(sess),
    import_created_at: timestamp,
    import_updated_at: timestamp,
    was_auto_imported: true,
    manual_review_status: "none",
    week_number: getISOWeek(d),
    year: d.getFullYear(),
  };
}

// ============================================================================
// TOKEN & AUTH
// ============================================================================

async function signToken(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyToken(token, email) {
  try {
    const decoded = atob(token);
    const parts = decoded.split(':');
    if (parts.length !== 4) return { valid: false };
    
    const [userId, timestamp, expiresAt, signature] = parts;
    const now = Math.floor(Date.now() / 1000);
    if (now > parseInt(expiresAt)) return { valid: false };
    
    const expectedSig = await signToken(`${userId}:${timestamp}:${expiresAt}`, email);
    return { valid: signature === expectedSig, userId };
  } catch {
    return { valid: false };
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateDate(date) {
  if (!date) return { valid: false, error: "date required" };
  const d = new Date(date);
  if (isNaN(d.getTime())) return { valid: false, error: "invalid date" };
  if (d > new Date()) return { valid: false, error: "date cannot be future" };
  const age = (new Date() - d) / (1000 * 60 * 60 * 24);
  if (age > 365) return { valid: false, error: "date too old (>365 days)" };
  return { valid: true };
}

function validateNumber(val, name, min = 0) {
  if (val === null || val === undefined) return { valid: true };
  const n = Number(val);
  if (isNaN(n) || n < min) return { valid: false, error: `${name} must be >= ${min}` };
  return { valid: true };
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: "Method not allowed" }, { status: 405 });

  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    if (!payload.token) return Response.json(ERROR('MISSING_FIELD', 'token required', 400), { status: 400 });

    const user = await base44.auth.me();
    if (!user) return Response.json(ERROR('AUTH_FAILED', 'Authentication failed', 401), { status: 401 });

    const validation = await verifyToken(payload.token, user.email);
    if (!validation.valid) return Response.json(ERROR('INVALID_TOKEN', 'Token invalid', 401), { status: 401 });

    // Parse sessions
    let sessions = [];
    if (payload.session) sessions = [payload.session];
    else if (Array.isArray(payload.sessions)) sessions = payload.sessions;
    else return Response.json(ERROR('INVALID_PAYLOAD', 'Need session or sessions array', 400), { status: 400 });

    if (sessions.length === 0 || sessions.length > 100) {
      return Response.json(ERROR('INVALID_PAYLOAD', 'Need 1-100 sessions', 400), { status: 400 });
    }

    // Validate each session
    const validated = [];
    const results = [];
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const dateCheck = validateDate(s.date);
      if (!dateCheck.valid) {
        results.push({ index: i, status: 'failed', error: dateCheck.error });
        continue;
      }
      
      if (!validateNumber(s.avg_viewers, 'avg_viewers').valid ||
          !validateNumber(s.peak_viewers, 'peak_viewers').valid ||
          !validateNumber(s.followers_gained, 'followers_gained').valid ||
          !validateNumber(s.comments, 'comments').valid ||
          !validateNumber(s.shares, 'shares').valid ||
          !validateNumber(s.gifters, 'gifters').valid ||
          !validateNumber(s.diamonds, 'diamonds').valid ||
          !validateNumber(s.fan_club_joins, 'fan_club_joins').valid) {
        results.push({ index: i, status: 'failed', error: "field validation failed" });
        continue;
      }
      
      validated.push({ ...s, _index: i });
    }

    // Load existing sessions
    const existing = await base44.asServiceRole.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 500);

    // Process validated sessions
    let created = 0, updated = 0, skipped = 0, manual_review = 0;
    const processed = [];
    const manualReviewIds = [];

    for (const sess of validated) {
      const existingMatch = existing.find(e => {
        const eKey = e.external_session_key || generateExternalSessionKey(e);
        const iKey = generateExternalSessionKey(sess);
        return eKey === iKey || (sess.platform_session_id && e.raw_import_reference === sess.platform_session_id);
      });

      const decision = decideAction(existingMatch, sess);

      if (decision.action === "create") {
        const createRecord = prepareCreateRecord(sess, user.email);
        const created_sess = await base44.asServiceRole.entities.LiveSession.create(createRecord);
        processed.push(created_sess.id);
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
        safeUpdate.was_auto_imported = true;
        safeUpdate.source = existingMatch.source === "manual" ? "hybrid" : "extension_import";
        safeUpdate.external_session_key = generateExternalSessionKey(sess);
        safeUpdate.raw_import_payload = JSON.stringify(sess);
        
        await base44.asServiceRole.entities.LiveSession.update(existingMatch.id, safeUpdate);
        processed.push(existingMatch.id);
        updated++;
        results.push({ index: sess._index, status: 'updated', session_id: existingMatch.id, match_type: decision.matchType });
      } else if (decision.action === "manual_review") {
        await base44.asServiceRole.entities.LiveSession.update(existingMatch.id, {
          manual_review_status: "pending",
          import_updated_at: new Date().toISOString(),
        });
        manualReviewIds.push(existingMatch.id);
        manual_review++;
        results.push({ index: sess._index, status: 'manual_review', session_id: existingMatch.id, match_type: decision.matchType });
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
        const total_followers = all_sessions.reduce((sum, s) => sum + (s.followers_gained || 0), 0);
        const avg_viewers = all_sessions.length > 0 ? all_sessions.reduce((sum, s) => sum + (s.avg_viewers || 0), 0) / all_sessions.length : 0;
        
        const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email });
        if (profiles[0]) {
          await base44.asServiceRole.entities.CreatorProfile.update(profiles[0].id, {
            follower_count: total_followers,
            avg_viewers: Math.round(avg_viewers),
          });
          profile_updated = true;
        }
      }
    } catch (e) {
      console.warn("Failed to update profile:", e.message);
    }

    const failed = results.filter(r => r.status === 'failed').length;
    const response = { created, updated, skipped, failed, manual_review, profile_updated };
    
    if (failed > 0) {
      response.results = results.filter(r => r.status === 'failed');
    }
    if (manual_review > 0) {
      response.manual_review_ids = manualReviewIds;
      response.needs_review_note = "Some sessions flagged for manual review due to conflicting data. Check manual_review_status on those records.";
    }

    return Response.json(response);
  } catch (error) {
    console.error(error);
    return Response.json(ERROR('INTERNAL_ERROR', error.message, 500), { status: 500 });
  }
});
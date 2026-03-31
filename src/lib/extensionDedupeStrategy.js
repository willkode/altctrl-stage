/**
 * Extension Ingestion Data Integrity Layer
 * 
 * Handles dedupe, conflict detection, safe-field updates, and manual review routing.
 */

// ============================================================================
// EXTERNAL SESSION KEY GENERATION
// ============================================================================
// Builds a stable, deterministic key for matching sessions across imports
// Priority: platform_session_id > composite external key

export function generateExternalSessionKey(session) {
  // Highest confidence: platform_session_id (TikTok video ID, etc.)
  if (session.platform_session_id) {
    return `platform:${session.platform_session_id}`;
  }

  // Fallback: composite key from temporal + performance metrics
  // date + start_time + end_time + duration_minutes + peak_viewers
  const date = session.date || "unknown";
  const start = session.start_time || "00:00";
  const end = session.end_time || "00:00";
  const duration = session.duration_minutes || 0;
  const peak = session.peak_viewers || 0;

  // Hash to make deterministic + compact
  const composite = `${date}|${start}|${end}|${duration}|${peak}`;
  return `composite:${compositeHash(composite)}`;
}

function compositeHash(str) {
  // Simple hash for determinism — not cryptographic, just for matching
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit int
  }
  return Math.abs(hash).toString(16);
}

// ============================================================================
// MATCH TYPE CLASSIFICATION
// ============================================================================

export const MATCH_TYPES = {
  EXACT_MATCH: "exact_match",              // platform_session_id identical
  LIKELY_DUPLICATE: "likely_duplicate",    // same composite key + same temporal window
  CONFLICTING_DUPLICATE: "conflicting_duplicate", // same key but conflicting data
  PARTIAL_ENRICHMENT: "partial_enrichment", // existing record, incoming fills empty fields
  MANUAL_REVIEW_NEEDED: "manual_review_needed", // edge case, route to manual
};

export function classifyMatch(existingSession, incomingSession) {
  // Rule 1: Exact platform_session_id match
  if (
    incomingSession.platform_session_id &&
    existingSession.raw_import_reference === incomingSession.platform_session_id
  ) {
    return MATCH_TYPES.EXACT_MATCH;
  }

  // Rule 2: Same external_session_key (composite)
  const existingKey = existingSession.external_session_key || "none";
  const incomingKey = generateExternalSessionKey(incomingSession);

  if (existingKey === incomingKey && existingKey !== "none") {
    // Same key — check for conflicts
    if (hasConflictingData(existingSession, incomingSession)) {
      return MATCH_TYPES.CONFLICTING_DUPLICATE;
    }
    return MATCH_TYPES.LIKELY_DUPLICATE;
  }

  // Rule 3: Likely enrichment — no match, but incoming data is all new
  if (
    existingSession.source === "manual" &&
    isPartialEnrichment(existingSession, incomingSession)
  ) {
    return MATCH_TYPES.PARTIAL_ENRICHMENT;
  }

  // Rule 4: Edge cases or uncertain
  if (isEdgeCase(existingSession, incomingSession)) {
    return MATCH_TYPES.MANUAL_REVIEW_NEEDED;
  }

  return null; // No match
}

function hasConflictingData(existing, incoming) {
  // Conflicting if same key but different values in non-empty fields
  const conflictingFields = ["avg_viewers", "peak_viewers", "followers_gained", "game"];
  
  for (const field of conflictingFields) {
    const eVal = existing[field];
    const iVal = incoming[field];
    
    // Both have values and they differ significantly
    if (eVal !== null && eVal !== undefined && iVal !== null && iVal !== undefined) {
      // Allow small variation in viewers (within 10%)
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
  // True if incoming adds new data to sparse existing record
  // Not a duplicate — supplementary
  const safeFields = SAFE_FIELDS_AUTO_UPDATE;
  let addedCount = 0;
  
  for (const field of safeFields) {
    const eVal = existing[field];
    const iVal = incoming[field];
    
    // Incoming has value, existing doesn't
    if ((eVal === null || eVal === undefined) && iVal !== null && iVal !== undefined) {
      addedCount++;
    }
  }
  
  return addedCount >= 2; // At least 2 new fields
}

function isEdgeCase(existing, incoming) {
  // True if timestamps are close but not exact, or partial data matches
  const sameDateWindow = 
    existing.stream_date === incoming.date &&
    existing.duration_minutes === incoming.duration_minutes &&
    Math.abs((existing.peak_viewers || 0) - (incoming.peak_viewers || 0)) <= 5;
  
  return sameDateWindow; // Same day, duration, similar peak — needs review
}

// ============================================================================
// SAFE & LOCKED FIELDS
// ============================================================================

export const SAFE_FIELDS_AUTO_UPDATE = [
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

export const LOCKED_FIELDS_NO_OVERWRITE = [
  "notes",              // Creator debrief notes
  "best_moment",        // Creator-written AAR
  "weakest_moment",     // Creator-written AAR
  "spike_reason",       // Creator-written AAR
  "drop_off_reason",    // Creator-written AAR
  "replay_reviewed",    // Coaching flag
  "went_as_planned",    // Creator subjective
  "would_repeat",       // Creator subjective
  "energy_level",       // Creator subjective
  "promo_posted",       // Creator action tracking
];

// ============================================================================
// UPDATE STRATEGY
// ============================================================================

export function computeUpdate(existingSession, incomingSession, matchType) {
  const update = {};
  const timestamp = new Date().toISOString();

  switch (matchType) {
    case MATCH_TYPES.EXACT_MATCH:
    case MATCH_TYPES.LIKELY_DUPLICATE:
      // Fill in missing safe fields, never overwrite locked fields
      for (const field of SAFE_FIELDS_AUTO_UPDATE) {
        const existing = existingSession[field];
        const incoming = incomingSession[field];
        
        // Only update if existing is empty and incoming has value
        if ((existing === null || existing === undefined || existing === "") && 
            incoming !== null && incoming !== undefined && incoming !== "") {
          update[field] = incoming;
        }
      }
      
      // Always update import metadata
      update.import_updated_at = timestamp;
      update.was_auto_imported = true;
      update.source = existingSession.source === "manual" ? "hybrid" : "extension_import";
      
      break;

    case MATCH_TYPES.PARTIAL_ENRICHMENT:
      // Same as above — fill empty safe fields, preserve manual locks
      for (const field of SAFE_FIELDS_AUTO_UPDATE) {
        const existing = existingSession[field];
        const incoming = incomingSession[field];
        
        if ((existing === null || existing === undefined || existing === "") && 
            incoming !== null && incoming !== undefined && incoming !== "") {
          update[field] = incoming;
        }
      }
      
      update.import_updated_at = timestamp;
      update.was_auto_imported = true;
      update.source = "hybrid";
      
      break;

    case MATCH_TYPES.CONFLICTING_DUPLICATE:
    case MATCH_TYPES.MANUAL_REVIEW_NEEDED:
      // Don't auto-update — flag for manual review
      update.manual_review_status = "pending";
      update.import_updated_at = timestamp;
      break;
  }

  return update;
}

// ============================================================================
// DECISION TREE: CREATE, UPDATE, SKIP, or ROUTE TO MANUAL REVIEW
// ============================================================================

export function decideAction(existingSession, incomingSession) {
  if (!existingSession) {
    // New record — create with full import metadata
    return { action: "create", update: {} };
  }

  const matchType = classifyMatch(existingSession, incomingSession);

  if (!matchType) {
    // No match — skip (don't create duplicate)
    return { action: "skip", reason: "no_match_key" };
  }

  if (matchType === MATCH_TYPES.EXACT_MATCH || matchType === MATCH_TYPES.LIKELY_DUPLICATE) {
    const update = computeUpdate(existingSession, incomingSession, matchType);
    if (Object.keys(update).length > 0) {
      return { action: "update", update, matchType };
    }
    return { action: "skip", reason: "already_imported", matchType };
  }

  if (matchType === MATCH_TYPES.PARTIAL_ENRICHMENT) {
    const update = computeUpdate(existingSession, incomingSession, matchType);
    return { action: "update", update, matchType };
  }

  if (matchType === MATCH_TYPES.CONFLICTING_DUPLICATE || matchType === MATCH_TYPES.MANUAL_REVIEW_NEEDED) {
    const update = computeUpdate(existingSession, incomingSession, matchType);
    return { action: "manual_review", update, matchType };
  }

  return { action: "skip", reason: "unknown" };
}

// ============================================================================
// RECORD CREATION HELPER
// ============================================================================

export function prepareCreateRecord(incomingSession, email) {
  const d = new Date(incomingSession.date);
  const getISOWeek = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const timestamp = new Date().toISOString();
  const externalKey = generateExternalSessionKey(incomingSession);

  return {
    created_by: email,
    game: incomingSession.content_category || incomingSession.stream_title || "",
    stream_type: incomingSession.session_type || "ranked",
    stream_date: incomingSession.date,
    start_time: incomingSession.start_time || "",
    end_time: incomingSession.end_time || "",
    duration_minutes: incomingSession.duration_minutes || null,
    avg_viewers: incomingSession.avg_viewers || null,
    peak_viewers: incomingSession.peak_viewers || null,
    followers_gained: incomingSession.followers_gained || 0,
    comments: incomingSession.comments || 0,
    shares: incomingSession.shares || 0,
    gifters: incomingSession.gifters || 0,
    diamonds: incomingSession.diamonds || 0,
    fan_club_joins: incomingSession.fan_club_joins || 0,
    notes: incomingSession.notes || "",
    source: "extension_import",
    source_confidence: "high",
    external_session_key: externalKey,
    raw_import_payload: JSON.stringify(incomingSession),
    import_created_at: timestamp,
    import_updated_at: timestamp,
    was_auto_imported: true,
    manual_review_status: "none",
    week_number: getISOWeek(d),
    year: d.getFullYear(),
  };
}
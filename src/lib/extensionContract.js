/**
 * AltCtrl Extension Ingestion Contract
 * 
 * Defines request/response schemas, validation rules, dedupe strategy,
 * rate limiting, and auth model for Chrome extension integration.
 */

// ============================================================================
// TOKEN LIFECYCLE
// ============================================================================
// - generateExtensionToken: creates a short-lived, single-use token (30 min TTL)
// - extensionAuth: validates token, returns user context + new token
// - extensionLogSession: uses token for auth, logs sessions
// 
// Token format: base64(creator_id:timestamp:signature) — prevents tampering
// ============================================================================

export const TOKEN_CONFIG = {
  TTL_SECONDS: 30 * 60, // 30 minutes
  SIGNATURE_ALGORITHM: "hmac-sha256",
  ENCODING: "base64",
  MAX_REQUESTS_PER_TOKEN: 1, // Single-use pattern — each request gets new token back
};

// ============================================================================
// RATE LIMITING
// ============================================================================
// Per creator, per endpoint, per minute
// ============================================================================

export const RATE_LIMITS = {
  generateExtensionToken: { requests_per_minute: 10 },
  extensionAuth: { requests_per_minute: 20 },
  extensionLogSession: { requests_per_minute: 30 }, // Allow bulk imports
};

// ============================================================================
// ACCEPTED SESSION FIELDS
// ============================================================================

export const SESSION_FIELD_SPECS = {
  // Required core fields
  date: { type: "string", format: "date", required: true },
  
  // Timing
  start_time: { type: "string", format: "HH:MM", required: false },
  end_time: { type: "string", format: "HH:MM", required: false },
  duration_minutes: { type: "number", min: 1, max: 1440, required: false },
  
  // Viewer metrics (NOT available via TikTok API for LIVE — manual only)
  avg_viewers: { type: "number", min: 0, required: false },
  peak_viewers: { type: "number", min: 0, required: false },
  
  // Audience engagement
  followers_gained: { type: "number", min: 0, required: false },
  comments: { type: "number", min: 0, required: false },
  shares: { type: "number", min: 0, required: false },
  gifters: { type: "number", min: 0, required: false },
  diamonds: { type: "number", min: 0, required: false },
  fan_club_joins: { type: "number", min: 0, required: false },
  
  // Session metadata
  session_type: { type: "string", enum: ["ranked","chill","viewer_games","challenge","collab","special","other"], required: false },
  content_category: { type: "string", maxLength: 100, required: false }, // Game name
  stream_title: { type: "string", maxLength: 200, required: false },
  
  // Creator input
  notes: { type: "string", maxLength: 2000, required: false },
  
  // Timeline / viewer trend data (future-safe: may parse as JSON)
  viewer_timeline: { type: "string or array", required: false }, // e.g. "[50,55,52,60,...]" or [{minute: 0, viewers: 50}, ...]
  
  // Future-safe fields (not yet actively used, but accepted)
  replay_url: { type: "string", format: "url", required: false },
  platform_session_id: { type: "string", maxLength: 100, required: false }, // e.g. TikTok video ID
  source_version: { type: "string", maxLength: 50, required: false }, // Extension version
  
  // Imported session provenance (set by endpoint, not client)
  // source: "extension_import"
  // source_confidence: "high"
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  date: (val) => {
    if (!val) return { valid: false, error: "date is required" };
    const d = new Date(val);
    if (isNaN(d.getTime())) return { valid: false, error: "date must be valid ISO date (YYYY-MM-DD)" };
    // Don't allow future dates
    if (d > new Date()) return { valid: false, error: "date cannot be in the future" };
    // Don't allow sessions older than 365 days
    const age = (new Date() - d) / (1000 * 60 * 60 * 24);
    if (age > 365) return { valid: false, error: "session date is older than 365 days" };
    return { valid: true };
  },
  
  duration_minutes: (val) => {
    if (val === null || val === undefined) return { valid: true }; // Optional
    const n = Number(val);
    if (isNaN(n) || n < 1 || n > 1440) return { valid: false, error: "duration_minutes must be 1-1440" };
    return { valid: true };
  },
  
  avg_viewers: (val) => {
    if (val === null || val === undefined) return { valid: true };
    const n = Number(val);
    if (isNaN(n) || n < 0 || n > 999999) return { valid: false, error: "avg_viewers must be 0-999999" };
    return { valid: true };
  },
  
  peak_viewers: (val) => {
    if (val === null || val === undefined) return { valid: true };
    const n = Number(val);
    if (isNaN(n) || n < 0 || n > 999999) return { valid: false, error: "peak_viewers must be 0-999999" };
    return { valid: true };
  },
  
  session_type: (val) => {
    if (!val) return { valid: true }; // Optional
    const valid = ["ranked","chill","viewer_games","challenge","collab","special","other"].includes(val);
    return valid ? { valid: true } : { valid: false, error: "invalid session_type" };
  },
  
  followers_gained: (val) => {
    if (val === null || val === undefined) return { valid: true };
    const n = Number(val);
    if (isNaN(n) || n < 0) return { valid: false, error: "followers_gained must be >= 0" };
    return { valid: true };
  },
  
  comments: (val) => {
    if (val === null || val === undefined) return { valid: true };
    const n = Number(val);
    if (isNaN(n) || n < 0) return { valid: false, error: "comments must be >= 0" };
    return { valid: true };
  },
  
  shares: (val) => {
    if (val === null || val === undefined) return { valid: true };
    const n = Number(val);
    if (isNaN(n) || n < 0) return { valid: false, error: "shares must be >= 0" };
    return { valid: true };
  },
  
  gifters: (val) => {
    if (val === null || val === undefined) return { valid: true };
    const n = Number(val);
    if (isNaN(n) || n < 0) return { valid: false, error: "gifters must be >= 0" };
    return { valid: true };
  },
  
  diamonds: (val) => {
    if (val === null || val === undefined) return { valid: true };
    const n = Number(val);
    if (isNaN(n) || n < 0) return { valid: false, error: "diamonds must be >= 0" };
    return { valid: true };
  },
  
  fan_club_joins: (val) => {
    if (val === null || val === undefined) return { valid: true };
    const n = Number(val);
    if (isNaN(n) || n < 0) return { valid: false, error: "fan_club_joins must be >= 0" };
    return { valid: true };
  },
  
  notes: (val) => {
    if (!val) return { valid: true };
    if (typeof val !== "string" || val.length > 2000) return { valid: false, error: "notes must be string <= 2000 chars" };
    return { valid: true };
  },
  
  stream_title: (val) => {
    if (!val) return { valid: true };
    if (typeof val !== "string" || val.length > 200) return { valid: false, error: "stream_title must be string <= 200 chars" };
    return { valid: true };
  },
  
  source_version: (val) => {
    if (!val) return { valid: true };
    if (typeof val !== "string" || val.length > 50) return { valid: false, error: "source_version must be string <= 50 chars" };
    return { valid: true };
  },
};

// ============================================================================
// DEDUPE STRATEGY
// ============================================================================
// 
// Primary key: (date, stream_title or content_category, session_type)
// If platform_session_id provided: use that as primary key (most reliable)
// 
// On duplicate:
// - If source_version > existing: update (extension sent newer data)
// - Else: skip (we already have this or newer data)
// - Log all as "skipped" in response
// 
// Rationale:
// - Creator might re-sync the same day's stream multiple times
// - Extension might crash mid-import and retry
// - We want to accept corrections but not duplicate-create
// ============================================================================

export const DEDUPE_STRATEGY = {
  primary_key_fields: ["date", "content_category or stream_title", "session_type"],
  fallback_key: "platform_session_id",
  collision_resolution: "update_if_newer_version_or_skip",
  version_field: "source_version",
};

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Auth
  INVALID_TOKEN: { code: "INVALID_TOKEN", status: 401, message: "Token invalid or expired" },
  EXPIRED_TOKEN: { code: "EXPIRED_TOKEN", status: 401, message: "Token expired" },
  TOKEN_NOT_FOUND: { code: "TOKEN_NOT_FOUND", status: 401, message: "Token not found" },
  AUTH_FAILED: { code: "AUTH_FAILED", status: 401, message: "Authentication failed" },
  
  // Rate limiting
  RATE_LIMITED: { code: "RATE_LIMITED", status: 429, message: "Rate limit exceeded" },
  
  // Validation
  INVALID_PAYLOAD: { code: "INVALID_PAYLOAD", status: 400, message: "Request payload invalid" },
  MISSING_FIELD: { code: "MISSING_FIELD", status: 400, message: "Required field missing" },
  INVALID_FIELD: { code: "INVALID_FIELD", status: 400, message: "Field validation failed" },
  
  // Server
  INTERNAL_ERROR: { code: "INTERNAL_ERROR", status: 500, message: "Internal server error" },
};

// ============================================================================
// REQUEST / RESPONSE SCHEMAS
// ============================================================================

export const REQUEST_SCHEMAS = {
  generateExtensionToken: {
    description: "Request a new extension token",
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
  },
  
  extensionAuth: {
    description: "Validate token and get user context",
    type: "object",
    required: ["token"],
    properties: {
      token: { type: "string" },
    },
  },
  
  extensionLogSession: {
    description: "Log a single session or bulk sessions",
    type: "object",
    required: ["token"],
    oneOf: [
      { required: ["token", "session"] }, // Single session
      { required: ["token", "sessions"] }, // Bulk sessions
    ],
    properties: {
      token: { type: "string" },
      session: {
        type: "object",
        description: "Single session payload",
        properties: SESSION_FIELD_SPECS,
      },
      sessions: {
        type: "array",
        description: "Array of session payloads for bulk import",
        items: {
          type: "object",
          properties: SESSION_FIELD_SPECS,
        },
        maxItems: 100,
      },
    },
  },
};

export const RESPONSE_SCHEMAS = {
  generateExtensionToken: {
    description: "Token response",
    type: "object",
    properties: {
      token: { type: "string", description: "New extension token" },
      expires_in: { type: "number", description: "TTL in seconds" },
      expires_at: { type: "string", format: "date-time" },
    },
  },
  
  extensionAuth: {
    description: "Auth validation response",
    type: "object",
    properties: {
      user_id: { type: "string" },
      email: { type: "string" },
      creator_name: { type: "string" },
      token: { type: "string", description: "New refresh token for next request" },
      expires_at: { type: "string", format: "date-time" },
    },
  },
  
  extensionLogSession: {
    description: "Session ingestion response",
    type: "object",
    properties: {
      created: { type: "number", description: "Count of newly created sessions" },
      updated: { type: "number", description: "Count of updated sessions" },
      skipped: { type: "number", description: "Count of skipped/duplicate sessions" },
      failed: { type: "number", description: "Count of validation failed rows (bulk only)" },
      results: {
        type: "array",
        description: "Per-row results (bulk only, if any failures)",
        items: {
          type: "object",
          properties: {
            index: { type: "number" },
            status: { type: "string", enum: ["created","updated","skipped","failed"] },
            session_id: { type: "string" },
            error: { type: "string" },
          },
        },
      },
      profile_updated: { type: "boolean", description: "Whether creator profile aggregates were updated" },
    },
  },
};

// ============================================================================
// IDEMPOTENCY & DEDUPE LOGIC HELPERS
// ============================================================================

/**
 * Generate dedupe key for a session
 * Prefer platform_session_id (most reliable), fall back to (date, title, type)
 */
export function generateDedupeKey(session) {
  if (session.platform_session_id) {
    return { strategy: "platform_id", key: session.platform_session_id };
  }
  const category = session.content_category || session.stream_title || "unknown";
  const type = session.session_type || "unknown";
  return {
    strategy: "composite",
    key: `${session.date}|${category}|${type}`,
  };
}

/**
 * Should we update an existing session based on incoming data?
 * Returns true if incoming version > existing version
 */
export function shouldUpdate(existingSession, incomingSession) {
  const existingVersion = existingSession.source_version || "0.0.0";
  const incomingVersion = incomingSession.source_version || "0.0.0";
  return compareVersions(incomingVersion, existingVersion) > 0;
}

/**
 * Simple semver-style version comparison
 * Returns: 1 if a > b, -1 if a < b, 0 if equal
 */
function compareVersions(a, b) {
  const aParts = a.split(".").map(x => parseInt(x) || 0);
  const bParts = b.split(".").map(x => parseInt(x) || 0);
  for (let i = 0; i < 3; i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal > bVal) return 1;
    if (aVal < bVal) return -1;
  }
  return 0;
}
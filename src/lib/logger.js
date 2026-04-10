/**
 * ============================================================
 * CENTRALIZED LOGGER — lib/logger.js
 * ============================================================
 * 
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('User loaded', { userId: '123' });
 *   logger.warn('Slow query', { duration: 2400 });
 *   logger.error('Failed to save', error, { entityName: 'Todo' });
 *   logger.debug('State change', { prev, next });
 * 
 * Debug mode — enable via any of:
 *   1. localStorage.setItem('altctrl_debug', 'true')
 *   2. URL query param: ?debug=true
 *   3. Vite env: import.meta.env.DEV (auto in dev)
 * 
 * Recent errors — inspect via:
 *   logger.getHistory()          — returns last 100 entries
 *   logger.getHistory('error')   — filter by severity
 *   logger.clearHistory()
 * 
 * Breadcrumbs (auto-captured user actions before a crash):
 *   logger.breadcrumb('Clicked save', { formId: 'x' })
 *   logger.getBreadcrumbs()      — returns last 30 breadcrumbs
 * 
 * Performance timing:
 *   const end = logger.time('loadDashboard');
 *   // ... work ...
 *   end();  // logs duration automatically
 * 
 * Context — attach persistent context:
 *   logger.setContext({ userId: 'abc', route: '/app/dashboard' });
 * 
 * ============================================================
 */

// --------------- CONSTANTS ---------------

const MAX_HISTORY = 100;
const MAX_BREADCRUMBS = 30;
const STORAGE_KEY = 'altctrl_error_history';
const DEBUG_STORAGE_KEY = 'altctrl_debug';

// Sensitive field names to redact from logs
const SENSITIVE_KEYS = new Set([
  'password', 'token', 'secret', 'access_token', 'refresh_token',
  'authorization', 'cookie', 'api_key', 'apikey', 'stripe_key',
  'client_secret', 'private_key',
]);

// --------------- STATE ---------------

let _history = [];
let _breadcrumbs = [];
let _context = {};
let _correlationId = generateId();
let _debugMode = null; // lazy-evaluated

// --------------- HELPERS ---------------

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Check if debug mode is active (cached after first check) */
function isDebug() {
  if (_debugMode !== null) return _debugMode;
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) { _debugMode = true; return true; }
    if (typeof localStorage !== 'undefined' && localStorage.getItem(DEBUG_STORAGE_KEY) === 'true') { _debugMode = true; return true; }
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === 'true') {
      _debugMode = true;
      localStorage.setItem(DEBUG_STORAGE_KEY, 'true');
      return true;
    }
  } catch {}
  _debugMode = false;
  return false;
}

/** Deep-clone an object, redacting sensitive fields */
function redact(obj, depth = 0) {
  if (depth > 5 || obj == null) return obj;
  if (typeof obj === 'string') return obj.length > 2000 ? obj.slice(0, 2000) + '…[truncated]' : obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.slice(0, 50).map(v => redact(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      out[k] = '[REDACTED]';
    } else {
      out[k] = redact(v, depth + 1);
    }
  }
  return out;
}

/** Normalize any thrown value into { message, stack, name } */
function normalizeError(err) {
  if (!err) return { message: 'Unknown error', stack: '', name: 'Error' };
  if (err instanceof Error) return { message: err.message, stack: err.stack || '', name: err.name };
  if (typeof err === 'string') return { message: err, stack: '', name: 'Error' };
  if (typeof err === 'object') {
    return {
      message: err.message || err.error || JSON.stringify(err).slice(0, 500),
      stack: err.stack || '',
      name: err.name || 'Error',
    };
  }
  return { message: String(err), stack: '', name: 'Error' };
}

/** Get browser & device info */
function getDeviceInfo() {
  if (typeof navigator === 'undefined') return {};
  return {
    userAgent: navigator.userAgent?.slice(0, 200),
    language: navigator.language,
    platform: navigator.platform,
    online: navigator.onLine,
    screenWidth: screen?.width,
    screenHeight: screen?.height,
  };
}

/** Get current route from window.location */
function getRoute() {
  try { return window.location.pathname + window.location.search; } catch { return ''; }
}

// --------------- HISTORY MANAGEMENT ---------------

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) _history = JSON.parse(raw).slice(-MAX_HISTORY);
  } catch {}
}

function persistHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_history.slice(-MAX_HISTORY)));
  } catch {}
}

function pushHistory(entry) {
  _history.push(entry);
  if (_history.length > MAX_HISTORY) _history = _history.slice(-MAX_HISTORY);
  persistHistory();
}

// Init history from localStorage on load
loadHistory();

// --------------- CONSOLE OUTPUT ---------------

const LEVEL_STYLES = {
  debug: 'color: #6b7280; font-weight: normal;',
  info:  'color: #00f5ff; font-weight: bold;',
  warn:  'color: #facc15; font-weight: bold;',
  error: 'color: #ef4444; font-weight: bold;',
};

const LEVEL_ICONS = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '🔴' };

function consoleOutput(level, message, meta) {
  // In production, suppress debug and info
  if (!isDebug() && (level === 'debug' || level === 'info')) return;

  const ts = new Date().toISOString().slice(11, 23);
  const prefix = `${LEVEL_ICONS[level]} [${ts}] [${level.toUpperCase()}]`;
  const style = LEVEL_STYLES[level];

  if (meta && Object.keys(meta).length > 0) {
    console.groupCollapsed(`%c${prefix} ${message}`, style);
    console.log('Context:', redact(meta));
    if (meta.error?.stack) console.log('Stack:', meta.error.stack);
    console.groupEnd();
  } else {
    console[level === 'debug' ? 'log' : level](`%c${prefix} ${message}`, style);
  }
}

// --------------- CORE LOG FUNCTION ---------------

function log(level, message, errorOrMeta, extraMeta) {
  // Determine error object and metadata
  let error = null;
  let meta = {};

  if (errorOrMeta instanceof Error) {
    error = normalizeError(errorOrMeta);
    meta = { ...extraMeta };
  } else if (typeof errorOrMeta === 'object' && errorOrMeta !== null) {
    // Could be an error-like object or just metadata
    if (errorOrMeta.stack || errorOrMeta.message) {
      error = normalizeError(errorOrMeta);
      meta = { ...extraMeta };
    } else {
      meta = { ...errorOrMeta, ...extraMeta };
    }
  }

  const entry = {
    id: generateId(),
    correlationId: _correlationId,
    timestamp: new Date().toISOString(),
    level,
    message: String(message).slice(0, 1000),
    error,
    route: getRoute(),
    context: { ..._context, ...redact(meta) },
    source: meta?.source || 'app',
  };

  // Console output
  consoleOutput(level, message, { ...entry.context, error });

  // Store errors/warnings in history
  if (level === 'error' || level === 'warn') {
    pushHistory(entry);
  }

  // In debug mode, also store info
  if (isDebug() && level === 'info') {
    pushHistory(entry);
  }

  return entry;
}

// --------------- PUBLIC API ---------------

export const logger = {
  /** Log at debug level — only visible in debug mode */
  debug(message, meta) { return log('debug', message, meta); },

  /** Log at info level — visible in debug mode and dev */
  info(message, meta) { return log('info', message, meta); },

  /** Log a warning — always visible, always stored in history */
  warn(message, errorOrMeta, extra) { return log('warn', message, errorOrMeta, extra); },

  /** Log an error — always visible, always stored in history */
  error(message, errorOrMeta, extra) { return log('error', message, errorOrMeta, extra); },

  /** Add a breadcrumb — lightweight trace of user actions */
  breadcrumb(action, data) {
    _breadcrumbs.push({
      timestamp: new Date().toISOString(),
      action: String(action).slice(0, 200),
      data: data ? redact(data) : undefined,
      route: getRoute(),
    });
    if (_breadcrumbs.length > MAX_BREADCRUMBS) _breadcrumbs = _breadcrumbs.slice(-MAX_BREADCRUMBS);
  },

  /** Start a performance timer, returns a stop function */
  time(label) {
    const start = performance.now();
    return () => {
      const duration = Math.round(performance.now() - start);
      const level = duration > 3000 ? 'warn' : 'debug';
      log(level, `⏱ ${label}: ${duration}ms`, { duration, perfLabel: label });
      return duration;
    };
  },

  /** Set persistent context that attaches to all future logs */
  setContext(ctx) { _context = { ..._context, ...ctx }; },

  /** Clear context */
  clearContext() { _context = {}; },

  /** Generate a new correlation ID (e.g. per page navigation) */
  newCorrelation() { _correlationId = generateId(); return _correlationId; },

  /** Get recent error/warning history */
  getHistory(level) {
    if (level) return _history.filter(e => e.level === level);
    return [..._history];
  },

  /** Clear error history */
  clearHistory() { _history = []; persistHistory(); },

  /** Get recent breadcrumbs */
  getBreadcrumbs() { return [..._breadcrumbs]; },

  /** Check if debug mode is active */
  isDebug,

  /** Enable debug mode at runtime */
  enableDebug() {
    _debugMode = true;
    try { localStorage.setItem(DEBUG_STORAGE_KEY, 'true'); } catch {}
  },

  /** Disable debug mode at runtime */
  disableDebug() {
    _debugMode = false;
    try { localStorage.removeItem(DEBUG_STORAGE_KEY); } catch {}
  },

  /** Utility: normalize any thrown value into a safe error object */
  normalizeError,

  /** Utility: redact sensitive fields from an object */
  redact,

  /** Utility: get device info */
  getDeviceInfo,

  /** Get current correlation ID */
  getCorrelationId() { return _correlationId; },
};

// Expose on window for console debugging: window.__logger
if (typeof window !== 'undefined') {
  window.__logger = logger;
}

export default logger;
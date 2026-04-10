/**
 * ============================================================
 * GLOBAL ERROR CAPTURE — lib/errorLogger.js
 * ============================================================
 * 
 * Captures:
 *   - Runtime JS errors (window.onerror)
 *   - Unhandled promise rejections
 *   - Failed network/entity requests
 * 
 * Persists errors to the ErrorLog entity for admin review.
 * Uses the centralized logger for console output.
 * 
 * Called once at app startup in App.jsx via initGlobalErrorLogging().
 * ============================================================
 */

import { base44 } from "@/api/base44Client";
import { logger } from "./logger";

// Throttle: don't write more than 5 errors per minute to the DB to avoid spam loops
let _writeCount = 0;
let _writeResetTimer = null;

function canWriteToDb() {
  if (_writeCount >= 5) return false;
  _writeCount++;
  if (!_writeResetTimer) {
    _writeResetTimer = setTimeout(() => { _writeCount = 0; _writeResetTimer = null; }, 60_000);
  }
  return true;
}

/**
 * Persist an error to the ErrorLog entity.
 * Safe to call from anywhere — handles its own failures silently.
 */
export async function logErrorToDb(message, {
  stack,
  errorType = "manual",
  extra,
  severity = "error",
  source,
  entityName,
  recordId,
  operation,
  requestStatus,
} = {}) {
  if (!canWriteToDb()) return;

  let user_email = null;
  try {
    const user = await base44.auth.me();
    user_email = user?.email || null;
  } catch {}

  const extraObj = {
    ...extra,
    correlationId: logger.getCorrelationId(),
    route: typeof window !== 'undefined' ? window.location.pathname : '',
    breadcrumbs: logger.getBreadcrumbs().slice(-10),
    device: logger.getDeviceInfo(),
    source,
    entityName,
    recordId,
    operation,
    requestStatus,
  };

  try {
    await base44.entities.ErrorLog.create({
      error_type: errorType,
      severity,
      message: String(message).slice(0, 1000),
      stack: stack ? String(stack).slice(0, 3000) : undefined,
      url: typeof window !== 'undefined' ? window.location.href : '',
      user_email,
      extra: JSON.stringify(logger.redact(extraObj)).slice(0, 4000),
    });
  } catch (e) {
    // Silently fail — never let error logging cause more errors
    console.warn('[ErrorLogger] Failed to persist error to DB:', e.message);
  }
}

/**
 * Initialize global error listeners. Call once at app startup.
 */
export function initGlobalErrorLogging() {
  // --- Runtime JS errors ---
  window.addEventListener("error", (event) => {
    const msg = event.message || "Unknown runtime error";
    logger.error(`[Global] ${msg}`, {
      source: 'window.onerror',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
    logErrorToDb(msg, {
      stack: event.error?.stack,
      errorType: "unhandled_error",
      extra: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });

  // --- Unhandled promise rejections ---
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const { message, stack } = logger.normalizeError(reason);
    logger.error(`[Global] Unhandled rejection: ${message}`, {
      source: 'unhandledrejection',
      stack,
    });
    logErrorToDb(message, {
      stack,
      errorType: "unhandled_rejection",
    });
  });

  logger.info('Global error logging initialized');
}

/**
 * Helper to wrap async operations with error logging.
 * Returns [result, error] tuple.
 * 
 * Usage:
 *   const [data, err] = await safeAsync(
 *     () => base44.entities.Todo.list(),
 *     { operation: 'list', entityName: 'Todo' }
 *   );
 */
export async function safeAsync(fn, context = {}) {
  try {
    const result = await fn();
    return [result, null];
  } catch (err) {
    const { message, stack } = logger.normalizeError(err);
    logger.error(`[SafeAsync] ${context.operation || 'unknown'} failed: ${message}`, {
      ...context,
      stack,
      source: 'safeAsync',
    });
    logErrorToDb(message, {
      stack,
      errorType: 'async_operation',
      severity: 'error',
      ...context,
    });
    return [null, err];
  }
}
import { base44 } from "@/api/base44Client";

export async function logError(message, { stack, errorType = "manual", extra } = {}) {
  let user_email = null;
  try {
    const user = await base44.auth.me();
    user_email = user?.email || null;
  } catch {}

  await base44.entities.ErrorLog.create({
    error_type: errorType,
    message: String(message).slice(0, 1000),
    stack: stack ? String(stack).slice(0, 3000) : undefined,
    url: window.location.href,
    user_email,
    extra: extra ? JSON.stringify(extra).slice(0, 1000) : undefined,
  });
}

export function initGlobalErrorLogging() {
  window.addEventListener("error", (event) => {
    logError(event.message || "Unknown error", {
      stack: event.error?.stack,
      errorType: "unhandled_error",
      extra: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    logError(reason?.message || String(reason) || "Unhandled promise rejection", {
      stack: reason?.stack,
      errorType: "unhandled_rejection",
    });
  });
}
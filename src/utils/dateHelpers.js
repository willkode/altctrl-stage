/**
 * Shared date utilities used across the app.
 */

/**
 * Returns the ISO 8601 week number for a given date.
 */
export function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Returns today's date as a YYYY-MM-DD string.
 * Always computed fresh to avoid stale values if the tab stays open past midnight.
 */
export function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Returns an array of 7 Date objects (Mon–Sun) for the week
 * at the given weekOffset relative to the current week.
 */
export function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
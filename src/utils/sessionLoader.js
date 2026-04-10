/**
 * Shared session loader — fetches LiveSession + DesktopSession,
 * normalizes desktop records, and deduplicates overlapping sessions.
 */
import { base44 } from "@/api/base44Client";

/**
 * Normalize a DesktopSession record to the same shape as LiveSession.
 */
function normalizeDesktop(d) {
  return {
    id: d.id,
    stream_date: d.started_at ? d.started_at.split("T")[0] : null,
    game: d.game || "",
    stream_type: null,
    avg_viewers: d.avg_viewers ?? 0,
    peak_viewers: d.peak_viewers ?? 0,
    duration_minutes: d.duration_min ?? 0,
    followers_gained: d.total_follows ?? 0,
    comments: d.unique_chatters ?? 0,
    gifters: d.unique_gifters ?? 0,
    diamonds: d.total_diamonds ?? 0,
    shares: d.total_shares ?? 0,
    likes_received: 0,
    fan_club_joins: 0,
    total_unique_viewers: d.total_unique_viewers ?? 0,
    return_viewers: d.return_viewers ?? 0,
    unique_chatters: d.unique_chatters ?? 0,
    promo_posted: false,
    energy_level: null,
    source: "desktop_sync",
    title: d.title || "",
    start_time: d.started_at || null,
    _desktop: true,
    _started_at: d.started_at,
  };
}

/**
 * Two sessions overlap if they're on the same date and within 30 minutes of each other.
 * When they overlap, keep the one with richer data (higher peak viewers or more duration).
 */
function deduplicateSessions(sessions) {
  // Sort by date then start_time
  const sorted = [...sessions].sort((a, b) => {
    const dateComp = (a.stream_date || "").localeCompare(b.stream_date || "");
    if (dateComp !== 0) return dateComp;
    return (a.start_time || "").localeCompare(b.start_time || "");
  });

  const kept = [];
  const used = new Set();

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue;
    let best = sorted[i];

    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue;
      const other = sorted[j];

      // Only compare sessions on the same date
      if (best.stream_date !== other.stream_date) break;

      // Check if start times are within 30 min of each other
      const t1 = best._started_at || best.start_time;
      const t2 = other._started_at || other.start_time;

      if (t1 && t2) {
        const diff = Math.abs(new Date(t1) - new Date(t2)) / 60000;
        if (diff > 30) continue;
      }

      // Mark as duplicate — keep the one with more data
      used.add(j);
      const bestScore = (best.peak_viewers || 0) + (best.duration_minutes || 0) + (best.comments || 0);
      const otherScore = (other.peak_viewers || 0) + (other.duration_minutes || 0) + (other.comments || 0);
      if (otherScore > bestScore) {
        best = other;
      }
    }

    kept.push(best);
  }

  return kept;
}

/**
 * Load all sessions for the current user from both LiveSession and DesktopSession,
 * normalize, deduplicate, and return sorted newest-first.
 *
 * @param {number} limit - max records to fetch per entity (default 200)
 * @returns {Promise<Array>} merged, deduplicated sessions
 */
export async function loadAllSessions(limit = 200) {
  const user = await base44.auth.me();

  const [liveSessions, desktopSessions] = await Promise.all([
    base44.entities.LiveSession.filter({ owner_email: user.email }, "-stream_date", limit),
    base44.entities.DesktopSession.filter({ user_id: user.email }, "-started_at", limit),
  ]);

  const normalizedDesktop = desktopSessions.map(normalizeDesktop);
  const merged = [...liveSessions, ...normalizedDesktop];
  const deduped = deduplicateSessions(merged);

  // Sort newest first
  deduped.sort((a, b) => (b.stream_date || "").localeCompare(a.stream_date || ""));

  return deduped;
}
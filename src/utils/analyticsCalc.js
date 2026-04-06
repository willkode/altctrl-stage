/**
 * AltCtrl Analytics Calculations
 * All inputs: array of LiveSession records from the DB.
 * All outputs: plain objects ready for direct UI consumption.
 */

// ─── Constants ──────────────────────────────────────────────────────────────

export const THRESHOLDS = {
  CHART_MIN_SESSIONS: 2,        // need at least 2 points to draw a line
  GAME_BREAKDOWN_MIN: 2,        // at least 2 sessions per game to show it
  HEATMAP_MIN_SESSIONS: 3,      // minimum sessions with start_time
  PROMO_IMPACT_MIN_EACH: 2,     // need 2 sessions with promo AND 2 without
  TREND_DAYS: 30,               // rolling window in days
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function avg(arr) {
  const valid = arr.filter(v => v != null && !isNaN(v));
  return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
}

function dayIndex(dateStr) {
  // Returns 0 = Mon … 6 = Sun
  const d = new Date(dateStr + "T12:00:00");
  return (d.getDay() + 6) % 7;
}

function hourBucket(timeStr) {
  if (!timeStr) return null;
  const h = parseInt(timeStr.split(":")[0]);
  return isNaN(h) ? null : h;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── 1. Trend Chart (30-day) ─────────────────────────────────────────────────

/**
 * Returns daily aggregated data points for the last N days, sorted oldest→newest.
 * Groups multiple streams per day into daily totals.
 * Each point has: date, label, avg_viewers (daily avg), peak_viewers (daily peak), followers_gained (daily total).
 * hasEnoughData: false if fewer than CHART_MIN_SESSIONS data points in the window.
 */
export function buildTrendData(sessions, days = THRESHOLDS.TREND_DAYS) {
  const cutoff = daysAgo(days);
  const inWindow = sessions
    .filter(s => s.stream_date && new Date(s.stream_date + "T12:00:00") >= cutoff);

  // Group sessions by date
  const byDate = {};
  inWindow.forEach(s => {
    if (!byDate[s.stream_date]) {
      byDate[s.stream_date] = [];
    }
    byDate[s.stream_date].push(s);
  });

  // Aggregate by date
  const points = Object.keys(byDate)
    .sort()
    .map(date => {
      const daySessions = byDate[date];
      const avgViewersArr = daySessions.filter(s => s.avg_viewers != null).map(s => s.avg_viewers);
      const dailyAvgViewers = avgViewersArr.length > 0 ? Math.round(avg(avgViewersArr)) : null;
      const dailyPeakViewers = Math.max(...daySessions.map(s => s.peak_viewers || 0)) || null;
      const dailyFollowersGained = daySessions.reduce((sum, s) => sum + (s.followers_gained || 0), 0);

      return {
        date,
        label: new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        avg_viewers: dailyAvgViewers,
        peak_viewers: dailyPeakViewers,
        followers_gained: dailyFollowersGained,
        game: daySessions.map(s => s.game).filter(Boolean).join(", "),
        promo_posted: daySessions.some(s => s.promo_posted),
      };
    });

  return {
    points,
    hasEnoughData: points.length >= THRESHOLDS.CHART_MIN_SESSIONS,
    sessionCount: points.length,
  };
}

// ─── 2. Summary Stats ────────────────────────────────────────────────────────

/**
 * Top-level aggregate numbers for the summary bar.
 */
export function buildSummaryStats(sessions) {
  const total = sessions.length;
  const last30 = sessions.filter(s => s.stream_date && new Date(s.stream_date + "T12:00:00") >= daysAgo(30));
  const withViewers = sessions.filter(s => s.avg_viewers != null && s.avg_viewers > 0);

  const avgViewers = avg(withViewers.map(s => s.avg_viewers));
  const peakViewers = sessions.reduce((m, s) => Math.max(m, s.peak_viewers || 0), 0) || null;
  const totalMins = sessions.reduce((a, s) => a + (s.duration_minutes || 0), 0);
  const totalFollowers = sessions.reduce((a, s) => a + (s.followers_gained || 0), 0);
  const promoCount = sessions.filter(s => s.promo_posted).length;
  const promoRate = total > 0 ? Math.round((promoCount / total) * 100) : 0;

  return {
    total,
    last30Count: last30.length,
    avgViewers: avgViewers !== null ? Math.round(avgViewers) : null,
    peakViewers,
    totalMinutes: totalMins,
    totalFollowers,
    promoRate,
  };
}

// ─── 3. Game Breakdown ───────────────────────────────────────────────────────

/**
 * Returns an array of game rows sorted by avg_viewers desc.
 * Only includes games with >= GAME_BREAKDOWN_MIN sessions.
 * Each row: { game, sessionCount, avgViewers, peakViewers, totalFollowers, promoRate, bestSession }
 */
export function buildGameBreakdown(sessions) {
  const map = {};

  sessions.forEach(s => {
    if (!s.game) return;
    if (!map[s.game]) map[s.game] = { sessions: [], peakViewers: 0, totalFollowers: 0, promoCount: 0 };
    const g = map[s.game];
    g.sessions.push(s);
    g.peakViewers = Math.max(g.peakViewers, s.peak_viewers || 0);
    g.totalFollowers += s.followers_gained || 0;
    if (s.promo_posted) g.promoCount++;
  });

  const rows = Object.entries(map)
    .filter(([, d]) => d.sessions.length >= THRESHOLDS.GAME_BREAKDOWN_MIN)
    .map(([game, d]) => {
      const viewerSessions = d.sessions.filter(s => s.avg_viewers != null && s.avg_viewers > 0);
      const avgViewers = avg(viewerSessions.map(s => s.avg_viewers));
      const bestSession = d.sessions.reduce((best, s) =>
        (s.avg_viewers || 0) > (best?.avg_viewers || 0) ? s : best, null);

      return {
        game,
        sessionCount: d.sessions.length,
        avgViewers: avgViewers !== null ? Math.round(avgViewers) : null,
        peakViewers: d.peakViewers || null,
        totalFollowers: d.totalFollowers,
        promoRate: Math.round((d.promoCount / d.sessions.length) * 100),
        bestSession,
      };
    })
    .sort((a, b) => (b.avgViewers || 0) - (a.avgViewers || 0));

  // Normalize bar widths: 100% = top game
  const maxAvg = rows[0]?.avgViewers || 1;
  rows.forEach(r => { r.barWidth = r.avgViewers != null ? Math.round((r.avgViewers / maxAvg) * 100) : 0; });

  return {
    rows,
    hasEnoughData: rows.length > 0,
    topGame: rows[0]?.game || null,
  };
}

// ─── 4. Time Slot Heatmap ────────────────────────────────────────────────────

/**
 * Returns a 7×19 grid (Mon–Sun × 6am–midnight) of cell data.
 * Each cell: { count, avgViewers, intensity: 0–1 }
 * Hours array: [6, 7, ..., 24]
 * Days array: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
 */
export const HEATMAP_HOURS = Array.from({ length: 19 }, (_, i) => i + 6);
export const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function buildHeatmapData(sessions) {
  const withTime = sessions.filter(s => s.start_time && s.stream_date);

  if (withTime.length < THRESHOLDS.HEATMAP_MIN_SESSIONS) {
    return { grid: null, hasEnoughData: false, sessionCount: withTime.length };
  }

  // grid[dayIndex][hour] = { count, totalViewers }
  const raw = Array.from({ length: 7 }, () => ({}));
  withTime.forEach(s => {
    const d = dayIndex(s.stream_date);
    const h = hourBucket(s.start_time);
    if (h === null || h < 6) return;
    if (!raw[d][h]) raw[d][h] = { count: 0, totalViewers: 0 };
    raw[d][h].count++;
    raw[d][h].totalViewers += s.avg_viewers || 0;
  });

  const allCounts = HEATMAP_DAYS.flatMap((_, d) => HEATMAP_HOURS.map(h => raw[d][h]?.count || 0));
  const maxCount = Math.max(...allCounts, 1);

  const grid = HEATMAP_DAYS.map((day, d) =>
    HEATMAP_HOURS.map(h => {
      const cell = raw[d][h];
      if (!cell) return { count: 0, avgViewers: null, intensity: 0 };
      return {
        count: cell.count,
        avgViewers: cell.totalViewers > 0 ? Math.round(cell.totalViewers / cell.count) : null,
        intensity: cell.count / maxCount,
      };
    })
  );

  // Best slot
  let bestDay = null, bestHour = null, bestCount = 0;
  HEATMAP_DAYS.forEach((day, d) => {
    HEATMAP_HOURS.forEach((h, hi) => {
      if (grid[d][hi].count > bestCount) {
        bestCount = grid[d][hi].count;
        bestDay = day;
        bestHour = h;
      }
    });
  });

  return {
    grid,
    hours: HEATMAP_HOURS,
    days: HEATMAP_DAYS,
    hasEnoughData: true,
    sessionCount: withTime.length,
    bestSlot: bestDay ? { day: bestDay, hour: bestHour, count: bestCount } : null,
  };
}

// ─── 5. Promo Impact ─────────────────────────────────────────────────────────

/**
 * Compares average viewers for sessions with vs without promo.
 * hasEnoughData: false if either group has fewer than PROMO_IMPACT_MIN_EACH sessions with viewer data.
 */
export function buildPromoImpact(sessions) {
  const withViewers = sessions.filter(s => s.avg_viewers != null && s.avg_viewers > 0);
  const withPromo = withViewers.filter(s => s.promo_posted);
  const withoutPromo = withViewers.filter(s => !s.promo_posted);

  const avgWith = avg(withPromo.map(s => s.avg_viewers));
  const avgWithout = avg(withoutPromo.map(s => s.avg_viewers));
  const hasEnoughData =
    withPromo.length >= THRESHOLDS.PROMO_IMPACT_MIN_EACH &&
    withoutPromo.length >= THRESHOLDS.PROMO_IMPACT_MIN_EACH;

  const diff = hasEnoughData && avgWith !== null && avgWithout !== null
    ? avgWith - avgWithout : null;
  const pct = diff !== null && avgWithout > 0
    ? Math.round((diff / avgWithout) * 100) : null;

  const totalSessions = sessions.length;
  const promoCount = sessions.filter(s => s.promo_posted).length;
  const promoRate = totalSessions > 0 ? Math.round((promoCount / totalSessions) * 100) : 0;

  return {
    hasEnoughData,
    withPromoCount: withPromo.length,
    withoutPromoCount: withoutPromo.length,
    avgViewersWith: avgWith !== null ? Math.round(avgWith) : null,
    avgViewersWithout: avgWithout !== null ? Math.round(avgWithout) : null,
    viewerDiff: diff !== null ? Math.round(diff) : null,
    viewerDiffPct: pct,
    promoRate,
    promoCount,
    totalSessions,
  };
}

// ─── 6. Session History Filter + Sort ───────────────────────────────────────

const SORTABLE = {
  stream_date: (s) => s.stream_date || "",
  avg_viewers: (s) => s.avg_viewers ?? -1,
  peak_viewers: (s) => s.peak_viewers ?? -1,
  duration_minutes: (s) => s.duration_minutes ?? -1,
  followers_gained: (s) => s.followers_gained ?? -1,
  game: (s) => (s.game || "").toLowerCase(),
};

/**
 * Filters and sorts sessions for the history table.
 * @param {Array} sessions
 * @param {{ query: string, sortKey: string, sortDir: 'asc'|'desc', page: number, pageSize: number }} opts
 * @returns {{ rows, total, totalPages, page }}
 */
export function filterSessions(sessions, {
  query = "",
  sortKey = "stream_date",
  sortDir = "desc",
  page = 0,
  pageSize = 10,
} = {}) {
  const q = query.trim().toLowerCase();
  const filtered = sessions.filter(s => {
    if (!q) return true;
    return (
      s.game?.toLowerCase().includes(q) ||
      s.stream_date?.includes(q) ||
      s.stream_type?.toLowerCase().includes(q) ||
      s.notes?.toLowerCase().includes(q)
    );
  });

  const getter = SORTABLE[sortKey] || SORTABLE.stream_date;
  const sorted = [...filtered].sort((a, b) => {
    const va = getter(a);
    const vb = getter(b);
    const cmp = typeof va === "number" ? va - vb : va.localeCompare(vb);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const rows = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return {
    rows,
    total: filtered.length,
    totalPages,
    page: safePage,
  };
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ============================================================================
// buildCreatorContext
// Shared data layer for AI_STRATEGIST and AI_COACH agents.
// Returns a normalized, computed creator context object.
// ============================================================================

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function median(arr) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function safeRatio(value, baseline) {
  if (!baseline || baseline === 0) return 1.0;
  return clamp(value / baseline, 0.5, 1.5);
}

// ── Build Baselines from last N sessions ──
function buildBaselines(sessions, n = 10) {
  const recent = sessions.slice(0, n);
  if (recent.length === 0) return null;

  return {
    avg_viewers_median: median(recent.map(s => s.avg_viewers).filter(v => v != null && v > 0)),
    peak_viewers_median: median(recent.map(s => s.peak_viewers).filter(v => v != null && v > 0)),
    followers_gained_median: median(recent.map(s => s.followers_gained || 0)),
    comments_median: median(recent.map(s => s.comments || 0)),
    shares_median: median(recent.map(s => s.shares || 0)),
    gifters_median: median(recent.map(s => s.gifters_count || s.gifters || 0)),
    diamonds_median: median(recent.map(s => s.diamonds || 0)),
    likes_median: median(recent.map(s => s.likes_received || 0)),
    duration_median: median(recent.map(s => s.duration_minutes).filter(v => v != null && v > 0)),
    sample_size: recent.length,
  };
}

// ── Score a single session against baselines ──
function scoreSession(session, baselines) {
  if (!baselines || !baselines.avg_viewers_median) return null;

  const viewer = safeRatio(session.avg_viewers || 0, baselines.avg_viewers_median);
  const growth = safeRatio(session.followers_gained || 0, baselines.followers_gained_median || 1);
  const engagement = (
    safeRatio(session.comments || 0, baselines.comments_median || 1) +
    safeRatio(session.shares || 0, baselines.shares_median || 1) +
    safeRatio(session.likes_received || 0, baselines.likes_median || 1)
  ) / 3;
  const monetization = (
    safeRatio(session.gifters_count || session.gifters || 0, baselines.gifters_median || 1) +
    safeRatio(session.diamonds || 0, baselines.diamonds_median || 1)
  ) / 2;
  const execution = [
    session.promo_posted ? 1 : 0,
    session.went_as_planned ? 1 : 0,
    session.replay_reviewed ? 1 : 0,
  ].reduce((a, b) => a + b, 0) / 3;

  const total =
    0.35 * viewer +
    0.20 * growth +
    0.20 * engagement +
    0.15 * monetization +
    0.10 * execution;

  return {
    session_score: Math.round(total * 100) / 100,
    viewer_score: Math.round(viewer * 100) / 100,
    growth_score: Math.round(growth * 100) / 100,
    engagement_score: Math.round(engagement * 100) / 100,
    monetization_score: Math.round(monetization * 100) / 100,
    execution_score: Math.round(execution * 100) / 100,
  };
}

// ── Build pattern tables grouped by dimension ──
function buildPatterns(sessions, baselines, groupKey) {
  const groups = {};
  for (const s of sessions) {
    const key = s[groupKey] || "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }

  const patterns = {};
  for (const [key, group] of Object.entries(groups)) {
    const scores = group.map(s => scoreSession(s, baselines)).filter(Boolean);
    patterns[key] = {
      sample_size: group.length,
      median_avg_viewers: median(group.map(s => s.avg_viewers).filter(v => v != null)),
      median_peak_viewers: median(group.map(s => s.peak_viewers).filter(v => v != null)),
      median_followers_gained: median(group.map(s => s.followers_gained || 0)),
      median_comments: median(group.map(s => s.comments || 0)),
      median_shares: median(group.map(s => s.shares || 0)),
      median_gifters: median(group.map(s => s.gifters_count || s.gifters || 0)),
      median_diamonds: median(group.map(s => s.diamonds || 0)),
      median_duration: median(group.map(s => s.duration_minutes).filter(v => v != null)),
      median_session_score: scores.length ? median(scores.map(s => s.session_score)) : null,
      confidence: group.length >= 5 ? "high" : group.length >= 3 ? "medium" : "low",
    };
  }
  return patterns;
}

// ── Normalize LiveSession + DesktopSession into unified sessions ──
function normalizeSession(live, desktop) {
  if (live && desktop) {
    // Merged — prefer LiveSession for most fields, Desktop for timeline/alerts
    return {
      session_key: live.external_session_key || `live_${live.id}`,
      live_session_id: live.id,
      desktop_session_id: desktop.id,
      stream_date: live.stream_date,
      game: live.game || "",
      stream_type: live.stream_type || "other",
      platform: desktop.platform || "TikTok",
      start_time: live.start_time || desktop.started_at || "",
      end_time: live.end_time || desktop.ended_at || "",
      duration_minutes: live.duration_minutes || desktop.duration_min || null,
      avg_viewers: live.avg_viewers ?? desktop.avg_viewers ?? null,
      peak_viewers: live.peak_viewers ?? desktop.peak_viewers ?? null,
      followers_gained: live.followers_gained || desktop.total_follows || 0,
      likes_received: live.likes_received || 0,
      comments: live.comments || 0,
      shares: live.shares || desktop.total_shares || 0,
      gifters_count: live.gifters || 0,
      diamonds: live.diamonds || 0,
      fan_club_joins: live.fan_club_joins || 0,
      promo_posted: live.promo_posted || false,
      went_as_planned: live.went_as_planned ?? true,
      energy_level: live.energy_level || "medium",
      best_moment: live.best_moment || "",
      weakest_moment: live.weakest_moment || "",
      spike_reason: live.spike_reason || "",
      drop_off_reason: live.drop_off_reason || "",
      desktop_alerts_fired: desktop.alerts_fired || 0,
      desktop_alerts_helpful: desktop.alerts_marked_helpful || 0,
      desktop_timeline: desktop.timeline || "[]",
      replay_reviewed: live.replay_reviewed || false,
      source_live_session: true,
      source_desktop_session: true,
      source_manual: live.source === "manual",
      source_extension: live.source === "extension_import" || live.source === "hybrid",
      week_number: live.week_number,
      year: live.year,
      notes: live.notes || desktop.notes || "",
    };
  }

  if (live) {
    return {
      session_key: live.external_session_key || `live_${live.id}`,
      live_session_id: live.id,
      desktop_session_id: null,
      stream_date: live.stream_date,
      game: live.game || "",
      stream_type: live.stream_type || "other",
      platform: "TikTok",
      start_time: live.start_time || "",
      end_time: live.end_time || "",
      duration_minutes: live.duration_minutes || null,
      avg_viewers: live.avg_viewers ?? null,
      peak_viewers: live.peak_viewers ?? null,
      followers_gained: live.followers_gained || 0,
      likes_received: live.likes_received || 0,
      comments: live.comments || 0,
      shares: live.shares || 0,
      gifters_count: live.gifters || 0,
      diamonds: live.diamonds || 0,
      fan_club_joins: live.fan_club_joins || 0,
      promo_posted: live.promo_posted || false,
      went_as_planned: live.went_as_planned ?? true,
      energy_level: live.energy_level || "medium",
      best_moment: live.best_moment || "",
      weakest_moment: live.weakest_moment || "",
      spike_reason: live.spike_reason || "",
      drop_off_reason: live.drop_off_reason || "",
      desktop_alerts_fired: 0,
      desktop_alerts_helpful: 0,
      desktop_timeline: "[]",
      replay_reviewed: live.replay_reviewed || false,
      source_live_session: true,
      source_desktop_session: false,
      source_manual: live.source === "manual",
      source_extension: live.source === "extension_import" || live.source === "hybrid",
      week_number: live.week_number,
      year: live.year,
      notes: live.notes || "",
    };
  }

  if (desktop) {
    const d = desktop.started_at ? new Date(desktop.started_at) : new Date();
    return {
      session_key: `desktop_${desktop.session_id}`,
      live_session_id: null,
      desktop_session_id: desktop.id,
      stream_date: d.toISOString().split("T")[0],
      game: desktop.title || "",
      stream_type: "other",
      platform: desktop.platform || "TikTok",
      start_time: desktop.started_at || "",
      end_time: desktop.ended_at || "",
      duration_minutes: desktop.duration_min || null,
      avg_viewers: desktop.avg_viewers ?? null,
      peak_viewers: desktop.peak_viewers ?? null,
      followers_gained: desktop.total_follows || 0,
      likes_received: 0,
      comments: 0,
      shares: desktop.total_shares || 0,
      gifters_count: 0,
      diamonds: 0,
      fan_club_joins: 0,
      promo_posted: false,
      went_as_planned: true,
      energy_level: "medium",
      best_moment: "",
      weakest_moment: "",
      spike_reason: "",
      drop_off_reason: "",
      desktop_alerts_fired: desktop.alerts_fired || 0,
      desktop_alerts_helpful: desktop.alerts_marked_helpful || 0,
      desktop_timeline: desktop.timeline || "[]",
      replay_reviewed: false,
      source_live_session: false,
      source_desktop_session: true,
      source_manual: false,
      source_extension: false,
      week_number: getISOWeek(d),
      year: d.getFullYear(),
      notes: desktop.notes || "",
    };
  }

  return null;
}

// ── Match desktop sessions to live sessions by date/time overlap ──
function matchDesktopToLive(liveSessions, desktopSessions) {
  const matched = [];
  const usedDesktop = new Set();
  const usedLive = new Set();

  for (const live of liveSessions) {
    const liveDate = live.stream_date;
    const match = desktopSessions.find(d => {
      if (usedDesktop.has(d.id)) return false;
      const dDate = d.started_at ? d.started_at.split("T")[0] : null;
      return dDate === liveDate;
    });
    if (match) {
      matched.push(normalizeSession(live, match));
      usedDesktop.add(match.id);
      usedLive.add(live.id);
    } else {
      matched.push(normalizeSession(live, null));
      usedLive.add(live.id);
    }
  }

  // Unmatched desktop sessions
  for (const d of desktopSessions) {
    if (!usedDesktop.has(d.id)) {
      matched.push(normalizeSession(null, d));
    }
  }

  // Sort by stream_date descending
  matched.sort((a, b) => (b.stream_date || "").localeCompare(a.stream_date || ""));
  return matched;
}

// ── Connection health ──
function buildConnectionHealth(accounts, connections) {
  const tiktokAccount = accounts.find(a => a.provider === "tiktok" && a.connection_status === "connected");
  const tiktokConn = connections.find(c => c.connected);

  return {
    tiktok_connected: !!(tiktokAccount || tiktokConn),
    last_sync_at: tiktokAccount?.last_sync_at || tiktokConn?.last_sync_at || null,
    last_sync_status: tiktokAccount?.last_sync_status || tiktokConn?.last_sync_status || "never",
    stale: (() => {
      const lastSync = tiktokAccount?.last_sync_at || tiktokConn?.last_sync_at;
      if (!lastSync) return true;
      const age = Date.now() - new Date(lastSync).getTime();
      return age > 24 * 60 * 60 * 1000; // stale if > 24h
    })(),
  };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await req.json();
  const scope = payload.scope || "full"; // "full" | "strategy" | "coach" | "quick"
  const sessionLimit = payload.session_limit || 200;

  const now = new Date();
  const currentWeek = getISOWeek(now);
  const currentYear = now.getFullYear();
  const today = now.toISOString().split("T")[0];

  // ── Fetch all data in parallel ──
  const [
    profiles,
    liveSessions,
    desktopSessions,
    scheduledStreams,
    weeklyPlans,
    goals,
    goLivePreps,
    promoKits,
    experiments,
    weeklyRecaps,
    dailyRecs,
    alerts,
    replayReviews,
    tiktokSnapshots,
    tiktokVideos,
    connectedAccounts,
    tiktokConnections,
    coachActions,
  ] = await Promise.all([
    base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email }),
    base44.asServiceRole.entities.LiveSession.filter({ owner_email: user.email }, "-stream_date", sessionLimit),
    base44.asServiceRole.entities.DesktopSession.filter({ user_id: user.id }, "-created_date", sessionLimit),
    base44.asServiceRole.entities.ScheduledStream.filter({ created_by: user.email }),
    base44.asServiceRole.entities.WeeklyPlan.filter({ created_by: user.email, week_number: currentWeek, year: currentYear }),
    base44.asServiceRole.entities.GrowthGoal.filter({ created_by: user.email, status: "active" }),
    base44.asServiceRole.entities.GoLivePrep.filter({ created_by: user.email, stream_date: today }),
    base44.asServiceRole.entities.PromoKit.filter({ created_by: user.email }, "-created_date", 10),
    base44.asServiceRole.entities.Experiment.filter({ created_by: user.email }),
    base44.asServiceRole.entities.WeeklyRecap.filter({ created_by: user.email }, "-week_start_date", 8),
    base44.asServiceRole.entities.DailyRecommendation.filter({ created_by: user.email, date: today }),
    base44.asServiceRole.entities.PerformanceAlert.filter({ created_by: user.email, dismissed: false }, "-created_date", 20),
    base44.asServiceRole.entities.ReplayReview.filter({ created_by: user.email }, "-reviewed_at", 10),
    base44.asServiceRole.entities.TikTokProfileSnapshot.filter({}, "-captured_at", 30),
    base44.asServiceRole.entities.TikTokVideo.filter({}, "-created_date", 50),
    base44.asServiceRole.entities.ConnectedAccount.filter({ created_by: user.email }),
    base44.asServiceRole.entities.TikTokConnection.filter({ user_id: user.id }),
    scope === "coach" ? base44.asServiceRole.entities.CoachActionLog.filter({ created_by: user.email }, "-sent_at", 50) : Promise.resolve([]),
  ]);

  const profile = profiles[0] || null;

  // ── Normalize sessions ──
  const normalizedSessions = matchDesktopToLive(liveSessions, desktopSessions);

  // ── Build baselines ──
  const baselines = buildBaselines(normalizedSessions, 10);

  // ── Score each session ──
  const scoredSessions = normalizedSessions.map(s => {
    const scores = scoreSession(s, baselines);
    return { ...s, ...(scores || {}) };
  });

  // ── Build pattern tables ──
  const patterns = {
    by_game: buildPatterns(scoredSessions, baselines, "game"),
    by_stream_type: buildPatterns(scoredSessions, baselines, "stream_type"),
    by_energy: buildPatterns(scoredSessions, baselines, "energy_level"),
    by_promo: buildPatterns(scoredSessions.map(s => ({ ...s, promo_group: s.promo_posted ? "with_promo" : "no_promo" })), baselines, "promo_group"),
    by_weekday: buildPatterns(scoredSessions.map(s => {
      const d = new Date(s.stream_date);
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return { ...s, weekday: days[d.getDay()] };
    }), baselines, "weekday"),
  };

  // ── Connection health ──
  const connectionHealth = buildConnectionHealth(connectedAccounts, tiktokConnections);

  // ── Upcoming streams ──
  const upcomingStreams = scheduledStreams
    .filter(s => s.scheduled_date >= today && s.status !== "cancelled")
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
    .slice(0, 10);

  // ── Confidence assessment ──
  const totalSessions = scoredSessions.length;
  const confidence = {
    overall: totalSessions >= 10 ? "high" : totalSessions >= 5 ? "medium" : totalSessions >= 1 ? "low" : "none",
    baselines: baselines ? (baselines.sample_size >= 10 ? "high" : baselines.sample_size >= 5 ? "medium" : "low") : "none",
    tiktok_data: connectionHealth.tiktok_connected && !connectionHealth.stale ? "high" : connectionHealth.tiktok_connected ? "medium" : "none",
    sessions_available: totalSessions,
  };

  // ── Build response ──
  const context = {
    creator_id: user.id,
    creator_email: user.email,
    now: now.toISOString(),
    today,
    current_week: currentWeek,
    current_year: currentYear,

    profile,
    connection_health: connectionHealth,
    confidence,

    goals,
    weekly_plan: weeklyPlans[0] || null,
    upcoming_streams: upcomingStreams,
    go_live_prep: goLivePreps[0] || null,

    recent_sessions: scoredSessions.slice(0, 30),
    recent_5: scoredSessions.slice(0, 5),
    recent_10: scoredSessions.slice(0, 10),

    baselines,
    patterns,

    recent_recommendations: dailyRecs,
    recent_alerts: alerts,
    recent_replay_reviews: replayReviews.slice(0, 5),
    recent_promo_kits: promoKits.slice(0, 5),
    active_experiments: experiments.filter(e => e.status === "active"),
    completed_experiments: experiments.filter(e => e.status === "completed").slice(0, 5),
    weekly_recaps: weeklyRecaps,

    tiktok_snapshots: tiktokSnapshots.slice(0, 10),
    tiktok_videos: tiktokVideos.slice(0, 20),
  };

  // Coach-specific additions
  if (scope === "coach") {
    context.recent_coach_actions = coachActions;
    context.coach_effectiveness = (() => {
      if (!coachActions.length) return null;
      const total = coachActions.length;
      const helpful = coachActions.filter(a => a.helpful).length;
      const dismissed = coachActions.filter(a => a.dismissed).length;
      const byType = {};
      for (const a of coachActions) {
        if (!byType[a.action_type]) byType[a.action_type] = { total: 0, helpful: 0, dismissed: 0 };
        byType[a.action_type].total++;
        if (a.helpful) byType[a.action_type].helpful++;
        if (a.dismissed) byType[a.action_type].dismissed++;
      }
      return { total, helpful, dismissed, helpful_rate: total > 0 ? helpful / total : 0, by_type: byType };
    })();
  }

  return Response.json(context);
});
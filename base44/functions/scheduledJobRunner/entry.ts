/**
 * AltCtrl Scheduled Job Runner
 *
 * Architecture:
 *   - One orchestrator function handles both daily and weekly jobs.
 *   - Triggered by two automations (daily + weekly) via function_args: { mode: "daily" | "weekly" }
 *   - Runs jobs for ALL users who have a CreatorProfile.
 *   - Each job is isolated: a failure in one job/user never blocks others.
 *   - Retry logic wraps every job (up to MAX_RETRIES attempts with backoff).
 *   - TikTok follower sync is stubbed as a placeholder — no fake API calls.
 *
 * Job registry:
 *   DAILY:   promoReminder, generateDailyCoaching, generateAlerts
 *   WEEKLY:  generateWeeklyPlan, generateWeeklyRecap, followerSync (placeholder)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

// ─── Utility ──────────────────────────────────────────────────────────────────

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Retry wrapper — runs fn() up to MAX_RETRIES times with exponential backoff.
 * Returns { ok: true, result } or { ok: false, error }.
 */
async function withRetry(label, fn) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const result = await fn();
      return { ok: true, result };
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt > MAX_RETRIES;
      if (!isLastAttempt) {
        console.warn(`[${label}] attempt ${attempt} failed: ${err.message}. Retrying...`);
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }
  console.error(`[${label}] all ${MAX_RETRIES + 1} attempts failed: ${lastError?.message}`);
  return { ok: false, error: lastError?.message };
}

// ─── Daily Jobs ───────────────────────────────────────────────────────────────

/**
 * Promo Reminder
 * If a creator has a stream scheduled today and hasn't posted promo, create a warning alert.
 */
async function jobPromoReminder(sr, userEmail) {
  const today = new Date().toISOString().split('T')[0];

  const [streams, existingAlerts] = await Promise.all([
    sr.entities.ScheduledStream.filter({ created_by: userEmail, scheduled_date: today }),
    sr.entities.PerformanceAlert.filter({ created_by: userEmail, alert_type: 'promo_missed', dismissed: false }, '-created_date', 5),
  ]);

  const todayStreams = streams.filter(s => s.status === 'planned' || s.status === 'live');
  if (todayStreams.length === 0) return { skipped: 'no streams today' };

  // Deduplicate: don't re-alert if we already reminded today
  const alreadyToday = existingAlerts.some(a => {
    const created = new Date(a.created_date).toISOString().split('T')[0];
    return created === today;
  });
  if (alreadyToday) return { skipped: 'already reminded today' };

  const stream = todayStreams[0];
  const timeLabel = stream.start_time ? ` at ${stream.start_time}` : '';
  const created = [];

  for (const s of todayStreams) {
    await sr.entities.PerformanceAlert.create({
      alert_type: 'promo_missed',
      severity: 'warning',
      title: `Post Promo Before Going Live`,
      body: `You have a ${s.game} stream${timeLabel} today. Creators who post promo before going live consistently reach more viewers. Generate your kit in the Promo tab.`,
      source: 'system',
      read: false,
      dismissed: false,
    });
    created.push(s.game);
  }

  return { created };
}

/**
 * Daily Coaching Card
 * Generates a DailyRecommendation for today if one doesn't already exist.
 */
async function jobDailyCoaching(sr, userEmail) {
  const today = new Date().toISOString().split('T')[0];

  const existing = await sr.entities.DailyRecommendation.filter(
    { created_by: userEmail, date: today }, '-created_date', 1
  );
  if (existing.length > 0) return { skipped: 'already generated today' };

  const now = new Date();
  const weekNumber = getISOWeek(now);
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  const [profiles, sessions, goals, streams] = await Promise.all([
    sr.entities.CreatorProfile.filter({ created_by: userEmail }),
    sr.entities.LiveSession.filter({ created_by: userEmail }, '-stream_date', 10),
    sr.entities.GrowthGoal.filter({ created_by: userEmail, status: 'active' }),
    sr.entities.ScheduledStream.filter({ created_by: userEmail }, '-scheduled_date', 14),
  ]);

  const profile = profiles[0] || null;
  if (!profile) return { skipped: 'no creator profile' };

  const weekStart = getMondayOfWeek(now);
  const thisWeekStreams = streams.filter(s => new Date(s.scheduled_date) >= weekStart);
  const todayStream = thisWeekStreams.find(s => s.scheduled_date === today);

  const sessionsWithViewers = sessions.filter(s => s.avg_viewers > 0);
  const avgViewers = sessionsWithViewers.length > 0
    ? Math.round(sessionsWithViewers.reduce((a, s) => a + s.avg_viewers, 0) / sessionsWithViewers.length)
    : null;

  const promoRate = sessions.length > 0
    ? Math.round((sessions.filter(s => s.promo_posted).length / sessions.length) * 100) : 0;

  const gameMap = {};
  sessions.forEach(s => {
    if (!s.game) return;
    if (!gameMap[s.game]) gameMap[s.game] = { total: 0, count: 0 };
    gameMap[s.game].total += s.avg_viewers || 0;
    gameMap[s.game].count++;
  });
  const bestGame = Object.entries(gameMap)
    .sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0]?.[0] || null;

  const prompt = `You are AltCtrl, an AI coach for TikTok LIVE gaming creators. Generate a daily coaching card for ${dayName}, ${today}.

Creator: ${profile.display_name || 'Creator'} | Goal: ${profile.stream_goal?.replace(/_/g, ' ') || 'grow followers'} | Target: ${profile.weekly_stream_target || 3} streams/week
Recent: avg ${avgViewers ?? 'unknown'} viewers | promo rate ${promoRate}% | best game: ${bestGame || 'not enough data'}
Goals: ${goals.length > 0 ? goals.map(g => `${g.title || g.goal_type} → ${g.target_value} ${g.unit || ''}`).join(', ') : 'none set'}
Today has stream: ${todayStream ? `${todayStream.game} at ${todayStream.start_time || 'TBD'}` : 'no'}

Give specific, data-backed coaching. Reference actual numbers. No generic advice.

Return JSON: { focus_title (≤8 words), focus_body (2-3 sentences), action_items (array of 3 imperatives) }`;

  const result = await sr.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        focus_title: { type: 'string' },
        focus_body: { type: 'string' },
        action_items: { type: 'array', items: { type: 'string' } },
      },
    },
  });

  const rec = await sr.entities.DailyRecommendation.create({
    date: today,
    week_number: weekNumber,
    year: now.getFullYear(),
    focus_title: result.focus_title,
    focus_body: result.focus_body,
    action_items: result.action_items || [],
    recommendation_type: todayStream ? 'schedule' : 'general',
    priority: 'high',
    source: 'ai_generated',
    dismissed: false,
  });

  return { created: rec.id };
}

/**
 * Generate Performance Alerts
 * Delegates to the generateAlerts function logic inline (service role version).
 * Deduplication is by alert_type + week_number + year.
 */
async function jobGenerateAlerts(sr, userEmail) {
  const now = new Date();
  const week = getISOWeek(now);
  const year = now.getFullYear();

  const [profile, liveSessions, desktopSessionsRaw, existingAlerts] = await Promise.all([
    sr.entities.CreatorProfile.filter({ created_by: userEmail }).then(r => r[0] || null),
    sr.entities.LiveSession.filter({ created_by: userEmail }, '-stream_date', 200),
    sr.entities.DesktopSession.filter({ user_id: userEmail }, '-started_at', 200),
    sr.entities.PerformanceAlert.filter({ created_by: userEmail, dismissed: false }, '-created_date', 100),
  ]);

  if (!profile) return { skipped: 'no creator profile' };

  // Merge LiveSession + DesktopSession
  const normalizedDesktop = desktopSessionsRaw.map(d => ({
    stream_date: d.started_at ? d.started_at.split('T')[0] : null,
    avg_viewers: d.avg_viewers ?? 0,
    peak_viewers: d.peak_viewers ?? 0,
    promo_posted: false,
  }));
  const liveDates = new Set(liveSessions.map(s => s.stream_date));
  const uniqueDesktop = normalizedDesktop.filter(d => d.stream_date && !liveDates.has(d.stream_date));
  const sessions = [...liveSessions, ...uniqueDesktop];

  const weeklyTarget = profile.weekly_stream_target || 3;

  function weekStart(weeksAgo = 0) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) - weeksAgo * 7);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  function alreadyAlerted(alertType) {
    return existingAlerts.some(a =>
      a.alert_type === alertType && a.week_number === week && a.year === year
    );
  }

  const toCreate = [];
  const thisWeekStart = weekStart(0);
  const lastWeekStart = weekStart(1);
  const twoWeeksAgoStart = weekStart(2);

  // Streak milestone
  if (!alreadyAlerted('streak_milestone')) {
    let streak = 0;
    for (let w = 0; w < 12; w++) {
      const wStart = weekStart(w);
      const wEnd = new Date(wStart.getTime() + 7 * 86400000 - 1);
      const count = sessions.filter(s => { const d = new Date(s.stream_date + 'T12:00:00'); return d >= wStart && d <= wEnd; }).length;
      if (count >= weeklyTarget) streak++; else break;
    }
    if (streak >= 2 && [2, 3, 4, 5, 8, 12].includes(streak)) {
      toCreate.push({ alert_type: 'streak_milestone', severity: 'success', title: `🔥 ${streak}-Week Streak!`, body: `You've hit your ${weeklyTarget}-stream target for ${streak} weeks in a row. Keep the momentum going.`, week_number: week, year, source: 'ai_generated' });
    }
  }

  // Consistency drop
  if (!alreadyAlerted('consistency_drop')) {
    const thisWeek = sessions.filter(s => new Date(s.stream_date + 'T12:00:00') >= thisWeekStart);
    const lastWeek = sessions.filter(s => { const d = new Date(s.stream_date + 'T12:00:00'); return d >= lastWeekStart && d < thisWeekStart; });
    const daysIn = now.getUTCDay() === 0 ? 7 : now.getUTCDay();
    const projected = Math.round(thisWeek.length / (daysIn / 7));
    if (lastWeek.length >= weeklyTarget && projected < weeklyTarget && daysIn >= 3) {
      const deficit = weeklyTarget - thisWeek.length;
      toCreate.push({ alert_type: 'consistency_drop', severity: 'warning', title: 'Consistency at Risk', body: `${thisWeek.length} streams so far this week, ${deficit} more needed to match last week's pace and hit your ${weeklyTarget}-stream target.`, week_number: week, year, source: 'ai_generated' });
    }
  }

  // Streak broken
  if (!alreadyAlerted('missed_streams')) {
    const lastWeek = sessions.filter(s => { const d = new Date(s.stream_date + 'T12:00:00'); return d >= lastWeekStart && d < thisWeekStart; });
    const prevWeek = sessions.filter(s => { const d = new Date(s.stream_date + 'T12:00:00'); return d >= twoWeeksAgoStart && d < lastWeekStart; });
    if (lastWeek.length < weeklyTarget && prevWeek.length >= weeklyTarget) {
      toCreate.push({ alert_type: 'missed_streams', severity: 'warning', title: 'Streak Broken Last Week', body: `You fell short of your ${weeklyTarget}-stream target last week after hitting it the week before. This week is a reset — start clean.`, week_number: week, year, source: 'ai_generated' });
    }
  }

  if (toCreate.length > 0) {
    await Promise.all(toCreate.map(a => sr.entities.PerformanceAlert.create({ ...a, created_by: userEmail })));
  }

  return { created: toCreate.length };
}

// ─── Weekly Jobs ──────────────────────────────────────────────────────────────

/**
 * Weekly Game Plan
 * Generates a WeeklyPlan for the current week if one doesn't exist.
 */
async function jobWeeklyPlan(sr, userEmail) {
  const now = new Date();
  const weekNumber = getISOWeek(now);
  const year = now.getFullYear();

  const existing = await sr.entities.WeeklyPlan.filter(
    { created_by: userEmail, week_number: weekNumber, year }, '-created_date', 1
  );
  if (existing.length > 0) return { skipped: 'plan already exists for this week' };

  const monday = getMondayOfWeek(now);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekStart = monday.toISOString().split('T')[0];
  const weekEnd = sunday.toISOString().split('T')[0];

  const [profiles, liveSess, desktopSess, goals] = await Promise.all([
    sr.entities.CreatorProfile.filter({ created_by: userEmail }),
    sr.entities.LiveSession.filter({ created_by: userEmail }, '-stream_date', 20),
    sr.entities.DesktopSession.filter({ user_id: userEmail }, '-started_at', 20),
    sr.entities.GrowthGoal.filter({ created_by: userEmail, status: 'active' }),
  ]);

  // Merge sessions
  const ndsk = desktopSess.map(d => ({
    stream_date: d.started_at ? d.started_at.split('T')[0] : null,
    game: d.game || d.title || '',
    avg_viewers: d.avg_viewers ?? 0,
    peak_viewers: d.peak_viewers ?? 0,
  }));
  const ldates = new Set(liveSess.map(s => s.stream_date));
  const sessions = [...liveSess, ...ndsk.filter(d => d.stream_date && !ldates.has(d.stream_date))];

  const profile = profiles[0] || null;
  if (!profile) return { skipped: 'no creator profile' };

  const target = profile.weekly_stream_target || 3;

  const gameMap = {};
  sessions.forEach(s => {
    if (!s.game || !s.avg_viewers) return;
    if (!gameMap[s.game]) gameMap[s.game] = { total: 0, count: 0 };
    gameMap[s.game].total += s.avg_viewers;
    gameMap[s.game].count++;
  });
  const rankedGames = Object.entries(gameMap)
    .map(([game, d]) => ({ game, avg: Math.round(d.total / d.count) }))
    .sort((a, b) => b.avg - a.avg);

  const prompt = `You are AltCtrl. Generate a weekly game plan for week ${weekNumber} (${weekStart} to ${weekEnd}).
Creator: ${profile.display_name || 'Creator'} | Goal: ${profile.stream_goal?.replace(/_/g, ' ') || 'grow'} | Target: ${target} streams/week
Top games: ${rankedGames.slice(0, 3).map(g => `${g.game} (avg ${g.avg})`).join(', ') || 'no data yet'}
Goals: ${goals.map(g => `${g.goal_type} → ${g.target_value} ${g.unit || ''}`).join(', ') || 'none'}

Return JSON: { primary_game, secondary_games (array 1-2), stream_target (number), focus_note (2-3 sentences), ai_brief (1 sentence) }`;

  const result = await sr.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        primary_game: { type: 'string' },
        secondary_games: { type: 'array', items: { type: 'string' } },
        stream_target: { type: 'number' },
        focus_note: { type: 'string' },
        ai_brief: { type: 'string' },
      },
    },
  });

  const plan = await sr.entities.WeeklyPlan.create({
    week_number: weekNumber, year,
    week_start_date: weekStart, week_end_date: weekEnd,
    stream_target: result.stream_target || target,
    primary_game: result.primary_game || profile.primary_game || null,
    secondary_games: result.secondary_games || [],
    focus_note: result.focus_note,
    ai_brief: result.ai_brief,
    status: 'active',
    streams_completed: 0,
    promo_posted_count: 0,
  });

  return { created: plan.id };
}

/**
 * Weekly Recap
 * Generates a WeeklyRecap for last week if one doesn't exist.
 */
async function jobWeeklyRecap(sr, userEmail) {
  const now = new Date();
  const lastWeekDate = new Date(now);
  lastWeekDate.setDate(now.getDate() - 7);
  const recapWeek = getISOWeek(lastWeekDate);
  const recapYear = lastWeekDate.getFullYear();

  const existing = await sr.entities.WeeklyRecap.filter(
    { created_by: userEmail, week_number: recapWeek, year: recapYear }, '-created_date', 1
  );
  if (existing.length > 0) return { skipped: 'recap already exists for last week' };

  const monday = getMondayOfWeek(lastWeekDate);
  const weekStart = monday.toISOString().split('T')[0];
  const weekEnd = new Date(monday.getTime() + 6 * 86400000).toISOString().split('T')[0];

  const [profiles, allLive, allDesktop, scheduledStreams] = await Promise.all([
    sr.entities.CreatorProfile.filter({ created_by: userEmail }),
    sr.entities.LiveSession.filter({ created_by: userEmail }, '-stream_date', 60),
    sr.entities.DesktopSession.filter({ user_id: userEmail }, '-started_at', 60),
    sr.entities.ScheduledStream.filter({ created_by: userEmail }, '-scheduled_date', 30),
  ]);

  const profile = profiles[0] || null;
  if (!profile) return { skipped: 'no creator profile' };

  // Merge sessions
  const nDesk = allDesktop.map(d => ({
    stream_date: d.started_at ? d.started_at.split('T')[0] : null,
    game: d.game || d.title || '',
    avg_viewers: d.avg_viewers ?? 0,
    peak_viewers: d.peak_viewers ?? 0,
    duration_minutes: d.duration_min ?? 0,
    followers_gained: d.total_follows ?? 0,
    promo_posted: false,
  }));
  const lDates = new Set(allLive.map(s => s.stream_date));
  const allSessions = [...allLive, ...nDesk.filter(d => d.stream_date && !lDates.has(d.stream_date))];

  const weekSessions = allSessions.filter(s => s.stream_date >= weekStart && s.stream_date <= weekEnd);
  const weekScheduled = scheduledStreams.filter(s => s.scheduled_date >= weekStart && s.scheduled_date <= weekEnd);
  const target = profile.weekly_stream_target || 3;

  const avgViewers = weekSessions.length > 0 && weekSessions.some(s => s.avg_viewers > 0)
    ? Math.round(weekSessions.filter(s => s.avg_viewers > 0).reduce((a, s) => a + s.avg_viewers, 0) / weekSessions.filter(s => s.avg_viewers > 0).length)
    : null;
  const peakViewers = weekSessions.reduce((m, s) => Math.max(m, s.peak_viewers || 0), 0) || null;
  const totalFollowers = weekSessions.reduce((a, s) => a + (s.followers_gained || 0), 0);
  const totalMins = weekSessions.reduce((a, s) => a + (s.duration_minutes || 0), 0);
  const promoPosted = weekSessions.filter(s => s.promo_posted).length;
  const denominator = Math.max(weekScheduled.length, target);
  const consistencyScore = denominator > 0 ? Math.min(100, Math.round((weekSessions.length / denominator) * 100)) : null;

  const gameMap = {};
  weekSessions.forEach(s => {
    if (!s.game) return;
    if (!gameMap[s.game]) gameMap[s.game] = { total: 0, count: 0 };
    gameMap[s.game].total += s.avg_viewers || 0;
    gameMap[s.game].count++;
  });
  const topGame = Object.entries(gameMap).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0]?.[0] || null;

  let highlight = 'No sessions logged this week.';
  let aiSummary = 'No streams were logged. Schedule and log sessions to unlock recaps.';

  if (weekSessions.length > 0) {
    const prompt = `AltCtrl weekly recap for week ${recapWeek} (${weekStart}–${weekEnd}).
Creator: ${profile.display_name} | ${weekSessions.length}/${target} streams | avg ${avgViewers ?? 'N/A'} viewers | peak ${peakViewers ?? 'N/A'} | +${totalFollowers} followers | ${promoPosted}/${weekSessions.length} promos posted | top game: ${topGame || 'mixed'} | consistency: ${consistencyScore}%

Write a specific, data-backed recap. No generic advice. Return JSON: { highlight (1 sentence, cite a number), ai_summary (3-4 sentences weaving all metrics) }`;

    const result = await sr.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          highlight: { type: 'string' },
          ai_summary: { type: 'string' },
        },
      },
    });
    highlight = result.highlight;
    aiSummary = result.ai_summary;
  }

  const recap = await sr.entities.WeeklyRecap.create({
    week_number: recapWeek, year: recapYear,
    week_start_date: weekStart, week_end_date: weekEnd,
    streams_planned: weekScheduled.length || target,
    streams_completed: weekSessions.length,
    total_stream_minutes: totalMins,
    avg_viewers: avgViewers, peak_viewers: peakViewers,
    followers_gained: totalFollowers, promo_posted_count: promoPosted,
    consistency_score: consistencyScore, top_game: topGame,
    highlight, ai_summary: aiSummary,
  });

  return { created: recap.id };
}

/**
 * Follower Sync — Placeholder
 * TikTok integration is not yet available.
 * This job is registered for future activation once TikTok OAuth data is accessible.
 */
async function jobFollowerSync(_sr, userEmail) {
  // TODO: When TikTok connector is available, retrieve the user's connector token via:
  //   const accessToken = await sr.connectors.getCurrentAppUserAccessToken(TIKTOK_CONNECTOR_ID);
  //   Then call TikTok API: GET /v2/user/info/?fields=follower_count,following_count,likes_count
  //   And update CreatorProfile.follower_count accordingly.
  console.info(`[followerSync] Skipped for ${userEmail}: TikTok integration not yet active.`);
  return { skipped: 'TikTok integration not yet available' };
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { mode = 'daily' } = await req.json().catch(() => ({}));

    if (!['daily', 'weekly'].includes(mode)) {
      return Response.json({ error: `Unknown mode: "${mode}". Use "daily" or "weekly".` }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    // Get all users who have a profile (these are our active creators)
    const profiles = await sr.entities.CreatorProfile.list('-created_date', 200);
    const userEmails = [...new Set(profiles.map(p => p.created_by).filter(Boolean))];

    if (userEmails.length === 0) {
      return Response.json({ ok: true, mode, message: 'No creator profiles found.', results: [] });
    }

    const DAILY_JOBS = [
      { name: 'promoReminder', fn: jobPromoReminder },
      { name: 'dailyCoaching', fn: jobDailyCoaching },
      { name: 'generateAlerts', fn: jobGenerateAlerts },
    ];

    const WEEKLY_JOBS = [
      { name: 'weeklyPlan', fn: jobWeeklyPlan },
      { name: 'weeklyRecap', fn: jobWeeklyRecap },
      { name: 'followerSync', fn: jobFollowerSync },
    ];

    const jobs = mode === 'daily' ? DAILY_JOBS : WEEKLY_JOBS;
    const results = [];

    for (const userEmail of userEmails) {
      const userResult = { userEmail, jobs: {} };

      for (const job of jobs) {
        const label = `${job.name}:${userEmail}`;
        const outcome = await withRetry(label, () => job.fn(sr, userEmail));
        userResult.jobs[job.name] = outcome;
      }

      results.push(userResult);
    }

    const summary = {
      ok: true,
      mode,
      usersProcessed: userEmails.length,
      results,
    };

    console.info(`[scheduledJobRunner] mode=${mode} users=${userEmails.length} done`);
    return Response.json(summary);
  } catch (error) {
    console.error('[scheduledJobRunner] fatal error:', error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});
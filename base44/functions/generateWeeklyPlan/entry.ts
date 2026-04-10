import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Strategy AI — Weekly Planner (Phase 6)
 *
 * Diagnoses top growth bottlenecks from real session data,
 * recommends experiments, generates full per-stream playbook,
 * and populates every structured field in the WeeklyPlan schema.
 *
 * Data sources used:
 *   - LiveSession (last 30)
 *   - SessionFact (scored sessions — best signal quality)
 *   - CoachActionLog (what worked live)
 *   - Experiment (active + completed — avoid re-running failed ones)
 *   - ReplayReview (creator's own debrief lessons)
 *   - CreatorProfile + TikTokProfileSnapshot
 *   - WeeklyPlan (last 2 weeks — avoid repeating same plan)
 */

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

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function avg(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const force = body.force === true;

  const now = new Date();
  const weekNumber = getISOWeek(now);
  const year = now.getFullYear();

  // Check for existing plan
  if (!force) {
    const existing = await base44.entities.WeeklyPlan.filter(
      { owner_email: user.email, week_number: weekNumber, year },
      '-created_date', 1
    );
    if (existing.length > 0) return Response.json({ plan: existing[0], cached: true });
  }

  const monday = getMondayOfWeek(now);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekStart = monday.toISOString().split('T')[0];
  const weekEnd   = sunday.toISOString().split('T')[0];

  // --- Load all data in parallel ---
  const [
    profiles,
    sessions,
    facts,
    goals,
    scheduledStreams,
    replays,
    profileSnapshots,
    coachLogs,
    experiments,
    prevPlans,
  ] = await Promise.all([
    base44.entities.CreatorProfile.filter({ created_by: user.email }),
    base44.entities.LiveSession.filter({ owner_email: user.email }, '-stream_date', 40),
    base44.entities.SessionFact.filter({ owner_email: user.email }, '-stream_date', 40),
    base44.entities.GrowthGoal.filter({ created_by: user.email, status: 'active' }),
    base44.entities.ScheduledStream.filter({ created_by: user.email }, '-scheduled_date', 20),
    base44.entities.ReplayReview.filter({ created_by: user.email }, '-reviewed_at', 5),
    base44.entities.TikTokProfileSnapshot.filter({ created_by: user.email }, '-captured_at', 2),
    base44.entities.CoachActionLog.filter({ owner_email: user.email }, '-sent_at', 50),
    base44.entities.Experiment.filter({ created_by: user.email }, '-created_date', 20),
    base44.entities.WeeklyPlan.filter({ owner_email: user.email }, '-week_start_date', 2),
  ]);

  const profile = profiles[0] || null;

  // Use SessionFacts if available (higher quality), fall back to LiveSessions
  const dataSource = facts.length >= sessions.length * 0.5 ? facts : sessions;
  const sessionCount = dataSource.length;

  // --- Compute baselines ---
  const allAvgViewers  = dataSource.map(s => s.avg_viewers || 0).filter(v => v > 0);
  const allPeakViewers = dataSource.map(s => s.peak_viewers || 0).filter(v => v > 0);
  const allFollowers   = dataSource.map(s => s.followers_gained || 0);
  const allDiamonds    = dataSource.map(s => s.diamonds || 0);
  const allDuration    = dataSource.map(s => s.duration_minutes || 0).filter(v => v > 0);

  const baselineAvgViewers  = Math.round(median(allAvgViewers));
  const baselinePeakViewers = Math.round(median(allPeakViewers));
  const baselineFollowers   = Math.round(median(allFollowers));
  const baselineDiamonds    = Math.round(median(allDiamonds));
  const baselineDuration    = Math.round(median(allDuration));

  // --- Game analysis ---
  const gameMap = {};
  dataSource.forEach(s => {
    if (!s.game) return;
    if (!gameMap[s.game]) gameMap[s.game] = {
      sessions: [], avgViewers: [], peakViewers: [], followers: [],
      promoSessions: [], noPromoSessions: [],
    };
    const g = gameMap[s.game];
    g.sessions.push(s);
    if (s.avg_viewers) g.avgViewers.push(s.avg_viewers);
    if (s.peak_viewers) g.peakViewers.push(s.peak_viewers);
    g.followers.push(s.followers_gained || 0);
    if (s.promo_posted) g.promoSessions.push(s.avg_viewers || 0);
    else g.noPromoSessions.push(s.avg_viewers || 0);
  });

  const rankedGames = Object.entries(gameMap)
    .map(([game, d]) => ({
      game,
      count: d.sessions.length,
      medianAvg: Math.round(median(d.avgViewers)),
      medianPeak: Math.round(median(d.peakViewers)),
      medianFollowers: Math.round(median(d.followers)),
      promoLift: d.promoSessions.length > 0 && d.noPromoSessions.length > 0
        ? Math.round(avg(d.promoSessions) - avg(d.noPromoSessions))
        : null,
    }))
    .sort((a, b) => b.medianAvg - a.medianAvg);

  // --- Time-of-day analysis ---
  const timeMap = {};
  dataSource.forEach(s => {
    const t = s.start_time;
    if (!t) return;
    const hour = parseInt(t.split(':')[0]);
    const bucket = `${hour}:00`;
    if (!timeMap[bucket]) timeMap[bucket] = [];
    timeMap[bucket].push(s.avg_viewers || 0);
  });
  const bestTimes = Object.entries(timeMap)
    .map(([time, v]) => ({ time, avg: Math.round(avg(v)), count: v.length }))
    .filter(t => t.count >= 2)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3);

  // --- Day-of-week analysis ---
  const dayMap = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  dataSource.forEach(s => {
    if (!s.stream_date) return;
    const d = new Date(s.stream_date);
    const key = DAY_KEYS[d.getDay()];
    if (key) dayMap[key].push(s.avg_viewers || 0);
  });
  const bestDays = Object.entries(dayMap)
    .filter(([, v]) => v.length >= 2)
    .map(([day, v]) => ({ day, avg: Math.round(avg(v)), count: v.length }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3)
    .map(d => d.day);

  // --- Promo impact ---
  const promoSessions = dataSource.filter(s => s.promo_posted);
  const noPromoSessions = dataSource.filter(s => !s.promo_posted);
  const promoAvg = promoSessions.length > 0 ? Math.round(avg(promoSessions.map(s => s.avg_viewers || 0))) : null;
  const noPromoAvg = noPromoSessions.length > 0 ? Math.round(avg(noPromoSessions.map(s => s.avg_viewers || 0))) : null;
  const promoLiftGlobal = promoAvg && noPromoAvg ? promoAvg - noPromoAvg : null;

  // --- Duration analysis ---
  const durationBuckets = { short: [], medium: [], long: [] };
  dataSource.forEach(s => {
    const dur = s.duration_minutes || 0;
    const v = s.avg_viewers || 0;
    if (dur < 45) durationBuckets.short.push(v);
    else if (dur < 90) durationBuckets.medium.push(v);
    else durationBuckets.long.push(v);
  });
  const bestDurationBucket = Object.entries(durationBuckets)
    .filter(([, v]) => v.length >= 2)
    .map(([label, v]) => ({ label, avg: avg(v), count: v.length }))
    .sort((a, b) => b.avg - a.avg)[0];

  // --- Coach feedback analysis (what worked) ---
  const workedActions  = coachLogs.filter(l => l.result === 'worked');
  const failedActions  = coachLogs.filter(l => l.result === 'failed');
  const helpfulActions = coachLogs.filter(l => l.helpful === true);
  const coachInsights  = helpfulActions
    .slice(0, 5)
    .map(l => `${l.action_type}: "${l.message?.slice(0, 80)}"`)
    .join(' | ');

  // --- Experiment context ---
  const activeExperiments   = experiments.filter(e => e.status === 'active' || e.status === 'running');
  const completedExp        = experiments.filter(e => e.status === 'completed');
  const failedExp           = experiments.filter(e => e.result === 'failed' || e.result === 'no_effect');
  const experimentContext   = activeExperiments.map(e => e.hypothesis || e.title).filter(Boolean).join('; ');

  // --- Previous week performance ---
  const lwMonday = new Date(monday);
  lwMonday.setDate(monday.getDate() - 7);
  const lwSunday = new Date(monday);
  lwSunday.setDate(monday.getDate() - 1);
  const lwStart = lwMonday.toISOString().split('T')[0];
  const lwEnd   = lwSunday.toISOString().split('T')[0];
  const lastWeekSessions = dataSource.filter(s => {
    const d = s.stream_date || '';
    return d >= lwStart && d <= lwEnd;
  });
  const lastWeekAvg = lastWeekSessions.length > 0
    ? Math.round(avg(lastWeekSessions.map(s => s.avg_viewers || 0)))
    : null;

  // --- Replay lessons ---
  const replayLessons = replays
    .map(r => r.lessons)
    .filter(Boolean)
    .join(' | ')
    .slice(0, 300);

  // --- Previous plan context (avoid repetition) ---
  const prevPlanBrief = prevPlans[0]?.ai_brief || null;
  const prevBottleneck = prevPlans[0]?.bottleneck_1 || null;

  // --- Confidence score ---
  const confidence = Math.min(1.0, Math.max(0.1,
    (sessionCount >= 10 ? 0.4 : sessionCount * 0.04) +
    (rankedGames.length >= 3 ? 0.2 : rankedGames.length * 0.067) +
    (bestDays.length >= 2 ? 0.15 : 0) +
    (promoLiftGlobal !== null ? 0.15 : 0) +
    (coachLogs.length >= 5 ? 0.1 : 0)
  ));

  // --- Build full structured LLM prompt ---
  const prompt = `You are AltCtrl Strategy AI — a growth advisor for TikTok LIVE gaming creators.
Your job: diagnose the creator's ACTUAL growth bottlenecks from data and build a specific weekly plan to fix them.

=== CREATOR ===
Name: ${profile?.display_name || 'Creator'}
Goal: ${profile?.stream_goal?.replace(/_/g, ' ') || 'grow followers'}
Target streams/week: ${profile?.weekly_stream_target || 3}
Preferred days: ${profile?.preferred_stream_days?.join(', ') || 'not set'}
Preferred time: ${profile?.preferred_stream_time || 'not set'}

=== PERFORMANCE BASELINES (${sessionCount} sessions) ===
Avg viewers: ${baselineAvgViewers} | Peak viewers: ${baselinePeakViewers}
Avg followers/stream: ${baselineFollowers} | Avg diamonds/stream: ${baselineDiamonds}
Median duration: ${baselineDuration} min

=== GAME PERFORMANCE ===
${rankedGames.slice(0, 6).map(g => `${g.game}: ${g.count}x, avg ${g.medianAvg} viewers${g.promoLift !== null ? `, promo lift: +${g.promoLift}` : ''}`).join('\n') || 'No game data'}

=== PROMO IMPACT ===
${promoAvg !== null ? `With promo: ${promoAvg} avg viewers | Without promo: ${noPromoAvg} avg | Lift: +${promoLiftGlobal}` : 'Not enough promo comparison data'}

=== BEST DAYS ===
${bestDays.length > 0 ? bestDays.join(', ') : 'Not enough data'}

=== BEST TIMES ===
${bestTimes.map(t => `${t.time}: avg ${t.avg} (${t.count}x)`).join(' | ') || 'Not enough data'}

=== DURATION ANALYSIS ===
${bestDurationBucket ? `Best bucket: ${bestDurationBucket.label} (avg ${Math.round(bestDurationBucket.avg)} viewers)` : 'Not enough data'}

=== CREATOR DEBRIEF LESSONS ===
${replayLessons || 'No replay reviews submitted yet'}

=== LIVE COACH INSIGHTS (what worked) ===
${coachInsights || 'No coach feedback data yet'}

=== ACTIVE EXPERIMENTS ===
${experimentContext || 'None'}

=== LAST WEEK ===
${lastWeekSessions.length} streams completed, avg ${lastWeekAvg || '?'} viewers
Previous plan brief: ${prevPlanBrief || 'N/A'}
Previous bottleneck: ${prevBottleneck || 'N/A'}

=== THIS WEEK ===
Week ${weekNumber} (${weekStart} to ${weekEnd})
Active goals: ${goals.map(g => `${g.title || g.goal_type}: target ${g.target_value} ${g.unit || ''}`).join(', ') || 'None'}

---

Your task: Build a SPECIFIC, DATA-DRIVEN weekly plan. Do not repeat last week's bottleneck diagnosis unless it is still clearly the biggest issue.

Return JSON with ALL fields:

{
  "primary_goal": one of: grow_followers | increase_viewers | improve_consistency | build_community | monetize | retention | custom,
  "primary_goal_context": "1 sentence: why this is the right goal this week based on data",
  "recommended_days": ["mon","wed","fri"] (best 2-4 days from data or creator preference),
  "recommended_start_times": ["19:00","20:00"] (best times from data, one per recommended day),
  "recommended_games": ["Game1","Game2"] (top 1-3 games by data),
  "recommended_stream_types": ["ranked","challenge"] (what formats to run),
  "target_duration_minutes": 60,
  "opener_strategy": "Specific 2-3 sentence script for the first 2-3 minutes live — what to say and do",
  "engagement_strategy": "Core engagement approach for the week — specific prompts or tactics",
  "monetization_strategy": "When and how to activate monetization this week",
  "bottleneck_1": "Name of the #1 growth bottleneck (e.g. 'Low promo consistency', 'Chat engagement flat')",
  "bottleneck_1_evidence": "Specific data evidence: e.g. '7/10 sessions had no promo posted, avg 12% lower viewers'",
  "bottleneck_1_upside": "Expected impact if fixed: e.g. '+8-12 avg viewers per session'",
  "bottleneck_2": "Name of the #2 bottleneck",
  "bottleneck_2_evidence": "Specific data evidence",
  "bottleneck_2_upside": "Expected impact if fixed",
  "bottleneck_3": "Name of the #3 bottleneck (optional, null if not enough data)",
  "bottleneck_3_evidence": "...",
  "bottleneck_3_upside": "...",
  "experiment_focus": "What specific thing to test this week (not already running or recently failed)",
  "streams_plan": [
    {
      "day": "mon",
      "date": "${weekStart}",
      "game": "Game",
      "stream_type": "ranked",
      "duration_minutes": 60,
      "start_time": "19:00",
      "objective": "Specific session goal",
      "opener": "What to say in first 30 seconds",
      "key_tactic": "The 1 thing that matters most this session"
    }
  ],
  "ai_brief": "1 punchy sentence: biggest opportunity this week (reference actual data)"
}`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'object',
      properties: {
        primary_goal:             { type: 'string' },
        primary_goal_context:     { type: 'string' },
        recommended_days:         { type: 'array', items: { type: 'string' } },
        recommended_start_times:  { type: 'array', items: { type: 'string' } },
        recommended_games:        { type: 'array', items: { type: 'string' } },
        recommended_stream_types: { type: 'array', items: { type: 'string' } },
        target_duration_minutes:  { type: 'number' },
        opener_strategy:          { type: 'string' },
        engagement_strategy:      { type: 'string' },
        monetization_strategy:    { type: 'string' },
        bottleneck_1:             { type: 'string' },
        bottleneck_1_evidence:    { type: 'string' },
        bottleneck_1_upside:      { type: 'string' },
        bottleneck_2:             { type: 'string' },
        bottleneck_2_evidence:    { type: 'string' },
        bottleneck_2_upside:      { type: 'string' },
        bottleneck_3:             { type: ['string', 'null'] },
        bottleneck_3_evidence:    { type: ['string', 'null'] },
        bottleneck_3_upside:      { type: ['string', 'null'] },
        experiment_focus:         { type: 'string' },
        streams_plan:             { type: 'array', items: { type: 'object' } },
        ai_brief:                 { type: 'string' },
      },
    },
  });

  // --- Purge old plan if force ---
  if (force) {
    const old = await base44.asServiceRole.entities.WeeklyPlan.filter({ owner_email: user.email, week_number: weekNumber, year });
    for (const p of old) await base44.asServiceRole.entities.WeeklyPlan.delete(p.id);
  }

  // --- Write full structured WeeklyPlan ---
  const plan = await base44.asServiceRole.entities.WeeklyPlan.create({
    owner_email:               user.email,
    week_start_date:           weekStart,
    week_number:               weekNumber,
    year,
    status:                    'active',
    primary_goal:              result.primary_goal || 'grow_followers',
    primary_goal_context:      result.primary_goal_context || null,
    recommended_days:          result.recommended_days || bestDays,
    recommended_start_times:   result.recommended_start_times || bestTimes.map(t => t.time),
    recommended_games:         result.recommended_games || rankedGames.slice(0, 3).map(g => g.game),
    recommended_stream_types:  result.recommended_stream_types || [],
    target_duration_minutes:   result.target_duration_minutes || baselineDuration || 60,
    opener_strategy:           result.opener_strategy || null,
    engagement_strategy:       result.engagement_strategy || null,
    monetization_strategy:     result.monetization_strategy || null,
    streams_plan:              result.streams_plan ? JSON.stringify(result.streams_plan) : null,
    bottleneck_1:              result.bottleneck_1 || null,
    bottleneck_1_evidence:     result.bottleneck_1_evidence || null,
    bottleneck_1_upside:       result.bottleneck_1_upside || null,
    bottleneck_2:              result.bottleneck_2 || null,
    bottleneck_2_evidence:     result.bottleneck_2_evidence || null,
    bottleneck_2_upside:       result.bottleneck_2_upside || null,
    bottleneck_3:              result.bottleneck_3 || null,
    bottleneck_3_evidence:     result.bottleneck_3_evidence || null,
    bottleneck_3_upside:       result.bottleneck_3_upside || null,
    experiment_focus:          result.experiment_focus || null,
    experiment_ids:            activeExperiments.map(e => e.id),
    confidence_score:          confidence,
    data_sessions_analyzed:    sessionCount,
    ai_brief:                  result.ai_brief || null,
    generated_at:              now.toISOString(),
    generated_by:              'ai',
  });

  return Response.json({
    plan,
    cached: false,
    confidence,
    sessions_analyzed: sessionCount,
    games_analyzed: rankedGames.length,
    bottlenecks_found: [result.bottleneck_1, result.bottleneck_2, result.bottleneck_3].filter(Boolean).length,
  });
});
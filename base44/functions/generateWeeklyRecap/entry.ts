import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { force = false, target_week = null } = await req.json().catch(() => ({}));

  // Determine which week to recap (default: last completed week)
  const now = new Date();
  const currentWeek = getISOWeek(now);
  const currentYear = now.getFullYear();

  // Recap last week by default (Sunday we recap the week that just ended)
  const recapDate = new Date(now);
  recapDate.setDate(now.getDate() - 7); // go back one week
  const recapWeek = target_week || getISOWeek(recapDate);
  const recapYear = recapDate.getFullYear();

  // Get monday of recap week
  const d = new Date(recapDate);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  const weekStart = d.toISOString().split('T')[0];
  const weekEnd = new Date(d.setDate(d.getDate() + 6)).toISOString().split('T')[0];

  // Check for existing recap
  if (!force) {
    const existing = await base44.entities.WeeklyRecap.filter(
      { created_by: user.email, week_number: recapWeek, year: recapYear },
      '-created_date', 1
    );
    if (existing.length > 0) return Response.json({ recap: existing[0], cached: true });
  }

  // Gather data
  const [profiles, allSessions, goals, scheduledStreams] = await Promise.all([
    base44.entities.CreatorProfile.filter({ created_by: user.email }),
    base44.entities.LiveSession.filter({ created_by: user.email }, '-stream_date', 60),
    base44.entities.GrowthGoal.filter({ created_by: user.email }),
    base44.entities.ScheduledStream.filter({ created_by: user.email }, '-scheduled_date', 30),
  ]);

  const profile = profiles[0] || null;

  // This week's sessions
  const weekSessions = allSessions.filter(s => s.stream_date >= weekStart && s.stream_date <= weekEnd);

  // Previous week sessions for comparison
  const prevStart = new Date(weekStart);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevEnd = new Date(weekStart);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevWeekSessions = allSessions.filter(s =>
    s.stream_date >= prevStart.toISOString().split('T')[0] &&
    s.stream_date <= prevEnd.toISOString().split('T')[0]
  );

  // Scheduled streams this week
  const weekScheduled = scheduledStreams.filter(s => s.scheduled_date >= weekStart && s.scheduled_date <= weekEnd);
  const streamsPlanned = weekScheduled.length;
  const streamsCompleted = weekSessions.length;

  // Metrics
  const avgViewers = weekSessions.length > 0 && weekSessions.some(s => s.avg_viewers > 0)
    ? Math.round(weekSessions.filter(s => s.avg_viewers > 0).reduce((a, s) => a + s.avg_viewers, 0) / weekSessions.filter(s => s.avg_viewers > 0).length)
    : null;
  const prevAvgViewers = prevWeekSessions.length > 0 && prevWeekSessions.some(s => s.avg_viewers > 0)
    ? Math.round(prevWeekSessions.filter(s => s.avg_viewers > 0).reduce((a, s) => a + s.avg_viewers, 0) / prevWeekSessions.filter(s => s.avg_viewers > 0).length)
    : null;
  const peakViewers = weekSessions.reduce((m, s) => Math.max(m, s.peak_viewers || 0), 0) || null;
  const totalFollowers = weekSessions.reduce((a, s) => a + (s.followers_gained || 0), 0);
  const totalMins = weekSessions.reduce((a, s) => a + (s.duration_minutes || 0), 0);
  const promoPosted = weekSessions.filter(s => s.promo_posted).length;

  // Best game
  const gameMap = {};
  weekSessions.forEach(s => {
    if (!s.game) return;
    if (!gameMap[s.game]) gameMap[s.game] = { total: 0, count: 0 };
    gameMap[s.game].total += s.avg_viewers || 0;
    gameMap[s.game].count++;
  });
  const topGame = Object.entries(gameMap).sort((a, b) =>
    (b[1].total / b[1].count) - (a[1].total / a[1].count)
  )[0]?.[0] || null;

  // Consistency score: (completed / planned) * 100, capped at 100
  const target = profile?.weekly_stream_target || 3;
  const denominator = Math.max(streamsPlanned, target);
  const consistencyScore = denominator > 0 ? Math.min(100, Math.round((streamsCompleted / denominator) * 100)) : null;

  // Goals evaluation
  let goalsHit = 0;
  let goalsMissed = 0;
  const weeklyGoals = goals.filter(g => g.period === 'weekly' && g.week_number === recapWeek);
  weeklyGoals.forEach(g => {
    if (g.current_value >= g.target_value) goalsHit++;
    else goalsMissed++;
  });

  // Only generate AI summary if there's actual data
  let aiSummary = null;
  let highlight = null;

  if (weekSessions.length > 0) {
    const viewerDelta = avgViewers && prevAvgViewers ? avgViewers - prevAvgViewers : null;
    const viewerDeltaStr = viewerDelta !== null
      ? `${viewerDelta >= 0 ? '+' : ''}${viewerDelta} vs last week (${prevAvgViewers} → ${avgViewers})`
      : avgViewers ? `avg ${avgViewers} viewers` : 'no viewer data';

    const prompt = `You are AltCtrl, an AI coach for TikTok LIVE gaming creators. Generate a weekly recap summary for week ${recapWeek} (${weekStart} to ${weekEnd}).

Creator: ${profile?.display_name || 'Creator'}, goal: ${profile?.stream_goal?.replace(/_/g, ' ') || 'grow followers'}

Week ${recapWeek} results:
- Streams completed: ${streamsCompleted} (target was ${target})
- Avg viewers: ${viewerDeltaStr}
- Peak viewers: ${peakViewers ?? 'not recorded'}
- Followers gained: ${totalFollowers}
- Total stream time: ${Math.round(totalMins / 60 * 10) / 10} hours
- Promo posted: ${promoPosted} of ${streamsCompleted} streams (${streamsCompleted > 0 ? Math.round(promoPosted/streamsCompleted*100) : 0}%)
- Top game: ${topGame || 'mixed'}
- Consistency score: ${consistencyScore ?? 'N/A'}%

Previous week for comparison:
- Sessions: ${prevWeekSessions.length}
- Avg viewers: ${prevAvgViewers ?? 'no data'}

Generate a data-specific recap. Do NOT be generic. Reference actual numbers.

Return JSON:
- highlight: 1 sentence biggest win of the week (reference a specific number)
- biggest_win: 1 sentence about what worked best (be specific)
- improvement_area: 1 sentence on what to fix next week (specific, actionable)
- next_week_focus: 1 sentence strategic focus for next week based on this week's data
- ai_summary: 3-4 sentence narrative recap of the week (weave all the numbers together into a coherent story)`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          highlight: { type: 'string' },
          biggest_win: { type: 'string' },
          improvement_area: { type: 'string' },
          next_week_focus: { type: 'string' },
          ai_summary: { type: 'string' },
        },
      },
    });

    highlight = result.highlight;
    // Pack structured insights into ai_summary field
    aiSummary = [
      result.ai_summary,
      result.biggest_win ? `✓ WIN: ${result.biggest_win}` : null,
      result.improvement_area ? `→ IMPROVE: ${result.improvement_area}` : null,
      result.next_week_focus ? `NEXT WEEK: ${result.next_week_focus}` : null,
    ].filter(Boolean).join('\n\n');
  } else {
    highlight = 'No sessions logged this week.';
    aiSummary = streamsPlanned > 0
      ? `You had ${streamsPlanned} streams scheduled but none logged. Mark sessions as complete or log them manually in Analytics.`
      : 'No sessions were logged this week. Schedule and log streams to unlock detailed weekly recaps.';
  }

  // Delete old recap if force
  if (force) {
    const old = await base44.entities.WeeklyRecap.filter({ created_by: user.email, week_number: recapWeek, year: recapYear });
    for (const r of old) await base44.entities.WeeklyRecap.delete(r.id);
  }

  const recap = await base44.entities.WeeklyRecap.create({
    week_number: recapWeek,
    year: recapYear,
    week_start_date: weekStart,
    week_end_date: weekEnd,
    streams_planned: streamsPlanned || target,
    streams_completed: streamsCompleted,
    total_stream_minutes: totalMins,
    avg_viewers: avgViewers,
    peak_viewers: peakViewers,
    followers_gained: totalFollowers,
    promo_posted_count: promoPosted,
    consistency_score: consistencyScore,
    top_game: topGame,
    highlight,
    ai_summary: aiSummary,
    goals_hit: goalsHit,
    goals_missed: goalsMissed,
  });

  return Response.json({ recap, cached: false });
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const weekNumber = getISOWeek(now);
  const year = now.getFullYear();
  const { force = false } = await req.json().catch(() => ({}));

  // Check for existing plan this week
  if (!force) {
    const existing = await base44.entities.WeeklyPlan.filter(
      { created_by: user.email, week_number: weekNumber, year },
      '-created_date', 1
    );
    if (existing.length > 0) return Response.json({ plan: existing[0], cached: true });
  }

  const monday = getMondayOfWeek(now);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekStart = monday.toISOString().split('T')[0];
  const weekEnd = sunday.toISOString().split('T')[0];

  // Gather data in parallel (sessions + replays + profile snapshots)
  const [profiles, sessions, goals, scheduledStreams, replays, profileSnapshots] = await Promise.all([
    base44.entities.CreatorProfile.filter({ created_by: user.email }),
    base44.entities.LiveSession.filter({ created_by: user.email }, '-stream_date', 30),
    base44.entities.GrowthGoal.filter({ created_by: user.email, status: 'active' }),
    base44.entities.ScheduledStream.filter({ created_by: user.email }, '-scheduled_date', 30),
    base44.entities.ReplayReview.filter({ created_by: user.email }, '-reviewed_at', 5),
    base44.entities.TikTokProfileSnapshot.filter({ created_by: user.email }, '-captured_at', 2),
  ]);

  const profile = profiles[0] || null;
  const target = profile?.weekly_stream_target || 3;
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  // Compute best games by avg viewers + promo effect per game
  const gameMap = {};
  sessions.forEach(s => {
    if (!s.game || !s.avg_viewers) return;
    if (!gameMap[s.game]) gameMap[s.game] = { total: 0, count: 0, promoTotal: 0, promoCount: 0 };
    gameMap[s.game].total += s.avg_viewers;
    gameMap[s.game].count++;
    if (s.promo_posted) {
      gameMap[s.game].promoTotal += s.avg_viewers;
      gameMap[s.game].promoCount++;
    }
  });
  const rankedGames = Object.entries(gameMap)
    .map(([game, d]) => {
      const avg = Math.round(d.total / d.count);
      const promoAvg = d.promoCount > 0 ? Math.round(d.promoTotal / d.promoCount) : null;
      return { game, avg, sessions: d.count, promoAvg };
    })
    .sort((a, b) => b.avg - a.avg);

  // This week's already-scheduled streams
  const thisWeekScheduled = scheduledStreams.filter(s => s.scheduled_date >= weekStart && s.scheduled_date <= weekEnd);

  // Previous week stats
  const lastWeekStart = new Date(monday);
  lastWeekStart.setDate(monday.getDate() - 7);
  const lastWeekEnd = new Date(monday);
  lastWeekEnd.setDate(monday.getDate() - 1);
  const lwStart = lastWeekStart.toISOString().split('T')[0];
  const lwEnd = lastWeekEnd.toISOString().split('T')[0];
  const lastWeekSessions = sessions.filter(s => s.stream_date >= lwStart && s.stream_date <= lwEnd);
  const lastWeekAvg = lastWeekSessions.length > 0
    ? Math.round(lastWeekSessions.reduce((a, s) => a + (s.avg_viewers || 0), 0) / lastWeekSessions.length)
    : null;

  // Collect debrief insights
  const replayLessons = replays.map(r => r.lessons).filter(Boolean).join(' | ');
  const profileTrend = profileSnapshots.length > 0
    ? `Latest follower count: ${profileSnapshots[0].follower_count}`
    : null;

  const prompt = `You are AltCtrl, an AI coach for TikTok LIVE gaming creators. Generate a concrete weekly game plan for week ${weekNumber} (${weekStart} to ${weekEnd}).

Today is ${dayName}, ${now.toISOString().split('T')[0]}.

Creator profile:
- Display name: ${profile?.display_name || 'Creator'}
- Primary game: ${profile?.primary_game || 'not set'}
- Stream goal: ${profile?.stream_goal?.replace(/_/g, ' ') || 'grow followers'}
- Weekly stream target: ${target} streams
- Preferred days: ${profile?.preferred_stream_days?.join(', ') || 'not set'}
- Preferred time: ${profile?.preferred_stream_time || 'not set'}

Recent performance (last ${sessions.length} sessions):
${rankedGames.slice(0, 5).map(g => `- ${g.game}: avg ${g.avg} viewers${g.promoAvg ? ` (with promo: ${g.promoAvg})` : ''}`).join('\n') || '- No game data yet'}

Last week: ${lastWeekSessions.length} sessions logged${lastWeekAvg ? `, avg ${lastWeekAvg} viewers` : ''}

Creator debrief insights (recent):
${replayLessons ? `- ${replayLessons.substring(0, 150)}...` : '- No replay reviews yet'}

TikTok profile:
${profileTrend || '- No profile snapshots yet'}

Active goals:
${goals.length > 0 ? goals.map(g => `- ${g.title || g.goal_type}: target ${g.target_value} ${g.unit || ''}`).join('\n') : '- No active goals'}

This week already scheduled: ${thisWeekScheduled.length} streams${thisWeekScheduled.map(s => `\n  - ${s.scheduled_date} ${s.start_time || ''}: ${s.game}`).join('') || ''}

Generate a weekly plan grounded in their actual session data, creator insights, and TikTok trends. Be specific and actionable. Do NOT give generic advice.

Return JSON:
- primary_game: string (best-performing game based on avg viewers + promo effect, or from debrief insights)
- secondary_games: array of 1-2 strings (backup options based on data)
- stream_target: number (recommend hitting their target, or adjusted based on last week's pace and goals)
- focus_note: 2-3 sentences covering this week's growth focus, specific game strategy, and one promo or timing tactic
- ai_brief: 1 sentence: biggest opportunity this week based on data + debrief (e.g. "Your ${rankedGames[0]?.game || 'top game'} sessions average ${rankedGames[0]?.avg || '?'} viewers — lean in and post promo consistently this week.")`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        primary_game: { type: 'string' },
        secondary_games: { type: 'array', items: { type: 'string' } },
        stream_target: { type: 'number' },
        focus_note: { type: 'string' },
        ai_brief: { type: 'string' },
        promo_strategy: { type: ['string', 'null'] },
      },
    },
  });

  // Delete old plan for this week if force-refreshing
  if (force) {
    const old = await base44.entities.WeeklyPlan.filter({ created_by: user.email, week_number: weekNumber, year });
    for (const p of old) await base44.entities.WeeklyPlan.delete(p.id);
  }

  const plan = await base44.entities.WeeklyPlan.create({
    week_number: weekNumber,
    year,
    week_start_date: weekStart,
    week_end_date: weekEnd,
    stream_target: result.stream_target || target,
    primary_game: result.primary_game || profile?.primary_game || null,
    secondary_games: result.secondary_games || [],
    focus_note: result.focus_note,
    ai_brief: result.ai_brief,
    status: 'active',
    streams_completed: 0,
    promo_posted_count: 0,
    source_data: `hybrid: ${sessions.filter(s => s.source && s.source !== 'manual').length} imported + replays:${replays.length} + profile_snapshots:${profileSnapshots.length}`,
  });

  return Response.json({ plan, hybrid_sources: { imported_sessions: sessions.filter(s => s.source && s.source !== 'manual').length, replays, profile_snapshots: profileSnapshots.length }, cached: false });
});
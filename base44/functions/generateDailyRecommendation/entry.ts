import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().split('T')[0];
  const { force = false } = await req.json().catch(() => ({}));

  // Check if already generated today
  if (!force) {
    const existing = await base44.entities.DailyRecommendation.filter(
      { created_by: user.email, date: today },
      '-created_date',
      1
    );
    if (existing.length > 0) {
      return Response.json({ recommendation: existing[0], cached: true });
    }
  }

  // Gather creator context in parallel
  const [profiles, liveSessions, desktopSessionsRaw, goals, streams, replays] = await Promise.all([
    base44.entities.CreatorProfile.filter({ created_by: user.email }),
    base44.entities.LiveSession.filter({ created_by: user.email }, '-stream_date', 15),
    base44.entities.DesktopSession.filter({ user_id: user.email }, '-started_at', 15),
    base44.entities.GrowthGoal.filter({ created_by: user.email, status: 'active' }),
    base44.entities.ScheduledStream.filter({ created_by: user.email }, '-scheduled_date', 20),
    base44.entities.ReplayReview.filter({ created_by: user.email }, '-reviewed_at', 10),
  ]);

  // Merge LiveSession + DesktopSession
  const normalizedDesktop = desktopSessionsRaw.map(d => ({
    stream_date: d.started_at ? d.started_at.split('T')[0] : null,
    game: d.game || d.title || '',
    start_time: d.started_at ? d.started_at.split('T')[1]?.substring(0, 5) : null,
    avg_viewers: d.avg_viewers ?? 0,
    peak_viewers: d.peak_viewers ?? 0,
    promo_posted: false,
  }));
  const liveDates = new Set(liveSessions.map(s => s.stream_date));
  const uniqueDesktop = normalizedDesktop.filter(d => d.stream_date && !liveDates.has(d.stream_date));
  const sessions = [...liveSessions, ...uniqueDesktop].sort((a, b) => (b.stream_date || '').localeCompare(a.stream_date || ''));

  const profile = profiles[0] || null;
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const weekNumber = getISOWeek(now);

  // Current week streams
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const thisWeekStreams = streams.filter(s => new Date(s.scheduled_date) >= weekStart);
  const todayStream = thisWeekStreams.find(s => s.scheduled_date === today);

  // Stats from last 10 sessions
  const sessionsWithViewers = sessions.filter(s => s.avg_viewers > 0);
  const avgViewers = sessionsWithViewers.length > 0
    ? Math.round(sessionsWithViewers.reduce((a, s) => a + s.avg_viewers, 0) / sessionsWithViewers.length)
    : null;
  const peakViewers = sessions.reduce((m, s) => Math.max(m, s.peak_viewers || 0), 0) || null;
  const promoRate = sessions.length > 0
    ? Math.round((sessions.filter(s => s.promo_posted).length / sessions.length) * 100)
    : 0;
  const bestGame = (() => {
    const map = {};
    sessions.forEach(s => {
      if (!s.game) return;
      if (!map[s.game]) map[s.game] = { total: 0, count: 0 };
      map[s.game].total += s.avg_viewers || 0;
      map[s.game].count++;
    });
    return Object.entries(map).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0]?.[0] || null;
  })();

  // Best streaming hour from history (avg viewers by time slot)
  const hourStats = {};
  sessions.forEach(s => {
    if (!s.start_time || !s.avg_viewers) return;
    const h = parseInt(s.start_time.split(':')[0]);
    if (!isNaN(h)) {
      if (!hourStats[h]) hourStats[h] = { total: 0, count: 0 };
      hourStats[h].total += s.avg_viewers;
      hourStats[h].count++;
    }
  });
  const bestHourData = Object.entries(hourStats)
    .map(([h, d]) => ({ h: parseInt(h), avg: Math.round(d.total / d.count), count: d.count }))
    .sort((a, b) => b.avg - a.avg)[0];
  const bestHour = bestHourData?.h;
  const bestTimeStr = bestHour
    ? `${bestHour > 12 ? bestHour - 12 : bestHour}:00 ${bestHour >= 12 ? 'PM' : 'AM'}`
    : null;
  const bestHourAvgViewers = bestHourData?.avg || null;

  // Collect debrief insights
  const recentReplayLessons = replays.slice(0, 3).map(r => r.lessons).filter(Boolean);
  const promoEffect = sessions.length >= 3
    ? (() => {
        const promo = sessions.filter(s => s.promo_posted).map(s => s.avg_viewers || 0);
        const noPromo = sessions.filter(s => !s.promo_posted).map(s => s.avg_viewers || 0);
        if (promo.length > 0 && noPromo.length > 0) {
          const promoAvg = promo.reduce((a, v) => a + v, 0) / promo.length;
          const noPromoAvg = noPromo.reduce((a, v) => a + v, 0) / noPromo.length;
          return noPromoAvg > 0 ? Math.round(((promoAvg - noPromoAvg) / noPromoAvg) * 100) : null;
        }
        return null;
      })()
    : null;

  const prompt = `You are AltCtrl, an AI coach for TikTok LIVE gaming creators. Generate a personalized daily coaching card for today (${dayName}, ${today}).

Creator profile:
- Name: ${profile?.display_name || 'Creator'}
- Primary game: ${profile?.primary_game || 'various games'}
- Stream goal: ${profile?.stream_goal?.replace(/_/g, ' ') || 'grow followers'}
- Weekly stream target: ${profile?.weekly_stream_target || 3} streams/week
- Preferred time: ${profile?.preferred_stream_time || 'not set'}
- Preferred days: ${profile?.preferred_stream_days?.join(', ') || 'not set'}

Recent performance (last ${sessions.length} sessions):
- Avg viewers: ${avgViewers ?? 'no data yet'}
- Peak viewers: ${peakViewers ?? 'no data yet'}
- Best game by viewers: ${bestGame ?? 'not enough data'}
- Promo posted rate: ${promoRate}%
- Best streaming time from history: ${bestTimeStr ?? 'not enough data'} ${bestHourAvgViewers ? `(${bestHourAvgViewers} avg viewers)` : ''}
${promoEffect !== null ? `- Promo effect: sessions with promo average ${promoEffect}% ${promoEffect > 0 ? 'more' : 'fewer'} viewers` : ''}

Creator debrief insights (recent):
${recentReplayLessons.length > 0 ? recentReplayLessons.slice(0, 2).map(l => `- ${l}`).join('\n') : '- No replay reviews yet'}

Active goals:
${goals.length > 0 ? goals.map(g => `- ${g.title || g.goal_type}: target ${g.target_value} ${g.unit}`).join('\n') : '- No active goals set'}

This week (week ${weekNumber}):
- Streams scheduled: ${thisWeekStreams.length}
- Today has a stream: ${todayStream ? `Yes — ${todayStream.game} at ${todayStream.start_time || 'time TBD'}` : 'No'}

Generate a daily coaching card grounded in their actual data and creator insights. Be specific and actionable. Do NOT give generic advice.

Return a JSON with:
- focus_title: short punchy headline (under 8 words, UPPERCASE-friendly)
- focus_body: 2-3 sentences of specific guidance based on their actual data or debrief
- action_items: array of exactly 3 concrete actions for today (short, imperative)
- content_tip: one specific content/gameplay tip based on their best-performing game or debrief lessons
- reasoning: 1 sentence explaining why this advice fits today specifically`

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        focus_title: { type: 'string' },
        focus_body: { type: 'string' },
        action_items: { type: 'array', items: { type: 'string' } },
        content_tip: { type: 'string' },
        reasoning: { type: 'string' },
      },
    },
  });

  const recommendation = await base44.entities.DailyRecommendation.create({
    date: today,
    week_number: weekNumber,
    year: now.getFullYear(),
    focus_title: result.focus_title,
    focus_body: result.focus_body,
    action_items: result.action_items || [],
    recommendation_type: todayStream ? 'schedule' : 'general',
    priority: 'high',
    source: 'ai_generated',
    // store extra fields in focus_body as extended context
    focus_body: `${result.focus_body}${result.content_tip ? `\n\nContent tip: ${result.content_tip}` : ''}${result.reasoning ? `\n\nWhy today: ${result.reasoning}` : ''}`,
  });

  return Response.json({
    recommendation,
    cached: false,
  });
});

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
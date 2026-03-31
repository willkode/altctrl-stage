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
  const [profiles, sessions, goals, streams] = await Promise.all([
    base44.entities.CreatorProfile.filter({ created_by: user.email }),
    base44.entities.LiveSession.filter({ created_by: user.email }, '-stream_date', 10),
    base44.entities.GrowthGoal.filter({ created_by: user.email, status: 'active' }),
    base44.entities.ScheduledStream.filter({ created_by: user.email }, '-scheduled_date', 20),
  ]);

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

  // Best streaming hour from history
  const hourCounts = {};
  sessions.forEach(s => {
    if (!s.start_time) return;
    const h = parseInt(s.start_time.split(':')[0]);
    if (!isNaN(h)) hourCounts[h] = (hourCounts[h] || 0) + 1;
  });
  const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const bestTimeStr = bestHour
    ? `${bestHour > 12 ? bestHour - 12 : bestHour}:00 ${bestHour >= 12 ? 'PM' : 'AM'}`
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
- Best streaming time from history: ${bestTimeStr ?? 'not enough data'}

Active goals:
${goals.length > 0 ? goals.map(g => `- ${g.title || g.goal_type}: target ${g.target_value} ${g.unit}`).join('\n') : '- No active goals set'}

This week (week ${weekNumber}):
- Streams scheduled: ${thisWeekStreams.length}
- Today has a stream: ${todayStream ? `Yes — ${todayStream.game} at ${todayStream.start_time || 'time TBD'}` : 'No'}

Generate a daily coaching card. Be specific, data-backed, and concise. Do NOT give generic creator advice. Reference actual numbers from their data where available.

Return a JSON with:
- focus_title: short punchy headline (under 8 words, UPPERCASE-friendly)
- focus_body: 2-3 sentences of specific guidance based on their actual data
- action_items: array of exactly 3 concrete actions for today (short, imperative)
- best_time_to_live: string like "8:00 PM" or null if not enough data
- predicted_viewers_min: integer or null
- predicted_viewers_max: integer or null
- content_tip: one specific content/gameplay tip based on their best-performing game
- reasoning: 1 sentence explaining why this advice fits today specifically`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        focus_title: { type: 'string' },
        focus_body: { type: 'string' },
        action_items: { type: 'array', items: { type: 'string' } },
        best_time_to_live: { type: ['string', 'null'] },
        predicted_viewers_min: { type: ['number', 'null'] },
        predicted_viewers_max: { type: ['number', 'null'] },
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
    meta: {
      best_time_to_live: result.best_time_to_live,
      predicted_viewers_min: result.predicted_viewers_min,
      predicted_viewers_max: result.predicted_viewers_max,
    },
    cached: false,
  });
});

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
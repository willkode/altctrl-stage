import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const sessions = await base44.asServiceRole.entities.LiveSession.filter(
    { owner_email: user.email },
    '-avg_viewers',
    20
  );

  if (sessions.length === 0) {
    return Response.json({ triggers: [] });
  }

  // Identify top performers (top 30% by avg viewers)
  const avgViewersValues = sessions.map(s => s.avg_viewers || 0).filter(v => v > 0);
  const threshold = avgViewersValues.length > 0 
    ? avgViewersValues.sort((a, b) => b - a)[Math.floor(avgViewersValues.length * 0.3)] 
    : 0;

  const topSessions = sessions.filter(s => (s.avg_viewers || 0) >= threshold);

  // Build data patterns from top sessions
  const patterns = {
    gamesWithHighViewers: {},
    promoImpact: { withPromo: 0, withoutPromo: 0 },
    energyCorrelation: {},
  };

  topSessions.forEach(s => {
    if (s.game) {
      patterns.gamesWithHighViewers[s.game] = (patterns.gamesWithHighViewers[s.game] || 0) + (s.avg_viewers || 0);
    }
    if (s.promo_posted) {
      patterns.promoImpact.withPromo += (s.followers_gained || 0);
    } else {
      patterns.promoImpact.withoutPromo += (s.followers_gained || 0);
    }
    if (s.energy_level) {
      patterns.energyCorrelation[s.energy_level] = (patterns.energyCorrelation[s.energy_level] || 0) + (s.avg_viewers || 0);
    }
  });

  // Build top games list
  const topGames = Object.entries(patterns.gamesWithHighViewers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([game, viewers]) => game + ' (' + Math.round(viewers / topSessions.length) + ' avg viewers)')
    .join(', ');

  const promoWithAvg = Math.max(topSessions.filter(s => s.promo_posted).length, 1);
  const promoWithoutAvg = Math.max(topSessions.filter(s => !s.promo_posted).length, 1);

  const promoImpactText = 'Sessions with promo gained ' + Math.round(patterns.promoImpact.withPromo / promoWithAvg) + 
    ' followers avg vs ' + Math.round(patterns.promoImpact.withoutPromo / promoWithoutAvg) + ' without promo';

  const energyText = Object.entries(patterns.energyCorrelation)
    .map(([level, viewers]) => {
      const count = topSessions.filter(s => s.energy_level === level).length;
      return level + ': ' + Math.round(viewers / Math.max(count, 1)) + ' avg viewers';
    })
    .join(', ');

  const prompt = 'Based on the following high-performing stream data analysis, suggest 3-5 specific, actionable engagement triggers the creator should use in future streams:\n\n' +
    'HIGH PERFORMERS ANALYSIS:\n' +
    '- Total high-performing sessions: ' + topSessions.length + '\n' +
    '- Best performing games: ' + topGames + '\n' +
    '- Promo impact: ' + promoImpactText + '\n' +
    '- Energy level correlation: ' + energyText + '\n\n' +
    'Return a JSON object with:\n' +
    '{\n' +
    '  "triggers": [\n' +
    '    {\n' +
    '      "minute": <int - when in stream (0-30)>,\n' +
    '      "action": "<specific action (e.g., drop a gift goal, ask for follows, challenge viewers)>",\n' +
    '      "reasoning": "<why this works based on data>",\n' +
    '      "expectedOutcome": "<what metric should improve>"\n' +
    '    }\n' +
    '  ],\n' +
    '  "gameRecommendation": "<which game to focus on and why>",\n' +
    '  "promoTiming": "<when/how to use promo based on data>"\n' +
    '}';

  const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        triggers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              minute: { type: 'number' },
              action: { type: 'string' },
              reasoning: { type: 'string' },
              expectedOutcome: { type: 'string' },
            },
          },
        },
        gameRecommendation: { type: 'string' },
        promoTiming: { type: 'string' },
      },
    },
  });

  return Response.json({ 
    triggers: analysis.triggers || [],
    gameRecommendation: analysis.gameRecommendation,
    promoTiming: analysis.promoTiming,
    sessionsAnalyzed: topSessions.length,
  });
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * AI-powered game metadata enrichment
 * Fetches accurate, detailed information for each game in the library
 * Runs either scheduled or on-demand to update all games
 */
Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== "admin") return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });

  const { game_ids, limit = 10 } = await req.json().catch(() => ({}));

  // Get games to enrich
  const query = game_ids ? { id: { $in: game_ids } } : {};
  const games = await base44.asServiceRole.entities.GameLibrary.filter(query, '-sort_priority', limit);

  if (games.length === 0) {
    return Response.json({ message: "No games to enrich", count: 0 });
  }

  const enriched = [];
  
  for (const game of games) {
    const prompt = `You are a video game database expert. Provide accurate, detailed metadata for the game: "${game.title}"
    
Return JSON with ONLY these fields (fill in missing data):
{
  "description_full": "2-3 sentence description of gameplay and features",
  "genres": ["array", "of", "primary", "genres"],
  "tags": ["array", "of", "gameplay", "tags"],
  "developer": "Primary development studio",
  "publisher": "Publishing company",
  "multiplayer_type": "single_player|co_op|online_multiplayer|battle_royale|mixed",
  "gameplay_pacing": "slow|medium|fast|mixed",
  "session_style": "short_runs|mission_based|sandbox|long_sessions|mixed",
  "camera_style": "first_person|third_person|isometric|top_down|side_scroller",
  "challenge_friendly": true|false,
  "difficulty_style": "casual|mixed|competitive|punishing"
}

Be accurate and concise. Return ONLY valid JSON, no other text.`;

    const enrichment = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          description_full: { type: "string" },
          genres: { type: "array", items: { type: "string" } },
          tags: { type: "array", items: { type: "string" } },
          developer: { type: "string" },
          publisher: { type: "string" },
          multiplayer_type: { type: "string" },
          gameplay_pacing: { type: "string" },
          session_style: { type: "string" },
          camera_style: { type: "string" },
          challenge_friendly: { type: "boolean" },
          difficulty_style: { type: "string" },
        },
      },
    });

    // Update game with enriched metadata
    await base44.asServiceRole.entities.GameLibrary.update(game.id, {
      description_full: enrichment.description_full || game.description_short,
      genres: enrichment.genres || game.genres || [],
      tags: enrichment.tags || game.tags || [],
      developer: enrichment.developer || game.developer || "Unknown",
      publisher: enrichment.publisher || game.publisher || "Unknown",
      multiplayer_type: enrichment.multiplayer_type || game.multiplayer_type || "single_player",
      gameplay_pacing: enrichment.gameplay_pacing || game.gameplay_pacing || "medium",
      session_style: enrichment.session_style || game.session_style || "sandbox",
      camera_style: enrichment.camera_style || game.camera_style || "third_person",
      challenge_friendly: enrichment.challenge_friendly ?? game.challenge_friendly ?? false,
      difficulty_style: enrichment.difficulty_style || game.difficulty_style || "mixed",
    });

    enriched.push(game.id);
  }

  return Response.json({
    message: `Enriched ${enriched.length} games with AI metadata`,
    count: enriched.length,
    ids: enriched,
  });
});
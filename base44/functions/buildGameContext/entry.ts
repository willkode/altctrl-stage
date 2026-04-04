import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { scheduled_stream_id } = await req.json();
  if (!scheduled_stream_id) return Response.json({ error: "scheduled_stream_id required" }, { status: 400 });

  const stream = await base44.asServiceRole.entities.ScheduledStream.get(scheduled_stream_id);
  if (!stream) return Response.json({ error: "Stream not found" }, { status: 404 });

  // Look up game from library
  let game = null;
  if (stream.primary_game_id) {
    game = await base44.asServiceRole.entities.GameLibrary.get(stream.primary_game_id);
  }

  // Fallback: search by game name
  if (!game && stream.game) {
    const matches = await base44.asServiceRole.entities.GameLibrary.filter({
      normalized_title: stream.game.toLowerCase(),
      is_active: true,
    });
    game = matches[0] || null;
  }

  if (!game) {
    return Response.json({ context: null, message: "Game not found in library" });
  }

  // Get creator preference for this game
  const prefs = await base44.asServiceRole.entities.CreatorGamePreference.filter({
    game_id: game.id,
    created_by: user.email,
  });
  const pref = prefs[0] || null;

  // Get challenge frameworks for this game
  const frameworks = await base44.asServiceRole.entities.GameChallengeFramework.filter({
    game_id: game.id,
  });

  // Build structured context
  const context = {
    game_title: game.title,
    description_short: game.description_short,
    genres: game.genres || [],
    tags: game.tags || [],
    game_modes: game.game_modes || [],
    multiplayer_type: game.multiplayer_type,
    gameplay_pacing: game.gameplay_pacing,
    session_style: game.session_style,
    difficulty_style: game.difficulty_style,
    camera_style: game.camera_style,
    core_objective: game.core_objective,
    win_conditions: game.win_conditions,
    fail_conditions: game.fail_conditions,
    challenge_notes: game.challenge_notes,
    safety_notes: game.safety_notes,
    challenge_friendly: game.challenge_friendly,

    // Creator-specific
    creator_skill_confidence: pref?.skill_confidence || "medium",
    is_top_game: pref?.priority_type === "top_game",
    enjoys_challenge_mode: pref?.enjoys_challenge_mode || false,

    // Stream context
    stream_type: stream.stream_type,
    challenge_mode_enabled: stream.challenge_mode_enabled || false,
    selected_challenge_style: stream.selected_challenge_style || null,

    // Example frameworks
    example_challenges: frameworks.slice(0, 5).map(f => ({
      type: f.challenge_type,
      title: f.title,
      description: f.description,
      difficulty: f.difficulty_level,
    })),
  };

  // Save snapshot to stream
  await base44.asServiceRole.entities.ScheduledStream.update(scheduled_stream_id, {
    ai_game_context_snapshot: JSON.stringify(context),
  });

  return Response.json({ context });
});
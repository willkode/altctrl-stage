import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { action, payload } = await req.json();

  // ACTION: analyze_intro — user gives freeform intro, AI extracts structured profile
  if (action === "analyze_intro") {
    const { intro_text } = payload;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an onboarding assistant for ALT CTRL, a TikTok LIVE stream coaching platform for PC gaming creators.

The user just introduced themselves. Extract structured profile data from their message.

User message: "${intro_text}"

Extract whatever you can. If something isn't mentioned, set it to null. Be smart about inferring:
- If they mention a game, figure out the genre/niche
- If they mention streaming schedule, extract days and times
- If they mention goals, map to the closest goal type

For promo_tone: choose from [hype, chill, competitive, funny, serious, community]
For creator_niche: choose from [fps, battle_royale, rpg, sports, mobile, variety, horror, retro, other]
For content_style: choose from [solo_grind, community_focused, educational, entertainment, competitive]
For stream_goal: choose from [grow_followers, increase_viewers, improve_consistency, build_community, monetize]`,
      response_json_schema: {
        type: "object",
        properties: {
          display_name: { type: "string", description: "Creator name or alias" },
          tiktok_handle: { type: "string", description: "TikTok handle if mentioned" },
          games_mentioned: { type: "array", items: { type: "string" }, description: "All game titles mentioned" },
          primary_game: { type: "string", description: "Their main/favorite game" },
          stream_goal: { type: "string" },
          weekly_stream_target: { type: "number" },
          preferred_stream_days: { type: "array", items: { type: "string" } },
          preferred_stream_time: { type: "string" },
          promo_tone: { type: "string" },
          creator_niche: { type: "string" },
          content_style: { type: "string" },
          avg_viewers: { type: "number" },
          follower_count: { type: "number" },
          ai_follow_up: { type: "string", description: "A friendly follow-up message asking about anything important that was missing (games, goals, schedule). Keep it conversational and short. If everything was covered, say something encouraging and confirm what you understood." },
          confidence: { type: "string", description: "How complete is the profile: complete, mostly_complete, needs_more" },
        },
      },
    });

    return Response.json({ profile_data: result });
  }

  // ACTION: resolve_games — look up games in library, create missing ones via AI
  if (action === "resolve_games") {
    const { game_titles } = payload;
    const resolved = [];

    for (const title of game_titles) {
      // Search existing library
      const normalized = title.toLowerCase().trim();
      const existing = await base44.asServiceRole.entities.GameLibrary.filter({ is_active: true });
      const match = existing.find(g =>
        g.normalized_title === normalized ||
        g.title.toLowerCase() === normalized ||
        g.slug === normalized.replace(/[^a-z0-9]+/g, "-")
      );

      if (match) {
        resolved.push({ ...match, source: "existing" });
        continue;
      }

      // AI generates game metadata
      const gameData = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a PC gaming encyclopedia. Generate comprehensive metadata for the game "${title}".

Be accurate and factual. If you're not sure about something, use reasonable defaults.
For multiplayer_type: choose from [single_player, co_op, online_multiplayer, mmo, battle_royale, mixed]
For gameplay_pacing: [slow, medium, fast, mixed]
For session_style: [short_runs, long_sessions, sandbox, mission_based, endless, mixed]
For difficulty_style: [casual, competitive, punishing, mixed]
For camera_style: [first_person, third_person, top_down, side_scroller, isometric, mixed]

challenge_friendly should be true if the game naturally supports viewer challenges, restrictions, or competitive formats.
core_objective: what the player is trying to do
win_conditions: how you "win" or succeed
fail_conditions: how you "lose" or fail
challenge_notes: ideas for stream challenges specific to this game
safety_notes: any content warnings for streaming (violence level, mature themes, etc.)`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description_short: { type: "string" },
            developer: { type: "string" },
            publisher: { type: "string" },
            franchise: { type: "string" },
            genres: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } },
            game_modes: { type: "array", items: { type: "string" } },
            multiplayer_type: { type: "string" },
            gameplay_pacing: { type: "string" },
            session_style: { type: "string" },
            difficulty_style: { type: "string" },
            camera_style: { type: "string" },
            challenge_friendly: { type: "boolean" },
            core_objective: { type: "string" },
            win_conditions: { type: "string" },
            fail_conditions: { type: "string" },
            challenge_notes: { type: "string" },
            safety_notes: { type: "string" },
          },
        },
        add_context_from_internet: true,
        model: "gemini_3_flash",
      });

      // Create in library
      const created = await base44.asServiceRole.entities.GameLibrary.create({
        ...gameData,
        normalized_title: (gameData.title || title).toLowerCase(),
        slug: (gameData.title || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        pc_supported: true,
        is_active: true,
        sort_priority: 50,
        ai_summary: `Auto-generated during onboarding for "${title}"`,
      });

      resolved.push({ ...created, source: "ai_created" });
    }

    return Response.json({ games: resolved });
  }

  // ACTION: finalize — save everything to profile and game preferences
  if (action === "finalize") {
    const { profile_data, game_ids, top_game_ids } = payload;

    // Update creator profile
    const profiles = await base44.entities.CreatorProfile.filter({ created_by: user.email });
    const profile = profiles[0];
    if (!profile) return Response.json({ error: "No profile found" }, { status: 400 });

    const updateData = {};
    if (profile_data.display_name) updateData.display_name = profile_data.display_name;
    if (profile_data.tiktok_handle) updateData.tiktok_handle = profile_data.tiktok_handle;
    if (profile_data.primary_game) updateData.primary_game = profile_data.primary_game;
    if (profile_data.stream_goal) updateData.stream_goal = profile_data.stream_goal;
    if (profile_data.weekly_stream_target) updateData.weekly_stream_target = profile_data.weekly_stream_target;
    if (profile_data.preferred_stream_days) updateData.preferred_stream_days = profile_data.preferred_stream_days;
    if (profile_data.preferred_stream_time) updateData.preferred_stream_time = profile_data.preferred_stream_time;
    if (profile_data.promo_tone) updateData.promo_tone = profile_data.promo_tone;
    if (profile_data.creator_niche) updateData.creator_niche = profile_data.creator_niche;
    if (profile_data.content_style) updateData.content_style = profile_data.content_style;
    if (profile_data.avg_viewers) updateData.avg_viewers = profile_data.avg_viewers;
    if (profile_data.follower_count) updateData.follower_count = profile_data.follower_count;
    updateData.onboarding_completed = true;

    await base44.entities.CreatorProfile.update(profile.id, updateData);

    // Save game preferences
    for (const gameId of (game_ids || [])) {
      await base44.entities.CreatorGamePreference.create({
        game_id: gameId,
        game_title: "", // will be filled by the caller
        priority_type: (top_game_ids || []).includes(gameId) ? "top_game" : "regular_game",
        skill_confidence: "medium",
        enjoys_challenge_mode: false,
      });
    }

    return Response.json({ success: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { scheduled_stream_id, count } = await req.json();
  if (!scheduled_stream_id) return Response.json({ error: "scheduled_stream_id required" }, { status: 400 });

  const stream = await base44.asServiceRole.entities.ScheduledStream.get(scheduled_stream_id);
  if (!stream) return Response.json({ error: "Stream not found" }, { status: 404 });

  // Get creator profile for tone/style
  const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email });
  const profile = profiles[0] || {};

  // Parse game context if available
  let gameContext = null;
  if (stream.ai_game_context_snapshot) {
    try { gameContext = JSON.parse(stream.ai_game_context_snapshot); } catch {}
  }

  // Get existing challenges for this stream to avoid duplicates
  const existing = await base44.asServiceRole.entities.GameChallenge.filter({
    scheduled_stream_id,
    created_by: user.email,
  });
  const existingTitles = existing.map(c => c.challenge_title).filter(Boolean);

  const challengeMode = stream.challenge_mode || "solo";
  const challengeStyle = stream.challenge_style || "competitive";
  const generateCount = Math.min(count || 3, 5);

  const prompt = `You are an AI challenge designer for TikTok LIVE gaming creators. Generate ${generateCount} unique stream challenges.

CRITICAL RULES:
- ONLY use real game mechanics, modes, weapons, maps, and features that actually exist in the game.
- Do NOT invent fictional game mechanics, items, or modes.
- Keep challenges executable in a single stream session.
- Keep language TikTok-safe — no violence glorification, no TOS-breaking content, no unsafe dares.
- Make every challenge fun to WATCH, not just fun to play.
- Tailor the tone to gaming creators who are entertaining an audience.

GAME: ${stream.game}
STREAM TYPE: ${stream.stream_type || "ranked"}
CHALLENGE MODE: ${challengeMode}
- "solo" = streamer does it alone
- "viewer_bet" = viewers bet on outcome
- "community_vote" = viewers vote on restrictions/choices
- "speedrun" = time-based completion
- "restriction" = play with a handicap
- "custom" = freeform

CHALLENGE STYLE: ${challengeStyle}
- "hardcore" = punishing, high stakes, crowd loves the suffering
- "funny" = silly restrictions, guaranteed laughs
- "competitive" = skill-based, prove yourself
- "chill_but_spicy" = low stakes but interesting twist
- "viewer_driven" = chat controls decisions
- "custom" = mix

CREATOR PROFILE:
- Name: ${profile.display_name || "Creator"}
- Niche: ${profile.creator_niche || "variety"}
- Content style: ${profile.content_style || "entertainment"}
- Promo tone: ${profile.promo_tone || "hype"}
${profile.promo_notes ? `- Creator notes: ${profile.promo_notes}` : ""}

${gameContext ? `GAME CONTEXT (stored metadata — use this as ground truth):\n${JSON.stringify(gameContext, null, 1)}` : `No stored game context. Use only well-known, verified mechanics for ${stream.game}.`}

STREAM DURATION: ${stream.target_duration_minutes || 60} minutes
STREAM TITLE: ${stream.title || "not set"}
STREAM NOTES: ${stream.notes || "none"}

${existingTitles.length > 0 ? `ALREADY GENERATED (avoid repeating):\n${existingTitles.map(t => `- ${t}`).join("\n")}` : ""}

For each challenge, generate:
1. challenge_title — Short, punchy, stream-title-worthy (under 50 chars)
2. challenge_rules — 2-4 clear bullet points. No ambiguity.
3. win_condition — One line. When does the streamer win?
4. fail_condition — One line. When does the streamer fail?
5. streamer_intro_line — What the creator says to start. Conversational, hype, 1-2 sentences.
6. promo_hook — One sentence that would make someone click the stream. FOMO-driven.
7. viewer_interaction_idea — How chat participates (voting, betting, spamming, choosing).
8. game_fit_reason — 1-2 sentences on why this challenge works specifically for ${stream.game}. Reference actual game mechanics.

Return exactly ${generateCount} challenges.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        challenges: {
          type: "array",
          items: {
            type: "object",
            properties: {
              challenge_title: { type: "string" },
              challenge_rules: { type: "string" },
              win_condition: { type: "string" },
              fail_condition: { type: "string" },
              streamer_intro_line: { type: "string" },
              promo_hook: { type: "string" },
              viewer_interaction_idea: { type: "string" },
              game_fit_reason: { type: "string" },
            },
          },
        },
      },
    },
  });

  const challenges = result.challenges || [];
  const saved = [];

  for (const c of challenges) {
    const record = await base44.asServiceRole.entities.GameChallenge.create({
      scheduled_stream_id,
      game: stream.game,
      challenge_mode: challengeMode,
      challenge_style: challengeStyle,
      challenge_title: c.challenge_title || "",
      challenge_rules: c.challenge_rules || "",
      win_condition: c.win_condition || "",
      fail_condition: c.fail_condition || "",
      streamer_intro_line: c.streamer_intro_line || "",
      promo_hook: c.promo_hook || "",
      viewer_interaction_idea: c.viewer_interaction_idea || "",
      game_fit_reason: c.game_fit_reason || "",
      status: "generated",
      generated_at: new Date().toISOString(),
    });
    saved.push(record);
  }

  return Response.json({ challenges: saved });
});
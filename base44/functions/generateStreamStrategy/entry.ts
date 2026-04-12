import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { scheduled_stream_id, force_regenerate } = await req.json();
  if (!scheduled_stream_id) return Response.json({ error: "scheduled_stream_id required" }, { status: 400 });

  // Fetch the scheduled stream
  const stream = await base44.asServiceRole.entities.ScheduledStream.get(scheduled_stream_id);
  if (!stream) return Response.json({ error: "Stream not found" }, { status: 404 });

  // Check for existing strategy
  if (!force_regenerate) {
    const existing = await base44.asServiceRole.entities.StreamStrategy.filter({
      scheduled_stream_id,
      created_by: user.email,
    });
    if (existing.length > 0) {
      return Response.json({ strategy: existing[0], already_existed: true });
    }
  } else {
    // Delete old ones
    const old = await base44.asServiceRole.entities.StreamStrategy.filter({
      scheduled_stream_id,
      created_by: user.email,
    });
    for (const o of old) {
      await base44.asServiceRole.entities.StreamStrategy.delete(o.id);
    }
  }

  // Get creator context
  const ctx = await base44.functions.invoke("buildCreatorContext", { scope: "strategy", session_limit: 50 });

  // Build game-specific insights
  const gamePattern = ctx.patterns?.by_game?.[stream.game];
  const gameInfo = gamePattern
    ? `Game "${stream.game}" pattern: median avg viewers ${gamePattern.median_avg_viewers ?? "?"}, median score ${gamePattern.median_session_score?.toFixed(2) ?? "?"}, ${gamePattern.sample_size}× sessions (${gamePattern.confidence} confidence). Median duration: ${gamePattern.median_duration ?? "?"}min. Median followers: ${gamePattern.median_followers_gained ?? "?"}.`
    : `No pattern data for "${stream.game}" yet.`;

  const streamTypePattern = ctx.patterns?.by_stream_type?.[stream.stream_type];
  const typeInfo = streamTypePattern
    ? `Stream type "${stream.stream_type}" pattern: median avg viewers ${streamTypePattern.median_avg_viewers ?? "?"}, score ${streamTypePattern.median_session_score?.toFixed(2) ?? "?"}, ${streamTypePattern.sample_size}× sessions.`
    : "";

  // Get day pattern
  const dayName = new Date(stream.scheduled_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
  const dayPattern = ctx.patterns?.by_weekday?.[dayName];
  const dayInfo = dayPattern
    ? `${dayName} pattern: median avg viewers ${dayPattern.median_avg_viewers ?? "?"}, score ${dayPattern.median_session_score?.toFixed(2) ?? "?"}, ${dayPattern.sample_size}× sessions.`
    : "";

  // Promo impact
  const promoPatterns = ctx.patterns?.by_promo;
  const promoInfo = promoPatterns
    ? `Promo impact: With promo avg ${promoPatterns.with_promo?.median_avg_viewers ?? "?"} viewers (${promoPatterns.with_promo?.sample_size ?? 0}×), without promo ${promoPatterns.no_promo?.median_avg_viewers ?? "?"} viewers (${promoPatterns.no_promo?.sample_size ?? 0}×).`
    : "";

  // Energy impact
  const energyPatterns = ctx.patterns?.by_energy;
  const energyInfo = energyPatterns
    ? `Energy impact: High energy avg ${energyPatterns.high?.median_avg_viewers ?? "?"} viewers (${energyPatterns.high?.sample_size ?? 0}×), medium ${energyPatterns.medium?.median_avg_viewers ?? "?"} (${energyPatterns.medium?.sample_size ?? 0}×), low ${energyPatterns.low?.median_avg_viewers ?? "?"} (${energyPatterns.low?.sample_size ?? 0}×).`
    : "";

  // Recent sessions for context
  const recentInfo = (ctx.recent_5 || []).map(s =>
    `${s.stream_date} ${s.game} | avg:${s.avg_viewers ?? "?"} peak:${s.peak_viewers ?? "?"} score:${s.session_score ?? "?"} | ${s.promo_posted ? "promo" : "no-promo"} | energy:${s.energy_level}`
  ).join("\n");

  // Active experiment
  const experiments = ctx.active_experiments || [];
  const expInfo = experiments.length > 0
    ? `Active experiment: "${experiments[0].title}" — testing ${experiments[0].variable_tested}, ${experiments[0].variant_a} vs ${experiments[0].variant_b}. Metric: ${experiments[0].success_metric}.`
    : "No active experiment.";

  // Goals
  const goalsInfo = (ctx.goals || []).map(g =>
    `Goal: ${g.title || g.goal_type} — ${g.current_value || 0}/${g.target_value} ${g.unit || ""} (${g.period})`
  ).join("\n");

  const baselineInfo = ctx.baselines
    ? `Baselines (median last 10): avg viewers ${ctx.baselines.avg_viewers_median ?? "?"}, peak ${ctx.baselines.peak_viewers_median ?? "?"}, followers/session ${ctx.baselines.followers_gained_median ?? "?"}, duration ${ctx.baselines.duration_median ?? "?"}min, comments ${ctx.baselines.comments_median ?? "?"}, gifters ${ctx.baselines.gifters_median ?? "?"}`
    : "No baselines yet.";

  const prompt = `You are a TikTok LIVE gaming stream strategist. Generate a detailed, data-backed strategy guide for an upcoming stream that the creator will follow DURING the stream.

UPCOMING STREAM:
- Game: ${stream.game}
- Type: ${stream.stream_type || "ranked"}
- Date: ${stream.scheduled_date} (${dayName})
- Start Time: ${stream.start_time || "not set"}
- Target Duration: ${stream.target_duration_minutes || 60} minutes
- Title: ${stream.title || "not set"}
- Notes: ${stream.notes || "none"}

CREATOR PROFILE:
- Name: ${ctx.profile?.display_name || "Creator"}
- Goal: ${ctx.profile?.stream_goal || "grow_followers"}
- Niche: ${ctx.profile?.creator_niche || "variety"}
- Style: ${ctx.profile?.content_style || "entertainment"}

DATA:
${baselineInfo}
${gameInfo}
${typeInfo}
${dayInfo}
${promoInfo}
${energyInfo}

RECENT SESSIONS:
${recentInfo || "No recent sessions."}

GOALS:
${goalsInfo || "No active goals."}

EXPERIMENTS:
${expInfo}

Confidence level: ${ctx.confidence?.overall || "low"}

INSTRUCTIONS:
Create a concrete, actionable stream strategy. Every recommendation must reference data. Generate:

1. overall_objective — One sentence. The #1 thing to achieve this session.
2. opening_strategy — Specific plan for first 5-10 minutes. What to say, do, play. Reference what works from data.
3. peak_strategy — How to capitalize on peak viewer moments. Specific engagement tactics.
4. recovery_plays — 3 specific actions when viewers start dropping. Based on what's worked before.
5. closing_strategy — Last 10 minutes. CTA, follow prompt, teaser for next stream.
6. monetization_windows — When and how to prompt for gifts/support. Not pushy. Based on gifter patterns.
7. engagement_prompts — JSON array of 5-7 specific prompts to use during stream (questions, challenges, CTAs). Each: {minute_range: "5-15", prompt: "...", type: "question"|"challenge"|"cta"|"follow_prompt"}
8. milestones — JSON array of time-based checkpoints. Each: {minute: number, check: "...", action_if_below: "...", action_if_above: "..."}
9. key_talking_points — 3-5 things to mention during the stream.
10. avoid_list — 2-3 things NOT to do based on drop-off data.
11. experiment_note — If there's an active experiment, remind what to do differently.
12. confidence — "high" if lots of data, "medium" if some, "low" if little.
13. data_summary — 2-3 sentences summarizing what data informed this strategy.

Be tactical, specific, and concise. No generic advice. This is a playbook for the actual stream.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        overall_objective: { type: "string" },
        opening_strategy: { type: "string" },
        peak_strategy: { type: "string" },
        recovery_plays: { type: "string" },
        closing_strategy: { type: "string" },
        monetization_windows: { type: "string" },
        engagement_prompts: { type: "array", items: { type: "object", properties: { minute_range: { type: "string" }, prompt: { type: "string" }, type: { type: "string" } } } },
        milestones: { type: "array", items: { type: "object", properties: { minute: { type: "number" }, check: { type: "string" }, action_if_below: { type: "string" }, action_if_above: { type: "string" } } } },
        key_talking_points: { type: "string" },
        avoid_list: { type: "string" },
        experiment_note: { type: "string" },
        confidence: { type: "string" },
        data_summary: { type: "string" },
      },
    },
  });

  const strategy = await base44.asServiceRole.entities.StreamStrategy.create({
    scheduled_stream_id,
    stream_date: stream.scheduled_date,
    game: stream.game,
    stream_type: stream.stream_type || "ranked",
    status: "ready",
    overall_objective: result.overall_objective || "",
    opening_strategy: result.opening_strategy || "",
    peak_strategy: result.peak_strategy || "",
    recovery_plays: result.recovery_plays || "",
    closing_strategy: result.closing_strategy || "",
    monetization_windows: result.monetization_windows || "",
    engagement_prompts: JSON.stringify(result.engagement_prompts || []),
    milestones: JSON.stringify(result.milestones || []),
    key_talking_points: result.key_talking_points || "",
    avoid_list: result.avoid_list || "",
    experiment_note: result.experiment_note || "",
    confidence: result.confidence || "medium",
    data_summary: result.data_summary || "",
    generated_at: new Date().toISOString(),
  });

  // Also save to ScheduledStream.saved_strategy so desktop app can pull it directly
  await base44.asServiceRole.entities.ScheduledStream.update(scheduled_stream_id, {
    saved_strategy: JSON.stringify(strategy),
  });

  return Response.json({ strategy, already_existed: false });
});
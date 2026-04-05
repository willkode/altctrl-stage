import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { session_id, is_desktop } = await req.json();
  if (!session_id) return Response.json({ error: "session_id required" }, { status: 400 });

  // Fetch the target session from the appropriate entity
  let session;
  if (is_desktop) {
    const ds = await base44.asServiceRole.entities.DesktopSession.get(session_id);
    if (!ds) return Response.json({ error: "Desktop session not found" }, { status: 404 });
    // Normalize desktop session to match LiveSession field names
    session = {
      ...ds,
      game: ds.title || "Desktop Session",
      stream_date: ds.started_at ? ds.started_at.split("T")[0] : "",
      stream_type: "desktop",
      duration_minutes: ds.duration_min,
      followers_gained: ds.total_follows || 0,
      shares: ds.total_shares || 0,
      gifters: 0,
      diamonds: 0,
      comments: 0,
      likes_received: 0,
      energy_level: "medium",
      promo_posted: false,
      went_as_planned: true,
      notes: ds.notes || "",
      best_moment: null,
      weakest_moment: null,
      spike_reason: null,
      drop_off_reason: null,
    };
  } else {
    session = await base44.asServiceRole.entities.LiveSession.get(session_id);
    if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
  }

  // Check for existing review
  const existing = await base44.asServiceRole.entities.ReplayReview.filter({
    live_session_id: session_id,
    created_by: user.email,
  });
  if (existing.length > 0) {
    return Response.json({ review: existing[0], already_existed: true });
  }

  // Fetch creator context for baselines & patterns
  const contextRes = await base44.functions.invoke("buildCreatorContext", { scope: "quick", session_limit: 30 });
  const ctx = contextRes;

  // Try to find matching desktop session for timeline
  let desktopTimeline = null;
  let desktopSession = null;
  const desktopSessions = await base44.asServiceRole.entities.DesktopSession.filter({ user_id: user.email }, "-created_date", 50);
  const match = desktopSessions.find(d => {
    const dDate = d.started_at ? d.started_at.split("T")[0] : null;
    return dDate === session.stream_date;
  });
  if (match) {
    desktopSession = match;
    try {
      desktopTimeline = JSON.parse(match.timeline || "[]");
    } catch {
      desktopTimeline = [];
    }
  }

  // Build prompt
  const baselineInfo = ctx.baselines
    ? `Creator baselines (median last 10): avg viewers ${ctx.baselines.avg_viewers_median ?? "?"}, peak ${ctx.baselines.peak_viewers_median ?? "?"}, followers/session ${ctx.baselines.followers_gained_median ?? "?"}, duration ${ctx.baselines.duration_median ?? "?"}min`
    : "No baselines available yet (too few sessions).";

  const gamePattern = ctx.patterns?.by_game?.[session.game];
  const gameInfo = gamePattern
    ? `${session.game} pattern: median avg ${gamePattern.median_avg_viewers ?? "?"}, median score ${gamePattern.median_session_score?.toFixed(2) ?? "?"}, ${gamePattern.sample_size}× sessions (${gamePattern.confidence} conf).`
    : "";

  const timelineSection = desktopTimeline?.length > 0
    ? `Desktop timeline data (${desktopTimeline.length} events):\n${JSON.stringify(desktopTimeline.slice(0, 50), null, 1)}`
    : "No desktop timeline available for this session.";

  const alertsInfo = desktopSession
    ? `Desktop alerts fired: ${desktopSession.alerts_fired || 0}, marked helpful: ${desktopSession.alerts_marked_helpful || 0}.`
    : "";

  const prompt = `You are a TikTok LIVE gaming analytics AI. Generate a detailed post-stream debrief/review for this session.

SESSION DATA:
- Game: ${session.game || "unknown"}
- Date: ${session.stream_date}
- Type: ${session.stream_type || "unknown"}
- Duration: ${session.duration_minutes || "?"} minutes
- Avg Viewers: ${session.avg_viewers ?? "?"}
- Peak Viewers: ${session.peak_viewers ?? "?"}
- Followers Gained: ${session.followers_gained ?? 0}
- Comments: ${session.comments ?? 0}
- Shares: ${session.shares ?? 0}
- Gifters: ${session.gifters ?? 0}
- Diamonds: ${session.diamonds ?? 0}
- Energy: ${session.energy_level || "medium"}
- Promo posted: ${session.promo_posted ? "yes" : "no"}
- Went as planned: ${session.went_as_planned ? "yes" : "no"}
- Creator notes: ${session.notes || "none"}
- Best moment (creator): ${session.best_moment || "not specified"}
- Weakest moment (creator): ${session.weakest_moment || "not specified"}
- Spike reason (creator): ${session.spike_reason || "not specified"}
- Drop-off reason (creator): ${session.drop_off_reason || "not specified"}

CREATOR CONTEXT:
${baselineInfo}
${gameInfo}
${alertsInfo}

TIMELINE:
${timelineSection}

INSTRUCTIONS:
Analyze the session metrics vs baselines and the timeline (if present) to identify:
1. strongest_opening — What worked in the first 5-10 minutes. If no timeline, infer from metrics.
2. strongest_engagement — The peak engagement moment and what likely caused it.
3. dead_zones — Periods of low activity or viewer drop. Be specific about timeframes if timeline available.
4. clip_worthy — Moments worth clipping for promo or highlight reels.
5. lessons — 2-3 actionable lessons for next time. Be specific, data-backed if possible.
6. overall_rating — 1-5 based on performance vs baseline (3 = baseline, 5 = exceptional).
7. timestamp_notes — JSON array of {minute, note, type} where type is "highlight"|"dead_zone"|"peak"|"drop"|"insight". Only include if timeline data exists.

Be concise, tactical, and specific. No generic filler. Reference actual numbers.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        strongest_opening: { type: "string" },
        strongest_engagement: { type: "string" },
        dead_zones: { type: "string" },
        clip_worthy: { type: "string" },
        lessons: { type: "string" },
        overall_rating: { type: "number" },
        timestamp_notes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              minute: { type: "number" },
              note: { type: "string" },
              type: { type: "string" },
            },
          },
        },
      },
    },
  });

  // Save the review
  const review = await base44.asServiceRole.entities.ReplayReview.create({
    live_session_id: session_id,
    session_date: session.stream_date,
    game: session.game,
    reviewed_at: new Date().toISOString(),
    strongest_opening: result.strongest_opening || "",
    strongest_engagement: result.strongest_engagement || "",
    dead_zones: result.dead_zones || "",
    clip_worthy: result.clip_worthy || "",
    timestamp_notes: JSON.stringify(result.timestamp_notes || []),
    lessons: result.lessons || "",
    overall_rating: result.overall_rating || 3,
    reviewed: true,
  });

  // Mark session as replay_reviewed (only for LiveSession)
  if (!is_desktop) {
    await base44.asServiceRole.entities.LiveSession.update(session_id, { replay_reviewed: true });
  }

  return Response.json({ review, already_existed: false });
});
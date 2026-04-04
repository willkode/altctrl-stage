import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Desktop app endpoint: GET strategy for a scheduled stream
// Called by desktop app to pull in strategy and guide user during stream
Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { scheduled_stream_id, action } = await req.json();

  // Action: "list_upcoming" — return upcoming streams with strategy status
  if (action === "list_upcoming") {
    const streams = await base44.asServiceRole.entities.ScheduledStream.filter({
      created_by: user.email,
    });
    const today = new Date().toISOString().split("T")[0];
    const upcoming = streams
      .filter(s => s.scheduled_date >= today && s.status !== "cancelled" && s.status !== "skipped")
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
      .slice(0, 10);

    // Get strategies for these streams
    const strategies = await base44.asServiceRole.entities.StreamStrategy.filter({
      created_by: user.email,
    });
    const strategyMap = {};
    strategies.forEach(s => { strategyMap[s.scheduled_stream_id] = s; });

    const result = upcoming.map(s => ({
      id: s.id,
      game: s.game,
      stream_type: s.stream_type,
      scheduled_date: s.scheduled_date,
      start_time: s.start_time,
      title: s.title,
      target_duration_minutes: s.target_duration_minutes,
      has_strategy: !!strategyMap[s.id],
      strategy_id: strategyMap[s.id]?.id || null,
      strategy_status: strategyMap[s.id]?.status || null,
    }));

    return Response.json({ streams: result });
  }

  // Action: "get" — return full strategy for a stream
  if (action === "get" || !action) {
    if (!scheduled_stream_id) {
      return Response.json({ error: "scheduled_stream_id required" }, { status: 400 });
    }

    const strategies = await base44.asServiceRole.entities.StreamStrategy.filter({
      scheduled_stream_id,
      created_by: user.email,
    });

    if (strategies.length === 0) {
      return Response.json({ strategy: null, message: "No strategy generated yet for this stream." });
    }

    const strategy = strategies[0];

    // Parse JSON fields for the desktop app
    let engagementPrompts = [];
    let milestones = [];
    try { engagementPrompts = JSON.parse(strategy.engagement_prompts || "[]"); } catch {}
    try { milestones = JSON.parse(strategy.milestones || "[]"); } catch {}

    return Response.json({
      strategy: {
        ...strategy,
        engagement_prompts_parsed: engagementPrompts,
        milestones_parsed: milestones,
      },
    });
  }

  // Action: "activate" — mark strategy as active (stream starting)
  if (action === "activate") {
    if (!scheduled_stream_id) {
      return Response.json({ error: "scheduled_stream_id required" }, { status: 400 });
    }
    const strategies = await base44.asServiceRole.entities.StreamStrategy.filter({
      scheduled_stream_id,
      created_by: user.email,
    });
    if (strategies.length > 0) {
      await base44.asServiceRole.entities.StreamStrategy.update(strategies[0].id, { status: "active" });
      return Response.json({ success: true, status: "active" });
    }
    return Response.json({ error: "No strategy found" }, { status: 404 });
  }

  // Action: "complete" — mark strategy as completed (stream ended)
  if (action === "complete") {
    if (!scheduled_stream_id) {
      return Response.json({ error: "scheduled_stream_id required" }, { status: 400 });
    }
    const strategies = await base44.asServiceRole.entities.StreamStrategy.filter({
      scheduled_stream_id,
      created_by: user.email,
    });
    if (strategies.length > 0) {
      await base44.asServiceRole.entities.StreamStrategy.update(strategies[0].id, { status: "completed" });
      return Response.json({ success: true, status: "completed" });
    }
    return Response.json({ error: "No strategy found" }, { status: 404 });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
});
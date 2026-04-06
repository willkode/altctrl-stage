import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Desktop app endpoint: strategy management for scheduled streams
Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { scheduled_stream_id, action, session_id, stream_strategy_id } = body;

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

    // Load creator profile to compute personalized trigger thresholds
    const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email }, '-created_date', 1);
    const avgViewers = profiles[0]?.avg_viewers || 0;

    // 3-tier thresholds based on audience size
    let triggerThresholds;
    if (avgViewers >= 500) {
      // Tight thresholds — more sensitive for large audiences
      triggerThresholds = {
        chat_slowdown_msgs_per_min: 20,
        viewer_drop_pct: 12,
        viewer_spike_pct: 20,
        gift_burst_count: 6,
        monologue_seconds: 45,
        engagement_low_score: 40,
        support_momentum_high: 75,
      };
    } else if (avgViewers >= 100) {
      // Default thresholds
      triggerThresholds = {
        chat_slowdown_msgs_per_min: 12,
        viewer_drop_pct: 18,
        viewer_spike_pct: 25,
        gift_burst_count: 4,
        monologue_seconds: 60,
        engagement_low_score: 35,
        support_momentum_high: 65,
      };
    } else {
      // Relaxed thresholds — less sensitive for smaller audiences
      triggerThresholds = {
        chat_slowdown_msgs_per_min: 5,
        viewer_drop_pct: 25,
        viewer_spike_pct: 35,
        gift_burst_count: 3,
        monologue_seconds: 90,
        engagement_low_score: 25,
        support_momentum_high: 60,
      };
    }

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
        trigger_thresholds: triggerThresholds,
      },
    });
  }

  // Action: "activate" — mark strategy as active and link session
  if (action === "activate") {
    if (!scheduled_stream_id) {
      return Response.json({ error: "scheduled_stream_id required" }, { status: 400 });
    }

    const strategies = await base44.asServiceRole.entities.StreamStrategy.filter({
      scheduled_stream_id,
      created_by: user.email,
    });
    if (strategies.length > 0) {
      const stratId = stream_strategy_id || strategies[0].id;
      await base44.asServiceRole.entities.StreamStrategy.update(strategies[0].id, { status: "active" });

      if (session_id) {
        const existing = await base44.asServiceRole.entities.DesktopSession.filter({
          session_id,
          user_id: user.email,
        });
        const linkData = { scheduled_stream_id, stream_strategy_id: stratId };
        if (existing.length > 0) {
          await base44.asServiceRole.entities.DesktopSession.update(existing[0].id, linkData);
        } else {
          await base44.asServiceRole.entities.DesktopSession.create({
            session_id,
            user_id: user.email,
            started_at: new Date().toISOString(),
            ...linkData,
          });
        }
      }

      return Response.json({ success: true, status: "active", strategy_id: strategies[0].id });
    }
    return Response.json({ error: "No strategy found" }, { status: 404 });
  }

  // Action: "complete" — mark strategy as completed
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
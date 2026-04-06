import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Live State Engine — Phase 2
 * Deterministic stream state detection. No AI calls.
 * Triggered by desktop app every 30 seconds during a live stream.
 *
 * Reads last N LivePulse entries for a session and classifies:
 *   warming_up | settling | stable | rising | high_momentum |
 *   viewer_spike | chat_cooling | monetization_window |
 *   retention_dip | dead_zone | drop_risk | closing_window
 *
 * Outputs: state, state_changed, state_duration_minutes, trigger_coach
 * Updates the LivePulse record with the classified stream_state.
 * If trigger_coach = true, calls runCoachAI.
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Support both desktop camelCase payload and internal snake_case pulse payload
  const session_id = body.session_id || body.sessionId;
  const pulse_id = body.pulse_id;

  // If the desktop sent a full pulse payload, create/upsert the LivePulse record first
  let resolvedPulseId = pulse_id;
  if (body.sessionId && body.viewers !== undefined) {
    const uptimeSec = body.uptimeSec || 0;
    const minuteLiveFromDesktop = Math.round(uptimeSec / 60);
    const rawPlatform = body.platform || "tiktok";
    const pulseRecord = {
      session_id,
      user_id: user.email,
      platform: rawPlatform.toLowerCase(),
      captured_at: body.timestamp || new Date().toISOString(),
      minute_live: minuteLiveFromDesktop,
      current_viewers: body.viewers || 0,
      peak_viewers_so_far: body.peakViewers || 0,
      comments_last_2m: body.chatRateMpm ? Math.round(body.chatRateMpm * 2) : 0,
      gifts_last_2m: body.totalGifts || 0,
      shares_last_2m: body.totalShares || 0,
      follows_last_2m: body.totalFollows || 0,
      momentum_score: body.supportMomentum || body.engagementScore || 0,
    };
    const createdPulse = await base44.asServiceRole.entities.LivePulse.create(pulseRecord);
    resolvedPulseId = createdPulse.id;

    // Also link scheduledStreamId / streamStrategyId onto DesktopSession if provided
    if (body.scheduledStreamId || body.streamStrategyId) {
      const existingSession = await base44.asServiceRole.entities.DesktopSession.filter({ session_id, user_id: user.email });
      const linkData = {
        scheduled_stream_id: body.scheduledStreamId || null,
        stream_strategy_id: body.streamStrategyId || null,
      };
      if (existingSession.length > 0) {
        await base44.asServiceRole.entities.DesktopSession.update(existingSession[0].id, linkData);
      } else {
        await base44.asServiceRole.entities.DesktopSession.create({
          session_id,
          user_id: user.email,
          platform: rawPlatform.toLowerCase(),
          started_at: body.timestamp || new Date().toISOString(),
          ...linkData,
        });
      }
    }
  }

  if (!session_id) return Response.json({ error: 'session_id required' }, { status: 400 });

  // --- 1. Fetch last 10 pulses for this session (most recent first) ---
  const pulses = await base44.asServiceRole.entities.LivePulse.filter(
    { session_id },
    '-minute_live',
    10
  );

  if (!pulses || pulses.length === 0) {
    return Response.json({ error: 'No pulses found for session' }, { status: 404 });
  }

  // --- Fetch creator profile for personalized thresholds ---
  const profiles = await base44.asServiceRole.entities.CreatorProfile.filter(
    { created_by: user.email }, '-created_date', 1
  );
  const creatorAvgViewers = profiles[0]?.avg_viewers || 0;

  const latest = pulses[0];
  const prev = pulses[1] || null;
  const last3 = pulses.slice(0, 3);
  const last5 = pulses.slice(0, 5);

  // --- 2. Compute derived signals ---
  const minuteLive = latest.minute_live || 0;
  const currentViewers = latest.current_viewers || 0;
  const peakViewers = latest.peak_viewers_so_far || currentViewers;
  const momentum = latest.momentum_score || 0;
  const chatLast2m = latest.comments_last_2m || 0;
  const giftsLast2m = latest.gifts_last_2m || 0;

  // Viewer trend: compare latest vs 3 pulses ago
  const refPulse = last3[last3.length - 1];
  const refViewers = refPulse?.current_viewers || currentViewers;
  const viewerDelta = refViewers > 0 ? (currentViewers - refViewers) / refViewers : 0;

  // Prev pulse viewers for spike detection
  const prevViewers = prev?.current_viewers || currentViewers;
  const viewerSpikePct = prevViewers > 0 ? (currentViewers - prevViewers) / prevViewers : 0;

  // Average viewers over last 5 pulses
  const avgViewers5 = last5.length > 0
    ? last5.reduce((s, p) => s + (p.current_viewers || 0), 0) / last5.length
    : currentViewers;

  // Chat silence: how many consecutive pulses had 0 comments
  const consecutiveSilentPulses = pulses.filter((p, i) => i < 3 && (p.comments_last_2m || 0) === 0).length;

  // Gifts trend: compare last 2 pulses
  const prevGifts = prev?.gifts_last_2m || 0;
  const giftSpike = prevGifts > 0 ? giftsLast2m / prevGifts : (giftsLast2m > 0 ? 2 : 1);

  // How long since the previous classification (state duration)
  let previousState = 'unknown';
  let stateDurationMinutes = 0;

  const recentLogs = await base44.asServiceRole.entities.CoachActionLog.filter(
    { session_id },
    '-sent_at',
    1
  );
  if (recentLogs && recentLogs[0]) {
    previousState = recentLogs[0].stream_state_at_fire || 'unknown';
    const firedAt = recentLogs[0].sent_at ? new Date(recentLogs[0].sent_at) : null;
    if (firedAt) {
      stateDurationMinutes = Math.round((Date.now() - firedAt.getTime()) / 60000);
    }
  }

  const prevPulseState = prev?.stream_state || 'unknown';

  // --- 3. Classify stream state (priority ordered — first match wins) ---
  const deadZoneSilentThreshold = creatorAvgViewers >= 200 ? 3 : 2;
  const chatCoolingMinViewers = creatorAvgViewers >= 100 ? 10 : 0;

  let state = 'stable';

  if (minuteLive <= 3) {
    state = 'warming_up';
  }
  else if (consecutiveSilentPulses >= deadZoneSilentThreshold && currentViewers < avgViewers5 * 0.9) {
    state = 'dead_zone';
  }
  else if (peakViewers > 0 && currentViewers < peakViewers * 0.80) {
    state = 'drop_risk';
  }
  else if (viewerDelta < -0.10 && state !== 'drop_risk') {
    state = 'retention_dip';
  }
  else if (viewerSpikePct >= 0.25) {
    state = 'viewer_spike';
  }
  else if (giftSpike >= 2 && momentum >= 60) {
    state = 'monetization_window';
  }
  else if (momentum >= 75) {
    state = 'high_momentum';
  }
  else if (viewerDelta >= 0.15) {
    state = 'rising';
  }
  else if (chatLast2m === 0 && (prev?.comments_last_2m || 0) > 0 && currentViewers >= chatCoolingMinViewers) {
    state = 'chat_cooling';
  }
  else if (minuteLive >= 50 && momentum < 50) {
    state = 'closing_window';
  }
  else if (minuteLive <= 8) {
    state = 'settling';
  }
  else {
    state = 'stable';
  }

  const stateChanged = state !== prevPulseState;

  // --- 4. Decide whether to trigger Coach AI ---
  const HIGH_PRIORITY_STATES = ['dead_zone', 'drop_risk', 'monetization_window', 'viewer_spike'];
  const RECOVERY_STATES = ['retention_dip', 'chat_cooling'];

  let triggerCoach = false;
  let triggerReason = null;

  if (stateChanged && HIGH_PRIORITY_STATES.includes(state)) {
    triggerCoach = true;
    triggerReason = 'state_change_high_priority';
  } else if (HIGH_PRIORITY_STATES.includes(state) && stateDurationMinutes >= 2) {
    triggerCoach = true;
    triggerReason = 'sustained_danger_state';
  } else if (stateChanged && RECOVERY_STATES.includes(state)) {
    triggerCoach = true;
    triggerReason = 'state_change_recovery';
  } else if (state === 'monetization_window' && stateChanged) {
    triggerCoach = true;
    triggerReason = 'monetization_window_opened';
  }

  // --- 5. Cooldown check ---
  if (triggerCoach && recentLogs[0]) {
    const cooldownUntil = recentLogs[0].cooldown_until
      ? new Date(recentLogs[0].cooldown_until)
      : null;
    if (cooldownUntil && cooldownUntil > new Date()) {
      triggerCoach = false;
      triggerReason = 'cooldown_active';
    }
  }

  // --- 6. Update the LivePulse record with classified state ---
  if (resolvedPulseId) {
    await base44.asServiceRole.entities.LivePulse.update(resolvedPulseId, {
      stream_state: state,
    });
  }

  // --- 7. Build result payload ---
  const result = {
    session_id,
    pulse_id: resolvedPulseId,
    state,
    state_changed: stateChanged,
    previous_state: prevPulseState,
    state_duration_minutes: stateDurationMinutes,
    trigger_coach: triggerCoach,
    trigger_reason: triggerReason,
    signals: {
      minute_live: minuteLive,
      current_viewers: currentViewers,
      peak_viewers: peakViewers,
      viewer_delta_pct: Math.round(viewerDelta * 100),
      viewer_spike_pct: Math.round(viewerSpikePct * 100),
      chat_last_2m: chatLast2m,
      gifts_last_2m: giftsLast2m,
      gift_spike_ratio: Math.round(giftSpike * 10) / 10,
      momentum_score: momentum,
      consecutive_silent_pulses: consecutiveSilentPulses,
      creator_avg_viewers: creatorAvgViewers,
    },
  };

  // --- 8. If trigger_coach, invoke runCoachAI ---
  if (triggerCoach) {
    await base44.asServiceRole.functions.invoke('runCoachAI', {
      session_id,
      pulse_id: resolvedPulseId,
      state,
      state_changed: stateChanged,
      trigger_reason: triggerReason,
      signals: { ...result.signals, creator_avg_viewers: creatorAvgViewers },
    });
  }

  return Response.json(result);
});
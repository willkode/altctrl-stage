import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Coach AI — Phase 3
 * Wording layer only. Fires ONLY when liveStateEngine sets trigger_coach = true.
 *
 * Flow:
 *   1. Validate cooldown + anti-spam (max 3 prompts per 10 min window)
 *   2. Load context: session, stream strategy, creator profile, recent coach history
 *   3. Build raw insight (what / why / best action) — deterministic where possible
 *   4. LLM call: turn insight into creator-facing wording (message + fallback)
 *   5. Write to CoachActionLog with full structured fields
 *   6. Set cooldown_until on the new log entry
 */

const COOLDOWN_NORMAL_MS = 2 * 60 * 1000;   // 2 min standard cooldown
const COOLDOWN_LOW_MS    = 4 * 60 * 1000;   // 4 min for low-priority prompts
const MAX_PROMPTS_PER_10MIN = 3;
const WINDOW_MS = 10 * 60 * 1000;

// Priority map per state
const STATE_PRIORITY = {
  dead_zone:           1,
  drop_risk:           1,
  monetization_window: 1,
  viewer_spike:        2,
  retention_dip:       2,
  chat_cooling:        3,
  closing_window:      2,
  high_momentum:       3,
  rising:              4,
  warming_up:          4,
  settling:            5,
  stable:              5,
  unknown:             5,
};

// Action type map per state
const STATE_ACTION_TYPE = {
  dead_zone:           'dead_zone_alert',
  drop_risk:           'drop_risk_alert',
  monetization_window: 'monetization_window',
  viewer_spike:        'reintroduce_stream',
  retention_dip:       'recovery_action',
  chat_cooling:        'engagement_prompt',
  closing_window:      'closing_move',
  high_momentum:       'supporter_push',
  rising:              'engagement_prompt',
  warming_up:          'opening_reminder',
  settling:            'reintroduce_stream',
  stable:              'general_tip',
  unknown:             'general_tip',
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { session_id, pulse_id, state, state_changed, trigger_reason, signals } = body;

  if (!session_id || !state) {
    return Response.json({ error: 'session_id and state required' }, { status: 400 });
  }

  const now = new Date();

  // --- 1. Anti-spam: check prompts fired in last 10 min ---
  const recentLogs = await base44.asServiceRole.entities.CoachActionLog.filter(
    { session_id },
    '-sent_at',
    10
  );

  // Hard cooldown check
  if (recentLogs[0]?.cooldown_until) {
    const cooldownUntil = new Date(recentLogs[0].cooldown_until);
    if (cooldownUntil > now) {
      return Response.json({ skipped: true, reason: 'cooldown_active', cooldown_until: cooldownUntil });
    }
  }

  // Max prompts per window check
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  const promptsInWindow = recentLogs.filter(l => l.sent_at && new Date(l.sent_at) > windowStart).length;
  if (promptsInWindow >= MAX_PROMPTS_PER_10MIN) {
    return Response.json({ skipped: true, reason: 'max_prompts_per_window', count: promptsInWindow });
  }

  // Duplicate suppression: same action_type in last 5 min
  const actionType = STATE_ACTION_TYPE[state] || 'general_tip';
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const duplicateRecent = recentLogs.find(l =>
    l.action_type === actionType &&
    l.sent_at && new Date(l.sent_at) > fiveMinAgo
  );
  if (duplicateRecent && STATE_PRIORITY[state] >= 3) {
    return Response.json({ skipped: true, reason: 'duplicate_action_type_suppressed' });
  }

  // --- 2. Load context ---
  const [sessions, profiles] = await Promise.all([
    base44.asServiceRole.entities.LiveSession.filter({ session_id }, '-stream_date', 1),
    base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email }),
  ]);

  const session = sessions[0] || null;
  const profile = profiles[0] || null;

  // Load stream strategy if linked
  let strategy = null;
  if (session?.scheduled_stream_id) {
    const strategies = await base44.asServiceRole.entities.StreamStrategy.filter(
      { scheduled_stream_id: session.scheduled_stream_id },
      '-generated_at',
      1
    );
    strategy = strategies[0] || null;
  }

  // Load last 3 coach log entries for context (what was said recently)
  const recentPrompts = recentLogs.slice(0, 3).map(l => ({
    action_type: l.action_type,
    message: l.message,
    result: l.result,
    sent_at: l.sent_at,
  }));

  // --- 3. Build raw insight object (deterministic) ---
  const sig = signals || {};
  const insight = buildInsight(state, trigger_reason, sig, strategy, profile, recentPrompts);

  // --- 4. LLM call: convert insight to creator-facing wording ---
  const wording = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: buildWordingPrompt(insight, profile, sig),
    response_json_schema: {
      type: 'object',
      properties: {
        message:    { type: 'string' },
        fallback:   { type: 'string' },
        confidence: { type: 'number' },
      },
    },
  });

  // --- 5. Compute cooldown duration ---
  const priority = STATE_PRIORITY[state] || 3;
  const cooldownMs = priority <= 2 ? COOLDOWN_NORMAL_MS : COOLDOWN_LOW_MS;
  const cooldownUntil = new Date(now.getTime() + cooldownMs).toISOString();
  const expiresAt = new Date(now.getTime() + 3 * 60 * 1000).toISOString(); // prompt expires in 3 min

  // --- 6. Build metrics snapshot ---
  const metricsSnapshotBefore = JSON.stringify({
    viewers:      sig.current_viewers,
    peak_viewers: sig.peak_viewers,
    chat_rate:    sig.chat_last_2m,
    gifts_rate:   sig.gifts_last_2m,
    momentum:     sig.momentum_score,
    minute_live:  sig.minute_live,
  });

  // --- 7. Write to CoachActionLog ---
  const logEntry = await base44.asServiceRole.entities.CoachActionLog.create({
    session_id,
    pulse_id: pulse_id || null,
    owner_email: user.email,
    action_type: actionType,
    message:     wording.message,
    reason:      insight.why,
    fallback:    wording.fallback,
    priority,
    confidence:  wording.confidence || 0.7,
    stream_state_at_fire:      state,
    state_duration_minutes:    sig.state_duration_minutes || 0,
    metrics_snapshot_before:   metricsSnapshotBefore,
    metrics_snapshot_after:    null,  // filled later by scoreCoachOutcome
    result:                    'pending',
    sent_at:                   now.toISOString(),
    expires_at:                expiresAt,
    cooldown_until:            cooldownUntil,
    dismissed:                 false,
    helpful:                   null,
    insight_raw:               JSON.stringify(insight),
    triggered_by:              trigger_reason ? 'state_change' : 'rules_engine',
    minute_live_at_fire:       sig.minute_live || 0,
  });

  return Response.json({
    fired: true,
    log_id: logEntry.id,
    action_type: actionType,
    message: wording.message,
    fallback: wording.fallback,
    priority,
    confidence: wording.confidence,
    cooldown_until: cooldownUntil,
    state,
  });
});

// ---------------------------------------------------------------------------
// Builds the raw insight object deterministically from state + signals
// ---------------------------------------------------------------------------
function buildInsight(state, triggerReason, sig, strategy, profile, recentPrompts) {
  const goal = strategy?.overall_objective || profile?.stream_goal || 'grow_followers';
  const minuteLive = sig.minute_live || 0;
  const viewers = sig.current_viewers || 0;
  const peakViewers = sig.peak_viewers || viewers;
  const dropPct = peakViewers > 0 ? Math.round(((peakViewers - viewers) / peakViewers) * 100) : 0;

  const insights = {
    dead_zone: {
      what:       'Stream has gone silent — no chat activity detected',
      why:        `Chat dead for 2+ minutes at minute ${minuteLive}. Your baseline is ~${sig.creator_avg_viewers || viewers} viewers — this silence is unusually deep for your audience size.`,
      best_action:'Break the silence immediately with a direct question or challenge prompt',
      context:    { goal, minuteLive, viewers },
    },
    drop_risk: {
      what:       `Viewer count has dropped ${dropPct}% from peak`,
      why:        `Peak was ${peakViewers} viewers, now at ${viewers}. Continued drop risks losing momentum entirely.`,
      best_action:'Re-hook the audience — restate the stream goal and create immediate stakes',
      context:    { goal, minuteLive, viewers, peakViewers, dropPct },
    },
    monetization_window: {
      what:       'Gift momentum is spiking — monetization window is open',
      why:        `Gifts are up ${Math.round(sig.gift_spike_ratio * 100)}% and momentum score is ${sig.momentum_score}. This is the best time to acknowledge supporters.`,
      best_action:'Slow down, thank supporters by name, and build the moment',
      context:    { goal, minuteLive, viewers, giftRate: sig.gifts_last_2m, momentum: sig.momentum_score },
    },
    viewer_spike: {
      what:       `Viewers spiked ${sig.viewer_spike_pct}% in the last minute`,
      why:        'New viewers just arrived — they do not know what the stream is about yet.',
      best_action:'Reintroduce the stream clearly: who you are, what the challenge is, what to watch for',
      context:    { goal, minuteLive, viewers },
    },
    retention_dip: {
      what:       `Viewer count trending down ${Math.abs(sig.viewer_delta_pct)}% over last 3 minutes`,
      why:        'Retention is slipping before a major drop. Act now before it becomes a drop risk.',
      best_action:strategy?.recovery_plays || 'Switch segment — change pace, ask chat a question, or recap the challenge',
      context:    { goal, minuteLive, viewers },
    },
    chat_cooling: {
      what:       'Chat activity just went quiet after being active',
      why:        `Chat dropped to zero at minute ${minuteLive}. With ~${sig.creator_avg_viewers || viewers} typical viewers, silence this deep means disengagement is spreading.`,
      best_action:'Ask a direct yes/no or choice question — make it easy for chat to respond immediately',
      context:    { goal, minuteLive, viewers, chatRate: sig.chat_last_2m, creatorAvgViewers: sig.creator_avg_viewers },
    },
    closing_window: {
      what:       `Stream approaching close at minute ${minuteLive}`,
      why:        'Now is the time to convert viewers into followers and set up the next stream.',
      best_action:strategy?.closing_strategy || 'Call out your next stream date, ask for a follow, end with a clear strong moment',
      context:    { goal, minuteLive, viewers },
    },
    high_momentum: {
      what:       `Momentum score is high at ${sig.momentum_score}`,
      why:        'The stream is performing well. Use this moment to push engagement further.',
      best_action:strategy?.peak_strategy || 'Set a mini-goal with chat — make the high moment mean something',
      context:    { goal, minuteLive, viewers, momentum: sig.momentum_score },
    },
    rising: {
      what:       `Viewers growing ${sig.viewer_delta_pct}% over last 3 minutes`,
      why:        'Stream is gaining traction. Keep the energy up and help new viewers get hooked.',
      best_action:'Invite chat participation — acknowledge the growth and give viewers a reason to stay',
      context:    { goal, minuteLive, viewers },
    },
    warming_up: {
      what:       `Stream is in the first ${minuteLive} minutes — warm-up phase`,
      why:        'First impressions set retention for the whole stream.',
      best_action:strategy?.opening_strategy || 'Establish the stream clearly in the first 30 seconds — name, game, what you are doing today',
      context:    { goal, minuteLive, viewers },
    },
    settling: {
      what:       'Stream is settling after the opening',
      why:        'Viewers who stayed past the first 3 minutes need a reason to stay longer.',
      best_action:'Restate the challenge or goal and create a first engagement hook',
      context:    { goal, minuteLive, viewers },
    },
    stable: {
      what:       'Stream is stable with no major signal changes',
      why:        'Good baseline. Use this window to seed the next engagement moment.',
      best_action:strategy?.engagement_prompts ? JSON.parse(strategy.engagement_prompts)?.[0] : 'Ask chat a question related to your current game situation',
      context:    { goal, minuteLive, viewers },
    },
  };

  return insights[state] || {
    what: 'Stream state detected',
    why: `Current state: ${state}`,
    best_action: 'Stay engaged with your audience',
    context: { goal, minuteLive, viewers },
  };
}

// ---------------------------------------------------------------------------
// Builds the LLM prompt for creator-facing wording
// ---------------------------------------------------------------------------
function buildWordingPrompt(insight, profile, sig) {
  const tone = profile?.promo_tone || 'hype';
  const displayName = profile?.display_name || 'the streamer';

  const avgViewersContext = sig.creator_avg_viewers
    ? `\nCREATOR AVG VIEWERS (their normal baseline): ${sig.creator_avg_viewers}`
    : '';

  return `You are the live coaching AI for a TikTok LIVE gaming creator named ${displayName}.

The stream intelligence system has detected the following situation:

WHAT IS HAPPENING: ${insight.what}
WHY IT MATTERS: ${insight.why}
BEST ACTION: ${insight.best_action}
CREATOR TONE: ${tone}
MINUTE INTO STREAM: ${sig.minute_live || 0}
CURRENT VIEWERS: ${sig.current_viewers || 0}${avgViewersContext}

Your job: Turn this into a coaching prompt for the creator.

Rules:
- Maximum 2 short sentences for "message"
- Message is what the creator should DO or SAY right now — make it concrete and specific
- "fallback" is what to do if nothing changes in 2 minutes — also specific, different from message
- DO NOT give generic advice like "engage your audience" or "keep energy up"
- Write like a real coach in their ear, not a report
- Match the creator's tone (${tone})
- "confidence" is 0.0-1.0 based on how clear-cut the situation is
- If creator avg viewers is provided, calibrate urgency relative to their normal baseline (e.g. 0 chat is less alarming for a 5-viewer stream than a 200-viewer stream)

Return JSON with: message, fallback, confidence`;
}
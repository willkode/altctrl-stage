import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Coach Outcome Scorer — Phase 5
 * Runs every 5 minutes (scheduled automation).
 * 
 * For each CoachActionLog with result="pending" where sent_at was 3+ minutes ago:
 *   1. Fetch LivePulse records AFTER the action fired
 *   2. Compare metrics_snapshot_before vs post-action pulses
 *   3. Score result: worked | partial | failed | no_data
 *   4. Write metrics_snapshot_after + result + result_scored_at back to log
 *
 * Scoring logic (all deterministic, no AI):
 *   - "worked"  : viewers stable/up AND (chat improved OR gifts improved OR momentum up 10+)
 *   - "partial" : one metric improved but not both
 *   - "failed"  : viewers dropped further OR all metrics flat/down
 *   - "no_data" : not enough post-action pulses to score
 *
 * Also sets cooldown_until on any "too_early" logs that fired within the last 30s.
 */

const SCORE_DELAY_MS   = 3 * 60 * 1000;  // Wait 3 min after sent_at before scoring
const MAX_SCORE_AGE_MS = 60 * 60 * 1000; // Don't score logs older than 1 hour
const BATCH_SIZE       = 20;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const now = new Date();
  const scoreAfter  = new Date(now.getTime() - SCORE_DELAY_MS).toISOString();
  const scoreBefore = new Date(now.getTime() - MAX_SCORE_AGE_MS).toISOString();

  // --- 1. Fetch pending logs ready to score ---
  // Fetch all pending, then filter in JS since we need date range
  const allPending = await base44.asServiceRole.entities.CoachActionLog.filter(
    { result: 'pending' },
    '-sent_at',
    BATCH_SIZE
  );

  const readyToScore = allPending.filter(log => {
    if (!log.sent_at) return false;
    const sentAt = new Date(log.sent_at);
    return sentAt <= new Date(scoreAfter) && sentAt >= new Date(scoreBefore);
  });

  if (readyToScore.length === 0) {
    return Response.json({ scored: 0, message: 'No pending logs ready to score' });
  }

  const results = [];

  for (const log of readyToScore) {
    const sessionId = log.session_id;
    const sentAt = new Date(log.sent_at);
    const minuteLiveFired = log.minute_live_at_fire || 0;

    // --- 2. Fetch pulses AFTER the action (3-6 min window) ---
    const postPulses = await base44.asServiceRole.entities.LivePulse.filter(
      { session_id: sessionId },
      'minute_live',
      10
    );

    // Filter to pulses captured after this action + within 6 min
    const windowEnd = new Date(sentAt.getTime() + 6 * 60 * 1000);
    const afterPulses = postPulses.filter(p => {
      if (!p.captured_at) return false;
      const t = new Date(p.captured_at);
      return t > sentAt && t <= windowEnd;
    });

    if (afterPulses.length < 1) {
      // Not enough data yet — mark no_data if log is old enough
      const age = now - sentAt;
      if (age > 8 * 60 * 1000) {
        await base44.asServiceRole.entities.CoachActionLog.update(log.id, {
          result: 'no_data',
          result_scored_at: now.toISOString(),
        });
        results.push({ id: log.id, result: 'no_data', reason: 'no_post_pulses' });
      }
      continue;
    }

    // --- 3. Parse before-snapshot ---
    let before = {};
    try { before = JSON.parse(log.metrics_snapshot_before || '{}'); } catch {}

    // --- 4. Build after-snapshot from avg of post pulses ---
    const avgPost = {
      viewers:      avg(afterPulses, 'current_viewers'),
      chat_rate:    avg(afterPulses, 'comments_last_2m'),
      gifts_rate:   avg(afterPulses, 'gifts_last_2m'),
      momentum:     avg(afterPulses, 'momentum_score'),
    };

    const afterSnapshot = JSON.stringify({
      ...avgPost,
      pulse_count: afterPulses.length,
      window_minutes: 6,
    });

    // --- 5. Score the outcome ---
    const result = scoreOutcome(log.action_type, log.stream_state_at_fire, before, avgPost);

    // --- 6. Update the log ---
    await base44.asServiceRole.entities.CoachActionLog.update(log.id, {
      result,
      metrics_snapshot_after: afterSnapshot,
      result_scored_at: now.toISOString(),
    });

    results.push({ id: log.id, result, session_id: sessionId, action_type: log.action_type });
  }

  return Response.json({
    scored: results.length,
    results,
    timestamp: now.toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Deterministic outcome scoring
// ---------------------------------------------------------------------------
function scoreOutcome(actionType, state, before, after) {
  const bViewers   = before.viewers      || 0;
  const bChat      = before.chat_rate    || 0;
  const bGifts     = before.gifts_rate   || 0;
  const bMomentum  = before.momentum     || 0;

  const aViewers   = after.viewers       || 0;
  const aChat      = after.chat_rate     || 0;
  const aGifts     = after.gifts_rate    || 0;
  const aMomentum  = after.momentum      || 0;

  // Viewer stability: within 10% of before = stable
  const viewerDelta   = bViewers > 0 ? (aViewers - bViewers) / bViewers : 0;
  const viewersStable = viewerDelta >= -0.10;
  const viewersUp     = viewerDelta >= 0.05;

  // Engagement improvements
  const chatImproved     = aChat > bChat || (bChat === 0 && aChat > 0);
  const giftsImproved    = aGifts > bGifts;
  const momentumImproved = aMomentum >= bMomentum + 10;

  const engagementCount = [chatImproved, giftsImproved, momentumImproved].filter(Boolean).length;

  // Special cases per action type
  if (actionType === 'dead_zone_alert' || actionType === 'engagement_prompt') {
    // Success = chat came back
    if (chatImproved && viewersStable) return 'worked';
    if (chatImproved && !viewersStable) return 'partial';
    if (!chatImproved && viewersStable) return 'partial';
    return 'failed';
  }

  if (actionType === 'monetization_window' || actionType === 'supporter_push') {
    // Success = gifts improved
    if (giftsImproved && viewersStable) return 'worked';
    if (giftsImproved) return 'partial';
    return 'failed';
  }

  if (actionType === 'drop_risk_alert' || actionType === 'recovery_action') {
    // Success = viewers stabilized
    if (viewersUp) return 'worked';
    if (viewersStable && engagementCount >= 1) return 'partial';
    if (viewersStable) return 'partial';
    return 'failed';
  }

  if (actionType === 'reintroduce_stream') {
    // Success = momentum or viewers up after spike/settle
    if ((viewersUp || momentumImproved) && chatImproved) return 'worked';
    if (viewersUp || momentumImproved) return 'partial';
    return 'failed';
  }

  // Default: general improvement check
  if (viewersStable && engagementCount >= 2) return 'worked';
  if (viewersStable && engagementCount >= 1) return 'partial';
  if (!viewersStable) return 'failed';
  return 'partial';
}

function avg(arr, key) {
  if (!arr.length) return 0;
  return arr.reduce((s, p) => s + (p[key] || 0), 0) / arr.length;
}
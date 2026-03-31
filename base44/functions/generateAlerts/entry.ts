import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function weekStart(weeksAgo = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) - weeksAgo * 7);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function dateStr(d) {
  return d.toISOString().split("T")[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const week = getISOWeek(now);
    const year = now.getFullYear();

    // Load all data in parallel (sessions + replays + profile snapshots)
    const [profile, sessions, streams, existingAlerts, replays, profileSnapshots] = await Promise.all([
      base44.entities.CreatorProfile.filter({ created_by: user.email }).then(r => r[0] || null),
      base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 200),
      base44.entities.ScheduledStream.filter({ created_by: user.email }, "-scheduled_date", 200),
      base44.entities.PerformanceAlert.filter({ created_by: user.email, dismissed: false }, "-created_date", 100),
      base44.entities.ReplayReview.filter({ created_by: user.email }, "-reviewed_at", 20),
      base44.entities.TikTokProfileSnapshot.filter({ created_by: user.email }, "-captured_at", 5),
    ]);

    const weeklyTarget = profile?.weekly_stream_target || 3;
    const thisWeekStart = weekStart(0);
    const lastWeekStart = weekStart(1);
    const lastWeekEnd = new Date(thisWeekStart.getTime() - 1);
    const twoWeeksAgoStart = weekStart(2);

    // --- Helper: has alert of type been created this week? ---
    function alreadyAlerted(alertType, sinceWeeksAgo = 0) {
      const since = weekStart(sinceWeeksAgo);
      return existingAlerts.some(a =>
        a.alert_type === alertType &&
        a.week_number === week &&
        a.year === year &&
        new Date(a.created_date) >= since
      );
    }

    const toCreate = [];

    // ─── 1. STREAK MILESTONE ──────────────────────────────────────────────
    // Count consecutive weeks meeting stream target
    if (!alreadyAlerted("streak_milestone")) {
      const weekSessions = (start, end) =>
        sessions.filter(s => {
          const d = new Date(s.stream_date + "T12:00:00");
          return d >= start && d <= end;
        });

      let streak = 0;
      for (let w = 0; w < 12; w++) {
        const wStart = weekStart(w);
        const wEnd = new Date(wStart.getTime() + 7 * 86400000 - 1);
        const count = weekSessions(wStart, wEnd).length;
        if (count >= weeklyTarget) streak++;
        else break;
      }

      if (streak >= 2 && [2, 3, 4, 5, 8, 12].includes(streak)) {
        toCreate.push({
          alert_type: "streak_milestone",
          severity: "success",
          title: `🔥 ${streak}-Week Streak!`,
          body: `You've hit your stream target of ${weeklyTarget} sessions for ${streak} weeks in a row. Momentum is building — don't stop now.`,
          week_number: week, year, source: "ai_generated",
        });
      }
    }

    // ─── 2. CONSISTENCY DROP ─────────────────────────────────────────────
    if (!alreadyAlerted("consistency_drop")) {
      const thisWeekSessions = sessions.filter(s => new Date(s.stream_date + "T12:00:00") >= thisWeekStart);
      const lastWeekSessions = sessions.filter(s => {
        const d = new Date(s.stream_date + "T12:00:00");
        return d >= lastWeekStart && d < thisWeekStart;
      });

      const dayOfWeek = now.getUTCDay(); // 0=Sun
      const daysIn = dayOfWeek === 0 ? 7 : dayOfWeek;
      const weekProgress = daysIn / 7;
      const projectedThisWeek = weekProgress > 0 ? Math.round(thisWeekSessions.length / weekProgress) : 0;

      if (lastWeekSessions.length >= weeklyTarget && projectedThisWeek < weeklyTarget && daysIn >= 3) {
        const deficit = weeklyTarget - thisWeekSessions.length;
        const daysLeft = 7 - daysIn;
        toCreate.push({
          alert_type: "consistency_drop",
          severity: "warning",
          title: "Consistency at Risk",
          body: `You streamed ${lastWeekSessions.length}x last week but only ${thisWeekSessions.length}x so far this week. You need ${deficit} more stream${deficit > 1 ? "s" : ""} with ${daysLeft} day${daysLeft > 1 ? "s" : ""} left to hit your goal.`,
          week_number: week, year, source: "ai_generated",
        });
      }
    }

    // ─── 3. STREAK BROKEN ────────────────────────────────────────────────
    if (!alreadyAlerted("missed_streams")) {
      const lastWeekSessions = sessions.filter(s => {
        const d = new Date(s.stream_date + "T12:00:00");
        return d >= lastWeekStart && d < thisWeekStart;
      });
      const prevWeekSessions = sessions.filter(s => {
        const d = new Date(s.stream_date + "T12:00:00");
        return d >= twoWeeksAgoStart && d < lastWeekStart;
      });

      if (lastWeekSessions.length < weeklyTarget && prevWeekSessions.length >= weeklyTarget) {
        const missed = weeklyTarget - lastWeekSessions.length;
        toCreate.push({
          alert_type: "missed_streams",
          severity: "warning",
          title: "Streak Broken Last Week",
          body: `You missed ${missed} planned stream${missed > 1 ? "s" : ""} last week and fell short of your ${weeklyTarget}-stream target. This week is a clean slate — let's bounce back.`,
          week_number: week, year, source: "ai_generated",
        });
      }
    }

    // ─── 4. PROMO IMPACT + DEBRIEF INSIGHT ───────────────────────────────────
    if (!alreadyAlerted("promo_missed")) {
      const recentSessions = sessions
        .filter(s => new Date(s.stream_date + "T12:00:00") >= weekStart(2))
        .slice(0, 10);

      if (recentSessions.length >= 3) {
        const promoSessions = recentSessions.filter(s => s.promo_posted);
        const noPromo = recentSessions.filter(s => !s.promo_posted);
        
        // Calculate promo effect from actual data
        const promoAvg = promoSessions.length > 0
          ? promoSessions.reduce((a, s) => a + (s.avg_viewers || 0), 0) / promoSessions.length
          : 0;
        const noPromoAvg = noPromo.length > 0
          ? noPromo.reduce((a, s) => a + (s.avg_viewers || 0), 0) / noPromo.length
          : 0;
        const promoEffect = noPromoAvg > 0 ? Math.round(((promoAvg - noPromoAvg) / noPromoAvg) * 100) : 0;
        
        const rate = noPromo.length / recentSessions.length;
        if (rate >= 0.7) {
          // Use debrief insight if available
          const debreifNote = replays.length > 0
            ? ` One creator noted: "${replays[0].lessons?.substring(0, 80)}..."`
            : '';
          
          toCreate.push({
            alert_type: "promo_missed",
            severity: "warning",
            title: "Promo Gaps Detected",
            body: `${noPromo.length} of your last ${recentSessions.length} streams had no promo posted. Your promo-posted sessions averaged ${Math.round(promoAvg)} viewers vs ${Math.round(noPromoAvg)} without — that's ${promoEffect > 0 ? '+' : ''}${promoEffect}% impact. Try generating a kit before your next stream.${debreifNote}`,
            week_number: week, year, source: "ai_generated",
          });
        }
      }
    }

    // ─── 5. BEST TIME SLOT INSIGHT (with day-of-week analysis) ─────────────
    if (!alreadyAlerted("best_time_insight")) {
      const withTime = sessions.filter(s => s.start_time && s.avg_viewers != null);
      if (withTime.length >= 5) {
        const slotMap = {};
        withTime.forEach(s => {
          const hour = parseInt(s.start_time.split(":")[0], 10);
          const slot = `${hour}:00`;
          if (!slotMap[slot]) slotMap[slot] = { total: 0, count: 0 };
          slotMap[slot].total += s.avg_viewers;
          slotMap[slot].count++;
        });

        const slots = Object.entries(slotMap)
          .filter(([, v]) => v.count >= 2)
          .map(([slot, v]) => ({ slot, avg: Math.round(v.total / v.count), count: v.count }))
          .sort((a, b) => b.avg - a.avg);

        if (slots.length >= 2) {
          const best = slots[0];
          const worst = slots[slots.length - 1];
          const diff = best.avg - worst.avg;
          if (diff >= 5) {
            const hour = parseInt(best.slot);
            const label = hour === 0 ? "midnight" : hour < 12 ? `${hour}am` : hour === 12 ? "noon" : `${hour - 12}pm`;
            toCreate.push({
              alert_type: "best_time_insight",
              severity: "info",
              title: `Peak Slot: ${label}`,
              body: `Your ${label} streams average ${best.avg} viewers across ${best.count} sessions — ${diff} more than your lowest-performing time slot. Consider anchoring your schedule around this time.`,
              metric_key: "avg_viewers",
              metric_value: best.avg,
              week_number: week, year, source: "ai_generated",
            });
          }
        }
      }
    }

    // ─── 6. STRONG WEEK + DEBRIEF MOMENTUM ───────────────────────────────────
    if (!alreadyAlerted("strong_week")) {
      const lastWeekSessions = sessions.filter(s => {
        const d = new Date(s.stream_date + "T12:00:00");
        return d >= lastWeekStart && d < thisWeekStart;
      });
      const prevWeekSessions = sessions.filter(s => {
        const d = new Date(s.stream_date + "T12:00:00");
        return d >= twoWeeksAgoStart && d < lastWeekStart;
      });

      if (lastWeekSessions.length >= weeklyTarget) {
        const lastAvg = lastWeekSessions.filter(s => s.avg_viewers > 0).reduce((a, s) => a + s.avg_viewers, 0) / (lastWeekSessions.filter(s => s.avg_viewers > 0).length || 1);
        const prevAvg = prevWeekSessions.filter(s => s.avg_viewers > 0).reduce((a, s) => a + s.avg_viewers, 0) / (prevWeekSessions.filter(s => s.avg_viewers > 0).length || 1);

        if (lastWeekSessions.length >= weeklyTarget && lastAvg > prevAvg * 1.2 && prevWeekSessions.length > 0) {
          // Add debrief insight if available
          const debreifBoost = replays.length > 0
            ? ` Your replay reviews this week captured key improvements.`
            : '';
          
          toCreate.push({
            alert_type: "strong_week",
            severity: "success",
            title: "Strong Week Last Week",
            body: `You hit your stream target and averaged ${Math.round(lastAvg)} viewers — a ${Math.round(((lastAvg - prevAvg) / prevAvg) * 100)}% jump from the week before. Great execution.${debreifBoost}`,
            metric_key: "avg_viewers",
            metric_value: Math.round(lastAvg),
            week_number: week, year, source: "ai_generated",
          });
        }
      }
    }

    // ─── 7. COLLAB/SOLO PERFORMANCE INSIGHT ──────────────────────────────────
    // (Example: recommend collab if collab sessions significantly outperform)
    if (!alreadyAlerted("best_game_insight") && sessions.length >= 5) {
      const sessionsByType = {};
      sessions.slice(0, 20).forEach(s => {
        const type = s.stream_type || 'other';
        if (!sessionsByType[type]) sessionsByType[type] = { total: 0, count: 0 };
        if (s.avg_viewers) {
          sessionsByType[type].total += s.avg_viewers;
          sessionsByType[type].count++;
        }
      });
      
      const typeStats = Object.entries(sessionsByType)
        .map(([type, d]) => ({ type, avg: Math.round(d.total / d.count), count: d.count }))
        .sort((a, b) => b.avg - a.avg);
      
      if (typeStats.length >= 2) {
        const best = typeStats[0];
        const worst = typeStats[typeStats.length - 1];
        if (best.count >= 2 && worst.count >= 2 && best.avg > worst.avg * 1.3) {
          toCreate.push({
            alert_type: "best_game_insight",
            severity: "info",
            title: `${best.type.replace('_', ' ')} Format Outperforms`,
            body: `Your ${best.type.replace('_', ' ')} streams average ${best.avg} viewers vs ${worst.avg} for ${worst.type.replace('_', ' ')}. Consider scheduling more ${best.type.replace('_', ' ')} sessions this week.`,
            metric_key: "stream_type",
            metric_value: best.avg,
            week_number: week, year, source: "ai_generated",
          });
        }
      }
    }

    // Create all new alerts
    if (toCreate.length > 0) {
      await Promise.all(toCreate.map(a => base44.entities.PerformanceAlert.create(a)));
    }

    return Response.json({
      created: toCreate.length,
      alerts: toCreate.map(a => a.alert_type),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
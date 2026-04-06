import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Support both new nested payload (body.session) and legacy flat payload
    const session = body.session || {};
    const sessionId = session.id || body.sessionId;

    if (!sessionId) {
      return Response.json({ message: 'Missing required field: session.id' }, { status: 400 });
    }

    const startedAt = session.startedAt || body.startedAt;
    if (!startedAt) {
      return Response.json({ message: 'Missing required field: session.startedAt' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Normalize platform to lowercase
    const rawPlatform = session.platform || body.platform || "tiktok";
    const platform = rawPlatform.toLowerCase();

    const record = {
      session_id: sessionId,
      user_id: user.email,
      scheduled_stream_id: body.scheduledStreamId || session.scheduledStreamId || null,
      stream_strategy_id: body.streamStrategyId || session.streamStrategyId || null,
      title: session.title || body.title || "",
      game: session.game || body.game || "",
      platform,
      currency_type: body.currencyType || session.currencyType || "diamonds",
      strategy_pack_id: session.strategyPackId || "",
      started_at: startedAt,
      ended_at: session.endedAt || body.endedAt || null,
      duration_min: body.durationMin || 0,
      pack_version_used: session.strategyPackVersion || body.packVersionUsed || "",

      peak_viewers: body.peakViewers ?? 0,
      avg_viewers: body.avgViewers ?? 0,
      total_unique_viewers: body.totalUniqueViewers ?? 0,
      return_viewers: body.returnViewers ?? 0,
      estimated_avg_watch_sec: body.estimatedAvgWatchSec ?? 0,
      first_minute_drop_rate: body.firstMinuteDropRate ?? 0,

      total_gifts: body.totalGifts ?? 0,
      total_diamonds: body.totalDiamonds ?? 0,
      total_follows: body.totalFollows ?? 0,
      total_shares: body.totalShares ?? 0,
      unique_chatters: body.uniqueChatters ?? 0,
      unique_gifters: body.uniqueGifters ?? 0,
      repeat_gifters: body.repeatGifters ?? 0,

      follow_conversion_rate: body.followConversionRate ?? 0,
      share_conversion_rate: body.shareConversionRate ?? 0,
      gift_conversion_rate: body.giftConversionRate ?? 0,

      alerts_fired: body.alertsFired ?? 0,
      alerts_marked_helpful: body.alertsMarkedHelpful ?? 0,

      supporter_concentration: body.supporterConcentration ? JSON.stringify(body.supporterConcentration) : null,
      viewer_snapshots: body.viewerSnapshots?.length ? JSON.stringify(body.viewerSnapshots) : "[]",
      top_gifters: body.topGifters?.length ? JSON.stringify(body.topGifters) : "[]",
      timeline: body.timeline?.length ? JSON.stringify(body.timeline) : "[]",
      chat_log: body.chatLog?.length ? JSON.stringify(body.chatLog) : "[]",
      peak_moments: body.peakMoments?.length ? JSON.stringify(body.peakMoments) : "[]",
      drop_moments: body.dropMoments?.length ? JSON.stringify(body.dropMoments) : "[]",
      top_support_moments: body.topSupportMoments?.length ? JSON.stringify(body.topSupportMoments) : "[]",
      viewer_log: body.viewerLog?.length ? JSON.stringify(body.viewerLog) : "[]",
      activity_log: body.activityLog?.length ? JSON.stringify(body.activityLog) : "[]",

      notes: body.notes || "",
      synced_at: now,
    };

    // Upsert by session_id + user_id
    const existing = await base44.asServiceRole.entities.DesktopSession.filter({
      session_id: sessionId,
      user_id: user.email,
    });

    let desktopSessionDbId;
    if (existing.length > 0) {
      await base44.asServiceRole.entities.DesktopSession.update(existing[0].id, record);
      desktopSessionDbId = existing[0].id;
    } else {
      const created = await base44.asServiceRole.entities.DesktopSession.create(record);
      desktopSessionDbId = created.id;
    }

    // Process viewerLog — upsert each viewer into ViewerHistory
    // Only TikTok sends viewerLog; YouTube/Twitch will have empty arrays — skip gracefully
    if (body.viewerLog?.length) {
      for (const entry of body.viewerLog) {
        if (!entry.userId) continue;
        const existingViewer = await base44.asServiceRole.entities.ViewerHistory.filter({
          creator_id: user.email,
          user_id: entry.userId,
        });
        const entryTime = entry.lastJoinAt || entry.firstJoinAt || now;
        if (existingViewer.length > 0) {
          const rec = existingViewer[0];
          await base44.asServiceRole.entities.ViewerHistory.update(rec.id, {
            display_name: entry.nickname || entry.displayName || rec.display_name,
            stream_count: (rec.stream_count || 0) + 1,
            last_seen_at: entryTime,
            last_session_id: sessionId,
            total_joins: (rec.total_joins || 0) + (entry.joinCount || 1),
            is_subscriber: rec.is_subscriber || (entry.teamMemberLevel > 0),
            is_follower: rec.is_follower || (entry.followRole > 0),
          });
        } else {
          await base44.asServiceRole.entities.ViewerHistory.create({
            creator_id: user.email,
            user_id: entry.userId,
            display_name: entry.nickname || entry.displayName || '',
            stream_count: 1,
            first_seen_at: entry.firstJoinAt || now,
            last_seen_at: entryTime,
            last_session_id: sessionId,
            total_joins: entry.joinCount || 1,
            is_subscriber: (entry.teamMemberLevel > 0) || false,
            is_follower: (entry.followRole > 0) || false,
          });
        }
      }
    }

    return Response.json({ ok: true, sessionId: desktopSessionDbId });

  } catch (error) {
    if (error.message?.includes('Unauthorized') || error.message?.includes('auth')) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
});
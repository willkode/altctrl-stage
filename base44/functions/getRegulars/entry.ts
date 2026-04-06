import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Returns the top 50 regulars (3+ sessions) for this creator, sorted by stream count.
// Called by the desktop app before going live to power VIP welcome alerts.
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch top viewers by stream count — grab more than 50 so we can filter client-side
  const allViewers = await base44.asServiceRole.entities.ViewerHistory.filter(
    { creator_id: user.email },
    '-stream_count',
    200
  );

  // Only return viewers with 3+ session appearances (true "regulars")
  const regulars = allViewers
    .filter(r => (r.stream_count || 0) >= 3)
    .slice(0, 50);

  return Response.json({
    ok: true,
    regulars: regulars.map(r => ({
      userId: r.user_id,
      displayName: r.display_name,
      streamCount: r.stream_count || 0,
      isSubscriber: r.is_subscriber || false,
      isFollower: r.is_follower || false,
      lastSeenAt: r.last_seen_at,
    })),
  });
});
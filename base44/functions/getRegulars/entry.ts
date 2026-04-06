import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Returns the top 20 regulars for this creator, sorted by stream count.
// Called by the desktop app once when going live.
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const regulars = await base44.asServiceRole.entities.ViewerHistory.filter(
    { creator_id: user.email },
    '-stream_count',
    20
  );

  return Response.json({
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
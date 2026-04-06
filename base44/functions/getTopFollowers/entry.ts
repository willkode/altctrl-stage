import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const topFollowers = await base44.asServiceRole.entities.ViewerHistory.filter(
    { creator_id: user.email, is_follower: true },
    "-stream_count",
    10
  );

  return Response.json({ followers: topFollowers || [] });
});
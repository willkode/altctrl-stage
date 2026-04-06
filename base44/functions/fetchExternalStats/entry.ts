import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { platform, handle, id } = payload;

    if (!platform || !handle) {
      return Response.json({ error: 'Missing platform or handle' }, { status: 400 });
    }

    const platformUrls = {
      twitch: `https://twitch.tv/${handle}`,
      youtube: `https://youtube.com/@${handle}`,
      tiktok: `https://tiktok.com/@${handle}`,
    };

    const url = platformUrls[platform];
    if (!url) {
      return Response.json({ error: 'Invalid platform' }, { status: 400 });
    }

    // Use AI to fetch and parse the profile
    const llmResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Visit and analyze the ${platform.toUpperCase()} profile at: ${url}

Extract and return ONLY valid JSON with these fields (use null if not found):
{
  "followers": <number or null>,
  "status": "<'online', 'offline', or 'unknown'>",
  "bio": "<profile bio/description or null>",
  "profile_title": "<display name or channel name>",
  "last_stream_title": "<title of last stream or null>",
  "verified": <true/false>,
  "follower_text": "<the exact follower count text if visible>"
}

Be accurate with the follower count. Return ONLY the JSON object, no other text.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          followers: { type: ['number', 'null'] },
          status: { type: 'string', enum: ['online', 'offline', 'unknown'] },
          bio: { type: ['string', 'null'] },
          profile_title: { type: ['string', 'null'] },
          last_stream_title: { type: ['string', 'null'] },
          verified: { type: 'boolean' },
          follower_text: { type: ['string', 'null'] },
        },
      },
    });

    const stats = llmResult.data;

    // Normalize followers (in case API returns a string)
    const followerCount = typeof stats.followers === 'number' 
      ? stats.followers 
      : parseInt(stats.follower_text?.replace(/[^0-9]/g, '') || '0');

    const connection = {
      platform,
      handle,
      profile_url: url,
      followers: followerCount || 0,
      status: stats.status || 'unknown',
      bio: stats.bio,
      profile_title: stats.profile_title || handle,
      last_stream_title: stats.last_stream_title,
      verified: stats.verified === true,
      stats_snapshot: JSON.stringify(stats),
      last_sync_at: new Date().toISOString(),
      last_sync_status: 'success',
    };

    // If updating existing, use the ID
    let result;
    if (id) {
      await base44.entities.ExternalPlatformConnection.update(id, connection);
      result = { ...connection, id };
    } else {
      result = await base44.entities.ExternalPlatformConnection.create(connection);
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Fetch external stats error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});
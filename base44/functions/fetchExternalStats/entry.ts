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

    let stats = { followers: null, status: 'unknown', bio: null, profile_title: handle, last_stream_title: null, verified: false, follower_text: null };

    // Step 1: Try fetching the actual profile page HTML to extract stats
    let pageContent = null;
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      if (resp.ok) {
        pageContent = await resp.text();
        // Limit to first 50KB to avoid token limits
        pageContent = pageContent.substring(0, 50000);
      }
    } catch (e) {
      console.log('Direct fetch failed, falling back to AI search:', e.message);
    }

    if (pageContent && pageContent.length > 500) {
      // Parse the HTML with AI — much more reliable than blind web search
      stats = await base44.integrations.Core.InvokeLLM({
        prompt: `I fetched the HTML from ${url}. Extract the creator's profile stats from this page content.

Look for:
- Follower/subscriber count (often in meta tags, JSON-LD, or data attributes)
- Display name
- Bio/description
- Verified badge
- Any live status indicators

For TikTok, look for patterns like:
- "followerCount" or "fans" in JSON data or meta tags
- "followingCount", "heartCount", "videoCount"
- og:description meta tag often contains "Followers" count
- Look for numbers followed by "Followers" text

For Twitch, look for:
- Channel data in scripts or meta tags

For YouTube, look for:
- subscriberCountText or subscriber count in the page

Here is the page HTML (truncated):
---
${pageContent}
---

Extract the REAL numbers from the HTML. Do NOT guess or hallucinate. If you find "1.2K Followers" that means 1200. If you find "15.4M" that means 15400000.`,
        response_json_schema: {
          type: 'object',
          properties: {
            followers: { type: 'number' },
            status: { type: 'string', enum: ['online', 'offline', 'unknown'] },
            bio: { type: 'string' },
            profile_title: { type: 'string' },
            last_stream_title: { type: 'string' },
            verified: { type: 'boolean' },
            follower_text: { type: 'string' },
          },
        },
      });
    } else {
      // Fallback: Use AI web search with specific stats sites
      const trackerUrls = {
        tiktok: `tokcount.com/${handle} OR socialblade.com/tiktok/user/${handle}`,
        twitch: `twitchtracker.com/${handle} OR sullygnome.com/channel/${handle}`,
        youtube: `socialblade.com/youtube/c/${handle}`,
      };

      stats = await base44.integrations.Core.InvokeLLM({
        prompt: `Search for the ${platform} creator "@${handle}" stats.

Search these specific sources:
- ${trackerUrls[platform]}
- ${url}

Find their REAL follower/subscriber count. Do NOT return 0 unless the account truly has 0 followers.
Convert text like "1.2K" to 1200, "5M" to 5000000.
Also find: bio, display name, verified status, live status, recent stream title.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            followers: { type: 'number' },
            status: { type: 'string', enum: ['online', 'offline', 'unknown'] },
            bio: { type: 'string' },
            profile_title: { type: 'string' },
            last_stream_title: { type: 'string' },
            verified: { type: 'boolean' },
            follower_text: { type: 'string' },
          },
        },
      });
    }

    const followerCount = typeof stats.followers === 'number' && stats.followers > 0
      ? stats.followers 
      : parseInt(String(stats.follower_text || '0').replace(/[^0-9]/g, '') || '0');

    const connection = {
      platform,
      handle,
      profile_url: url,
      followers: followerCount || 0,
      status: stats.status || 'unknown',
      bio: stats.bio || null,
      profile_title: stats.profile_title || handle,
      last_stream_title: stats.last_stream_title || null,
      verified: stats.verified === true,
      stats_snapshot: JSON.stringify(stats),
      last_sync_at: new Date().toISOString(),
      last_sync_status: 'success',
      last_error: null,
    };

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
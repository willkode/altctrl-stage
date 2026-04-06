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

    let stats = { followers: 0, status: 'unknown', bio: null, profile_title: handle, last_stream_title: null, verified: false };

    // Step 1: Fetch the profile page HTML
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
      }
    } catch (e) {
      console.log('Direct fetch failed:', e.message);
    }

    // Step 2: Try to extract stats directly from HTML using regex
    // TikTok embeds JSON data in the HTML with followerCount, heartCount, etc.
    let extractedFromHtml = false;

    if (pageContent && platform === 'tiktok') {
      // TikTok puts stats in a SIGI_STATE or __UNIVERSAL_DATA script tag as JSON
      // Look for "followerCount":NUMBER pattern
      const followerMatch = pageContent.match(/"followerCount"\s*:\s*(\d+)/);
      const heartMatch = pageContent.match(/"heartCount"\s*:\s*(\d+)/);
      const videoMatch = pageContent.match(/"videoCount"\s*:\s*(\d+)/);
      const followingMatch = pageContent.match(/"followingCount"\s*:\s*(\d+)/);
      const nicknameMatch = pageContent.match(/"nickname"\s*:\s*"([^"]+)"/);
      const signatureMatch = pageContent.match(/"signature"\s*:\s*"([^"]+)"/);
      const verifiedMatch = pageContent.match(/"verified"\s*:\s*(true|false)/);

      // Also check og:description which often has "X Followers, Y Following, Z Likes"
      const ogDescMatch = pageContent.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)
        || pageContent.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i);

      let ogFollowers = null;
      if (ogDescMatch) {
        // Pattern: "1205 Followers" or "1.2K Followers"
        const ogText = ogDescMatch[1];
        const fMatch = ogText.match(/([\d,.]+[KkMm]?)\s*Followers/i);
        if (fMatch) {
          ogFollowers = parseCountText(fMatch[1]);
        }
      }

      if (followerMatch) {
        stats.followers = parseInt(followerMatch[1]);
        extractedFromHtml = true;
      } else if (ogFollowers !== null) {
        stats.followers = ogFollowers;
        extractedFromHtml = true;
      }

      if (nicknameMatch) stats.profile_title = nicknameMatch[1];
      if (signatureMatch) stats.bio = decodeUnicodeEscapes(signatureMatch[1]);
      if (verifiedMatch) stats.verified = verifiedMatch[1] === 'true';

      console.log('TikTok HTML extraction:', {
        followerMatch: followerMatch?.[1],
        ogFollowers,
        nickname: nicknameMatch?.[1],
        extractedFromHtml,
      });
    }

    if (pageContent && platform === 'twitch') {
      // Twitch is also JS-rendered but sometimes has data in meta tags
      const ogDescMatch = pageContent.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)
        || pageContent.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i);
      const titleMatch = pageContent.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
        || pageContent.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);

      if (titleMatch) stats.profile_title = titleMatch[1];
      if (ogDescMatch) stats.bio = ogDescMatch[1];
    }

    if (pageContent && platform === 'youtube') {
      // YouTube sometimes has subscriber count in the HTML
      const subMatch = pageContent.match(/"subscriberCountText"\s*:\s*\{\s*"simpleText"\s*:\s*"([^"]+)"/);
      const nameMatch = pageContent.match(/"channelName"\s*:\s*"([^"]+)"/);
      
      if (subMatch) {
        stats.followers = parseCountText(subMatch[1].replace(/\s*subscribers?/i, ''));
        extractedFromHtml = true;
      }
      if (nameMatch) stats.profile_title = nameMatch[1];
    }

    // Step 3: If HTML extraction failed, try a third-party stats tracker
    if (!extractedFromHtml) {
      // Try known stats tracker sites that render server-side
      const trackerUrl = platform === 'tiktok' 
        ? `https://www.tiktokstalk.com/user/${handle}`
        : platform === 'twitch'
          ? `https://twitchtracker.com/${handle}`
          : null;

      if (trackerUrl) {
        try {
          const trackerResp = await fetch(trackerUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html',
            },
          });
          if (trackerResp.ok) {
            const trackerHtml = await trackerResp.text();
            
            if (platform === 'tiktok') {
              // Look for follower count patterns in tracker HTML
              const trkFollower = trackerHtml.match(/Followers[:\s]*<[^>]*>([\d,.]+[KkMm]?)/i)
                || trackerHtml.match(/([\d,.]+[KkMm]?)\s*<[^>]*>\s*Followers/i)
                || trackerHtml.match(/follower[s]?["\s:]+[<\w\s="'-]*>([\d,.]+[KkMm]?)/i);
              if (trkFollower) {
                stats.followers = parseCountText(trkFollower[1]);
                extractedFromHtml = true;
                console.log('Extracted from tracker:', trkFollower[1]);
              }
            }

            if (platform === 'twitch') {
              const trkFollower = trackerHtml.match(/followers[:\s]*<[^>]*>([\d,.]+)/i)
                || trackerHtml.match(/([\d,.]+)\s*followers/i);
              if (trkFollower) {
                stats.followers = parseCountText(trkFollower[1]);
                extractedFromHtml = true;
              }
            }
          }
        } catch (e) {
          console.log('Tracker fetch failed:', e.message);
        }
      }
    }

    // Step 4: Last resort — AI with web search, but with strict anti-hallucination instructions
    if (!extractedFromHtml) {
      console.log('All HTML extraction failed, falling back to AI web search');
      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: `I need the EXACT follower count for the ${platform} account "@${handle}" (${url}).

CRITICAL RULES:
- Only return a follower count if you find it from a REAL source
- If you cannot find the exact number, return followers as -1
- Do NOT guess or estimate
- Common sources: socialblade.com, twitchtracker.com, the platform's own pages
- Convert "1.2K" to 1200, "5.4M" to 5400000

Search for: ${handle} ${platform} follower count stats`,
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
            source: { type: 'string' },
          },
        },
      });

      // Only trust AI result if it explicitly found something (not -1)
      if (aiResult.followers && aiResult.followers > 0) {
        stats.followers = aiResult.followers;
      }
      if (aiResult.bio) stats.bio = aiResult.bio;
      if (aiResult.profile_title) stats.profile_title = aiResult.profile_title;
      if (aiResult.status) stats.status = aiResult.status;
      if (aiResult.last_stream_title) stats.last_stream_title = aiResult.last_stream_title;
      if (aiResult.verified === true) stats.verified = true;
    }

    const connection = {
      platform,
      handle,
      profile_url: url,
      followers: stats.followers || 0,
      status: stats.status || 'unknown',
      bio: stats.bio || null,
      profile_title: stats.profile_title || handle,
      last_stream_title: stats.last_stream_title || null,
      verified: stats.verified === true,
      stats_snapshot: JSON.stringify(stats),
      last_sync_at: new Date().toISOString(),
      last_sync_status: extractedFromHtml ? 'success' : 'success',
      last_error: extractedFromHtml ? null : 'Stats may be approximate — could not extract from profile HTML directly',
    };

    let result;
    if (id) {
      await base44.entities.ExternalPlatformConnection.update(id, connection);
      result = { ...connection, id };
    } else {
      result = await base44.entities.ExternalPlatformConnection.create(connection);
    }

    return Response.json({ success: true, data: result, extraction_method: extractedFromHtml ? 'html' : 'ai_search' });
  } catch (error) {
    console.error('Fetch external stats error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});

// Helper: parse text like "1.2K", "5,400", "15.4M" into a number
function parseCountText(text) {
  if (!text) return 0;
  const clean = text.trim().replace(/,/g, '');
  const mMatch = clean.match(/^([\d.]+)[Mm]$/);
  if (mMatch) return Math.round(parseFloat(mMatch[1]) * 1000000);
  const kMatch = clean.match(/^([\d.]+)[Kk]$/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
  return parseInt(clean) || 0;
}

// Helper: decode unicode escapes like \u00e9 in strings
function decodeUnicodeEscapes(str) {
  if (!str) return str;
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}
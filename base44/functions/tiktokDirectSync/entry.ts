import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function refreshToken(base44, user) {
  const clientId = Deno.env.get('TIKTOK_CLIENT_ID');
  const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET');

  if (!user.tiktok_refresh_token) {
    throw new Error('No refresh token available');
  }

  const res = await fetch('https://open.tiktokapis.com/v1/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token&refresh_token=${user.tiktok_refresh_token}`,
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to refresh token');

  await base44.auth.updateMe({
    tiktok_access_token: data.access_token,
    tiktok_refresh_token: data.refresh_token,
    tiktok_token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  });

  return data.access_token;
}

async function getAccessToken(base44, user) {
  if (!user.tiktok_access_token) throw new Error('Not connected to TikTok');
  if (new Date(user.tiktok_token_expires_at) > new Date()) return user.tiktok_access_token;
  return refreshToken(base44, user);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = await getAccessToken(base44, user);

    // Fetch user profile
    const profileRes = await fetch('https://open.tiktokapis.com/v1/user/info/?fields=open_id,avatar_url,display_name,bio_description,follower_count,following_count,likes_count,video_count', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profileData = await profileRes.json();
    if (!profileData.data) throw new Error('Failed to fetch profile');

    // Fetch videos
    const videosRes = await fetch(`https://open.tiktokapis.com/v1/video/list/?fields=id,create_time,title,description,duration,cover_image_url,share_url,embed_html`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const videosData = await videosRes.json();

    // Update or create TikTok videos
    if (videosData.data && videosData.data.videos) {
      for (const video of videosData.data.videos) {
        const existing = await base44.entities.TikTokVideo.filter({
          created_by: user.email,
          tiktok_video_id: video.id,
        });

        if (existing.length > 0) {
          await base44.entities.TikTokVideo.update(existing[0].id, {
            title: video.title,
            video_description: video.description,
            last_seen_at: new Date().toISOString(),
          });
        } else {
          await base44.entities.TikTokVideo.create({
            tiktok_video_id: video.id,
            title: video.title,
            video_description: video.description,
            create_time: video.create_time,
            duration: video.duration,
            cover_image_url: video.cover_image_url,
            share_url: video.share_url,
            embed_html: video.embed_html,
            last_seen_at: new Date().toISOString(),
          });
        }
      }
    }

    // Update creator profile
    const profiles = await base44.entities.CreatorProfile.filter({ created_by: user.email });
    if (profiles.length > 0) {
      await base44.entities.CreatorProfile.update(profiles[0].id, {
        follower_count: profileData.data.follower_count,
        tiktok_handle: profileData.data.display_name,
        avatar_url: profileData.data.avatar_url,
        bio: profileData.data.bio_description,
        tiktok_profile_last_synced_at: new Date().toISOString(),
      });
    }

    return Response.json({ success: true, profile: profileData.data, videos_count: videosData.data?.videos?.length || 0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Verifies promo impact by matching PromoKit records against actual TikTok videos.
 * Returns sessions with confirmed promo videos (matched by caption/content).
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { session_ids } = body;

  if (!session_ids || session_ids.length === 0) {
    return Response.json({ verified_promos: {}, error: 'No sessions provided' }, { status: 400 });
  }

  // Fetch all PromoKit records for these sessions
  const promos = await base44.asServiceRole.entities.PromoKit.filter({
    scheduled_stream_id: { $in: session_ids },
  });

  // Fetch TikTok videos
  const videos = await base44.asServiceRole.entities.TikTokVideo.filter({
    created_by: user.email,
  }, '-create_time', 100);

  if (!videos || videos.length === 0) {
    return Response.json({ verified_promos: {}, message: 'No TikTok videos found' });
  }

  // Match promos to videos by caption/description similarity
  const verified_promos = {};

  promos.forEach(promo => {
    if (!promo.scheduled_stream_id) return;

    // Try to match this promo's content with videos from around the same date
    const promoDate = promo.stream_date ? new Date(promo.stream_date) : null;
    const window = 3 * 24 * 60 * 60 * 1000; // 3 day window before stream

    const matchedVideos = videos.filter(v => {
      if (!promoDate) return false;

      const videoTime = new Date(v.create_time * 1000);
      const timeDiff = promoDate.getTime() - videoTime.getTime();

      // Video should be posted within 3 days before the stream
      if (timeDiff < 0 || timeDiff > window) return false;

      // Check if promo content matches video description
      const videoDesc = (v.video_description || '').toLowerCase();
      const hashtags = promo.hashtags?.join(' ').toLowerCase() || '';
      const caption = (promo.caption || '').toLowerCase();
      const hook = (promo.hook || '').toLowerCase();

      // Match if video contains multiple keywords from promo
      const allPromoText = `${hashtags} ${caption} ${hook}`.split(/\s+/).filter(w => w.length > 2);
      const matchCount = allPromoText.filter(word => videoDesc.includes(word)).length;

      return matchCount >= 2; // Need at least 2 matching keywords
    });

    if (matchedVideos.length > 0) {
      verified_promos[promo.scheduled_stream_id] = {
        verified: true,
        matched_videos: matchedVideos.map(v => ({ id: v.id, url: v.share_url, created_at: new Date(v.create_time * 1000).toISOString() })),
      };
    } else {
      verified_promos[promo.scheduled_stream_id] = {
        verified: false,
        matched_videos: [],
      };
    }
  });

  return Response.json({ verified_promos });
});
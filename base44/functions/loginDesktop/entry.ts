import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Desktop App Login
 *
 * POST /api/loginDesktop
 * Body: { email, password }
 *
 * Authenticates the user via Base44's email/password auth.
 * Returns a session token + user profile in the desktop app's expected format.
 */
Deno.serve(async (req) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ message: 'Missing email or password' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const { access_token, user } = await base44.auth.loginViaEmailPassword(email, password);

    // Fetch creator profile for enriched user data
    let profile = null;
    try {
      const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email });
      profile = profiles[0] || null;
    } catch (_) { /* no profile yet */ }

    // Fetch session stats
    let totalStreams = 0;
    let totalWatchHours = 0;
    try {
      const sessions = await base44.asServiceRole.entities.LiveSession.filter({ owner_email: user.email }, '-stream_date', 500);
      totalStreams = sessions.length;
      totalWatchHours = Math.round(sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60 * 10) / 10;
    } catch (_) { /* no sessions */ }

    // Determine badges
    const badges = [];
    if (profile?.beta_access) badges.push("founding_creator");

    // Determine tier
    const tier = "starter";

    return Response.json({
      token: access_token,
      user: {
        id: user.id,
        email: user.email,
        username: profile?.tiktok_handle || user.email.split("@")[0],
        displayName: profile?.display_name || user.full_name || "",
        avatarUrl: profile?.avatar_url || "",
        followers: profile?.follower_count || 0,
        avgViewers: profile?.avg_viewers || 0,
        totalStreams,
        totalWatchHours,
        joinedAt: user.created_date || "",
        badges,
        tier,
      },
    });
  } catch (error) {
    return Response.json({ message: 'Invalid credentials' }, { status: 401 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN_TTL = 30 * 60;
const ERROR = (code, msg, status) => ({ error: msg, code, status });

async function signToken(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyToken(token, email) {
  try {
    const decoded = atob(token);
    const parts = decoded.split(':');
    if (parts.length !== 4) return { valid: false };
    
    const [userId, timestamp, expiresAt, signature] = parts;
    const now = Math.floor(Date.now() / 1000);
    if (now > parseInt(expiresAt)) return { valid: false };
    
    const expectedSig = await signToken(`${userId}:${timestamp}:${expiresAt}`, email);
    return { valid: signature === expectedSig, userId };
  } catch {
    return { valid: false };
  }
}

function validateDate(date) {
  if (!date) return { valid: false, error: "date required" };
  const d = new Date(date);
  if (isNaN(d.getTime())) return { valid: false, error: "invalid date" };
  if (d > new Date()) return { valid: false, error: "date cannot be future" };
  const age = (new Date() - d) / (1000 * 60 * 60 * 24);
  if (age > 365) return { valid: false, error: "date too old (>365 days)" };
  return { valid: true };
}

function validateNumber(val, name, min = 0) {
  if (val === null || val === undefined) return { valid: true };
  const n = Number(val);
  if (isNaN(n) || n < min) return { valid: false, error: `${name} must be >= ${min}` };
  return { valid: true };
}

function generateDedupeKey(session) {
  if (session.platform_session_id) return session.platform_session_id;
  const cat = session.content_category || session.stream_title || "unknown";
  const type = session.session_type || "unknown";
  return `${session.date}|${cat}|${type}`;
}

function shouldUpdate(existing, incoming) {
  const eVer = (existing.source_version || "0.0.0").split(".").map(x => parseInt(x) || 0);
  const iVer = (incoming.source_version || "0.0.0").split(".").map(x => parseInt(x) || 0);
  for (let i = 0; i < 3; i++) {
    if (iVer[i] > eVer[i]) return true;
    if (iVer[i] < eVer[i]) return false;
  }
  return false;
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function normalizeSession(sess, email) {
  const d = new Date(sess.date);
  return {
    created_by: email,
    game: sess.content_category || sess.stream_title || "",
    stream_type: sess.session_type || "ranked",
    stream_date: sess.date,
    start_time: sess.start_time || "",
    end_time: sess.end_time || "",
    duration_minutes: sess.duration_minutes || null,
    avg_viewers: sess.avg_viewers || null,
    peak_viewers: sess.peak_viewers || null,
    followers_gained: sess.followers_gained || 0,
    comments: sess.comments || 0,
    shares: sess.shares || 0,
    gifters: sess.gifters || 0,
    diamonds: sess.diamonds || 0,
    fan_club_joins: sess.fan_club_joins || 0,
    notes: sess.notes || "",
    source: "extension_import",
    source_confidence: "high",
    source_version: sess.source_version || "1.0.0",
    imported_at: new Date().toISOString(),
    raw_import_reference: sess.platform_session_id || null,
    week_number: getISOWeek(d),
    year: d.getFullYear(),
  };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: "Method not allowed" }, { status: 405 });

  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    if (!payload.token) return Response.json(ERROR('MISSING_FIELD', 'token required', 400), { status: 400 });

    const user = await base44.auth.me();
    if (!user) return Response.json(ERROR('AUTH_FAILED', 'Authentication failed', 401), { status: 401 });

    const validation = await verifyToken(payload.token, user.email);
    if (!validation.valid) return Response.json(ERROR('INVALID_TOKEN', 'Token invalid', 401), { status: 401 });

    // Parse sessions
    let sessions = [];
    if (payload.session) sessions = [payload.session];
    else if (Array.isArray(payload.sessions)) sessions = payload.sessions;
    else return Response.json(ERROR('INVALID_PAYLOAD', 'Need session or sessions array', 400), { status: 400 });

    if (sessions.length === 0 || sessions.length > 100) {
      return Response.json(ERROR('INVALID_PAYLOAD', 'Need 1-100 sessions', 400), { status: 400 });
    }

    // Validate each session
    const validated = [];
    const results = [];
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const dateCheck = validateDate(s.date);
      if (!dateCheck.valid) {
        results.push({ index: i, status: 'failed', error: dateCheck.error });
        continue;
      }
      
      const viewerCheck = validateNumber(s.avg_viewers, 'avg_viewers');
      const peakCheck = validateNumber(s.peak_viewers, 'peak_viewers');
      const followerCheck = validateNumber(s.followers_gained, 'followers_gained');
      const commentCheck = validateNumber(s.comments, 'comments');
      const shareCheck = validateNumber(s.shares, 'shares');
      const gifterCheck = validateNumber(s.gifters, 'gifters');
      const diamondCheck = validateNumber(s.diamonds, 'diamonds');
      const fcCheck = validateNumber(s.fan_club_joins, 'fan_club_joins');
      
      if (!viewerCheck.valid || !peakCheck.valid || !followerCheck.valid || !commentCheck.valid ||
          !shareCheck.valid || !gifterCheck.valid || !diamondCheck.valid || !fcCheck.valid) {
        results.push({ index: i, status: 'failed', error: "field validation failed" });
        continue;
      }
      
      validated.push({ ...s, _index: i });
    }

    // Load existing sessions for dedup
    const existing = await base44.asServiceRole.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 500);
    const dedupeMap = {};
    existing.forEach(s => {
      dedupeMap[generateDedupeKey(s)] = s;
    });

    // Process validated sessions
    let created = 0, updated = 0, skipped = 0;
    const processed = [];

    for (const sess of validated) {
      const key = generateDedupeKey(sess);
      const existing_sess = dedupeMap[key];

      if (existing_sess && !shouldUpdate(existing_sess, sess)) {
        skipped++;
        results.push({ index: sess._index, status: 'skipped', session_id: existing_sess.id });
      } else if (existing_sess) {
        const normalized = normalizeSession(sess, user.email);
        await base44.asServiceRole.entities.LiveSession.update(existing_sess.id, normalized);
        processed.push(existing_sess.id);
        updated++;
        results.push({ index: sess._index, status: 'updated', session_id: existing_sess.id });
      } else {
        const normalized = normalizeSession(sess, user.email);
        const created_sess = await base44.asServiceRole.entities.LiveSession.create(normalized);
        processed.push(created_sess.id);
        dedupeMap[key] = created_sess;
        created++;
        results.push({ index: sess._index, status: 'created', session_id: created_sess.id });
      }
    }

    // Update profile aggregates
    let profile_updated = false;
    try {
      if (processed.length > 0) {
        const all_sessions = await base44.asServiceRole.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 500);
        const total_followers = all_sessions.reduce((sum, s) => sum + (s.followers_gained || 0), 0);
        const avg_viewers = all_sessions.length > 0 ? all_sessions.reduce((sum, s) => sum + (s.avg_viewers || 0), 0) / all_sessions.length : 0;
        
        const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({ created_by: user.email });
        if (profiles[0]) {
          await base44.asServiceRole.entities.CreatorProfile.update(profiles[0].id, {
            follower_count: total_followers,
            avg_viewers: Math.round(avg_viewers),
          });
          profile_updated = true;
        }
      }
    } catch (e) {
      console.warn("Failed to update profile:", e.message);
    }

    const failed = results.filter(r => r.status === 'failed').length;
    const response = { created, updated, skipped, failed, profile_updated };
    
    if (failed > 0) {
      response.results = results.filter(r => r.status === 'failed');
    }

    return Response.json(response);
  } catch (error) {
    console.error(error);
    return Response.json(ERROR('INTERNAL_ERROR', error.message, 500), { status: 500 });
  }
});
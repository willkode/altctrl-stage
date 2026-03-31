import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import { Link } from "react-router-dom";
import { Users, MessageCircle, Share2, Gift, Star, TrendingUp } from "lucide-react";

function safe(v) { return v === null || v === undefined ? null : Number(v); }
function fmt(v, decimals = 1) { if (v === null || v === undefined || isNaN(v)) return "—"; return Number(v).toFixed(decimals).replace(/\.0$/, ""); }

function MetricCard({ icon: Icon, label, value, sub, accent = "cyan" }) {
  const colors = { cyan: "text-cyan-400 border-cyan-900/40", pink: "text-pink-400 border-pink-900/40", yellow: "text-yellow-400 border-yellow-900/40", green: "text-green-400 border-green-900/40" };
  return (
    <div className={`bg-[#060d1f] border ${colors[accent]} rounded-xl p-4`}>
      <div className={`flex items-center gap-2 ${colors[accent].split(" ")[0]} mb-2`}>
        <Icon className="w-4 h-4" /> <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      {sub && <div className="text-[10px] font-mono text-slate-600 mt-1">{sub}</div>}
    </div>
  );
}

function RatioCard({ label, value, sub }) {
  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">{label}</div>
      <div className="text-xl font-black text-white">{value}</div>
      {sub && <div className="text-[9px] font-mono text-slate-700 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AudienceMonetization() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const user = await base44.auth.me();
    const [sess, snaps] = await Promise.all([
      base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 50),
      base44.entities.TikTokProfileSnapshot.filter({ created_by: user.email }, "-captured_at", 10),
    ]);
    setSessions(sess);
    setSnapshots(snaps);
    setLoading(false);
  }

  if (loading) return <PageContainer><LoadingState message="Loading audience data..." /></PageContainer>;

  if (sessions.length === 0) {
    return (
      <PageContainer>
        <div className="mb-6">
          <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-1">// AUDIENCE_MONETIZATION</div>
          <h1 className="text-2xl font-black uppercase text-white">Audience & Monetization</h1>
        </div>
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-10 text-center">
          <p className="text-slate-500 font-mono text-sm mb-3">No session data yet.</p>
          <Link to="/app/debrief" className="text-xs font-mono uppercase tracking-widest text-yellow-400 hover:text-yellow-300">→ Log your first debrief</Link>
        </div>
      </PageContainer>
    );
  }

  // Aggregates
  const withViewers = sessions.filter(s => safe(s.avg_viewers) !== null);
  const withFollowers = sessions.filter(s => safe(s.followers_gained) !== null);
  const withGifters = sessions.filter(s => safe(s.gifters) !== null);
  const withDiamonds = sessions.filter(s => safe(s.diamonds) !== null);
  const withFanClub = sessions.filter(s => safe(s.fan_club_joins) !== null);
  const withComments = sessions.filter(s => safe(s.comments) !== null);
  const withShares = sessions.filter(s => safe(s.shares) !== null);

  const sum = (arr, field) => arr.reduce((acc, s) => acc + (safe(s[field]) || 0), 0);
  const avg = (arr, field) => arr.length ? sum(arr, field) / arr.length : null;

  const totalFollowers = sum(withFollowers, "followers_gained");
  const totalGifters = sum(withGifters, "gifters");
  const totalDiamonds = sum(withDiamonds, "diamonds");
  const totalFanClub = sum(withFanClub, "fan_club_joins");
  const avgViewers = avg(withViewers, "avg_viewers");
  const avgFollowersPerSession = withFollowers.length ? totalFollowers / withFollowers.length : null;
  const avgGiftersPerSession = withGifters.length ? totalGifters / withGifters.length : null;
  const avgDiamondsPerSession = withDiamonds.length ? totalDiamonds / withDiamonds.length : null;
  const followersPerViewer = avgViewers && avgFollowersPerSession ? (avgFollowersPerSession / avgViewers) * 100 : null;
  const gifterRate = avgViewers && avgGiftersPerSession ? (avgGiftersPerSession / avgViewers) * 100 : null;

  // Latest snapshot
  const latestSnap = snapshots[0];

  // Per-session table (last 10)
  const recentSessions = [...sessions].slice(0, 10);

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-1">// AUDIENCE_MONETIZATION</div>
        <h1 className="text-2xl font-black uppercase text-white">Audience & Monetization</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">Audience quality, not just view counts.</p>
      </div>

      {/* TikTok account context */}
      {latestSnap && (
        <div className="bg-[#060d1f] border border-cyan-500/20 rounded-xl p-4 mb-5 flex items-center gap-4 flex-wrap">
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">TikTok Account</div>
          <div className="flex gap-4 flex-wrap">
            {latestSnap.follower_count && <span className="text-sm font-black text-white">{latestSnap.follower_count.toLocaleString()} <span className="text-slate-600 text-xs font-mono">followers</span></span>}
            {latestSnap.likes_count && <span className="text-sm font-black text-white">{latestSnap.likes_count.toLocaleString()} <span className="text-slate-600 text-xs font-mono">total likes</span></span>}
            {latestSnap.video_count && <span className="text-sm font-black text-white">{latestSnap.video_count} <span className="text-slate-600 text-xs font-mono">videos</span></span>}
          </div>
          <span className="text-[9px] font-mono text-slate-700 ml-auto">via TikTok · {latestSnap.captured_at?.split("T")[0]}</span>
        </div>
      )}

      {/* Aggregate cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <MetricCard icon={Users} label="Followers Gained" value={totalFollowers.toLocaleString()} sub={`${withFollowers.length} sessions tracked`} accent="cyan" />
        <MetricCard icon={Gift} label="Total Gifters" value={totalGifters.toLocaleString()} sub={`${withGifters.length} sessions tracked`} accent="pink" />
        <MetricCard icon={TrendingUp} label="Total Diamonds" value={totalDiamonds.toLocaleString()} sub={`~${fmt(totalDiamonds / 200)} USD est.`} accent="yellow" />
        <MetricCard icon={Star} label="Fan Club Joins" value={totalFanClub.toLocaleString()} sub={`${withFanClub.length} sessions tracked`} accent="green" />
        <MetricCard icon={MessageCircle} label="Avg Comments" value={fmt(avg(withComments, "comments"))} sub="per session" accent="cyan" />
        <MetricCard icon={Share2} label="Avg Shares" value={fmt(avg(withShares, "shares"))} sub="per session" accent="pink" />
      </div>

      {/* Conversion ratios */}
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 mb-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-4">// Conversion Ratios</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <RatioCard label="Followers / Session" value={fmt(avgFollowersPerSession)} sub="avg followers gained per stream" />
          <RatioCard label="Gifters / Session" value={fmt(avgGiftersPerSession)} sub="avg gifters per stream" />
          <RatioCard label="Diamonds / Session" value={fmt(avgDiamondsPerSession)} sub="avg diamond value per stream" />
          <RatioCard label="Follower Rate" value={followersPerViewer !== null ? `${fmt(followersPerViewer)}%` : "—"} sub="followers gained per avg viewer" />
          <RatioCard label="Gifter Rate" value={gifterRate !== null ? `${fmt(gifterRate)}%` : "—"} sub="gifters per avg viewer" />
          <RatioCard label="Fan Club / Session" value={fmt(withFanClub.length ? totalFanClub / withFanClub.length : null)} sub="avg fan club joins per stream" />
        </div>
        <p className="text-[10px] font-mono text-slate-700 mt-4">// All metrics are from manual debrief — not available via TikTok public API</p>
      </div>

      {/* Per-session breakdown */}
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-4">// Per-Session Breakdown (Last 10)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-slate-700 border-b border-cyan-900/20 text-left">
                <th className="pb-2 pr-3">Date</th>
                <th className="pb-2 pr-3">Game</th>
                <th className="pb-2 pr-3">Followers</th>
                <th className="pb-2 pr-3">Gifters</th>
                <th className="pb-2 pr-3">Diamonds</th>
                <th className="pb-2 pr-3">Fan Club</th>
                <th className="pb-2 pr-3">Comments</th>
                <th className="pb-2">Shares</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map(s => (
                <tr key={s.id} className="border-b border-cyan-900/10 hover:bg-cyan-500/2 transition-colors">
                  <td className="py-2 pr-3 text-slate-500">{s.stream_date}</td>
                  <td className="py-2 pr-3 text-white font-bold">{s.game}</td>
                  <td className="py-2 pr-3 text-cyan-400">{safe(s.followers_gained) !== null ? s.followers_gained : "—"}</td>
                  <td className="py-2 pr-3 text-pink-400">{safe(s.gifters) !== null ? s.gifters : "—"}</td>
                  <td className="py-2 pr-3 text-yellow-400">{safe(s.diamonds) !== null ? s.diamonds : "—"}</td>
                  <td className="py-2 pr-3 text-green-400">{safe(s.fan_club_joins) !== null ? s.fan_club_joins : "—"}</td>
                  <td className="py-2 pr-3 text-slate-400">{safe(s.comments) !== null ? s.comments : "—"}</td>
                  <td className="py-2 text-slate-400">{safe(s.shares) !== null ? s.shares : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
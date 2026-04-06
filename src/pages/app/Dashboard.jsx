import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import HeroWelcome from "../../components/app/dashboard/HeroWelcome";
import QuickStatsRow from "../../components/app/dashboard/QuickStatsRow";
import TodayStreamCard from "../../components/app/dashboard/TodayStreamCard";
import RecentSessions from "../../components/app/dashboard/RecentSessions";
import StreamDrawer from "../../components/app/drawers/StreamDrawer";
import LogSessionDrawer from "../../components/app/drawers/LogSessionDrawer";
import SummaryStats from "../../components/app/analytics/SummaryStats";
import PerformanceChart from "../../components/app/analytics/PerformanceChart";
import TikTokVideoStats from "../../components/app/analytics/TikTokVideoStats";
import { Zap, CheckSquare, Sparkles } from "lucide-react";

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

const TODAY_STR = new Date().toISOString().split("T")[0];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [todayStream, setTodayStream] = useState(null);
  const [weekStreams, setWeekStreams] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [drawer, setDrawer] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const user = await base44.auth.me();
    const now = new Date();
    const week = getISOWeek(now);
    const year = now.getFullYear();

    const [profiles, streams, sessions] = await Promise.all([
      base44.entities.CreatorProfile.filter({ created_by: user.email }),
      base44.entities.ScheduledStream.filter({ created_by: user.email }),
      base44.entities.LiveSession.filter({ owner_email: user.email }, "-stream_date", 100),
    ]);

    setProfile(profiles[0] || null);
    setTodayStream(streams.find(s => s.scheduled_date === TODAY_STR) || null);
    setWeekStreams(streams.filter(s => {
      const d = new Date(s.scheduled_date);
      return getISOWeek(d) === week && d.getFullYear() === year;
    }));
    setRecentSessions(sessions);
    setLoading(false);
  }



  if (loading) return <div className="pt-20"><LoadingState message="Loading command center..." /></div>;

  // Get last 7 days of sessions
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const last7Sessions = recentSessions.filter(s => new Date(s.stream_date) >= sevenDaysAgo);

  // Get most recent session
  const mostRecentSession = recentSessions[0] || null;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Welcome Hero */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/60 mb-1">Creator Command Center</p>
          <h1 className="text-3xl font-black uppercase text-white mb-2">Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}</h1>
          <p className="text-sm text-slate-400">Track your growth, optimize your streams, and hit your goals.</p>
        </div>

        {/* Today's Stream with Quick Actions */}
        {todayStream ? (
          <div className="bg-[#060d1f] border border-cyan-500/30 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-1">TODAY'S STREAM</p>
                <h3 className="text-lg font-black text-white">{todayStream.title || todayStream.game}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{todayStream.start_time} · {todayStream.stream_type}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to="/app/schedule" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase hover:bg-cyan-500/15 transition-all">
                <CheckSquare className="w-3.5 h-3.5" /> Pre-Stream Checklist
              </Link>
              <Link to="/app/promo" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-mono uppercase hover:bg-pink-500/15 transition-all">
                <Sparkles className="w-3.5 h-3.5" /> Generate Promo
              </Link>
              <Link to="/app/strategy" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono uppercase hover:bg-yellow-500/15 transition-all">
                <Zap className="w-3.5 h-3.5" /> Stream Strategy
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#060d1f] border border-slate-900 rounded-xl p-6 text-center">
            <p className="text-sm text-slate-500 mb-3">No stream scheduled for today</p>
            <Link to="/app/schedule" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase hover:bg-cyan-500/15 transition-all">
              Schedule a Stream
            </Link>
          </div>
        )}

        {/* Most Recent Stream Status */}
        {mostRecentSession && (
          <div className="bg-[#060d1f] border border-yellow-900/20 rounded-xl p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 mb-3">LATEST STREAM</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[9px] font-mono text-slate-600 mb-1">Game</p>
                <p className="text-sm font-bold text-white">{mostRecentSession.game}</p>
              </div>
              <div>
                <p className="text-[9px] font-mono text-slate-600 mb-1">Viewers</p>
                <p className="text-sm font-bold text-cyan-400">{mostRecentSession.avg_viewers ?? 0} avg</p>
              </div>
              <div>
                <p className="text-[9px] font-mono text-slate-600 mb-1">Duration</p>
                <p className="text-sm font-bold text-white">{mostRecentSession.duration_minutes || 0}m</p>
              </div>
              <div>
                <p className="text-[9px] font-mono text-slate-600 mb-1">Followers</p>
                <p className="text-sm font-bold text-pink-400">+{mostRecentSession.followers_gained || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* 7-Day Analytics */}
        <div className="space-y-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">// 7-Day Overview</p>
          <SummaryStats sessions={last7Sessions} />
          {last7Sessions.length > 0 && (
            <>
              <PerformanceChart sessions={last7Sessions} />
              <TikTokVideoStats />
            </>
          )}
        </div>

        {/* Recent sessions table */}
        <RecentSessions sessions={recentSessions.slice(0, 10)} />
      </div>

      {/* Drawers */}
      <StreamDrawer open={drawer === "stream"} onClose={() => setDrawer(null)} onSaved={loadAll} />
      <LogSessionDrawer
        open={drawer === "session"}
        onClose={() => setDrawer(null)}
        session={todayStream ? { game: todayStream.game, stream_type: todayStream.stream_type, stream_date: TODAY_STR, scheduled_stream_id: todayStream.id } : null}
        onSaved={loadAll}
      />
    </PageContainer>
  );
}
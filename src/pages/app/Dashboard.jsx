import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import { loadAllSessions } from "../../utils/sessionLoader";
import RecentSessions from "../../components/app/dashboard/RecentSessions";
import StreamDrawer from "../../components/app/drawers/StreamDrawer";
import LogSessionDrawer from "../../components/app/drawers/LogSessionDrawer";
import SummaryStats from "../../components/app/analytics/SummaryStats";
import StrategySection from "../../components/app/dashboard/StrategySection";
import AnalyticsTab from "../../components/app/dashboard/AnalyticsTab";
import SessionsTab from "../../components/app/dashboard/SessionsTab";
import AudienceTab from "../../components/app/dashboard/AudienceTab";
import GameIntelTab from "../../components/app/dashboard/GameIntelTab";
import { Zap, CheckSquare, Sparkles, LayoutDashboard, TrendingUp, List, Users, Swords } from "lucide-react";
import { getISOWeek, getTodayStr } from "../../utils/dateHelpers";

const TODAY_STR = getTodayStr();

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "analytics", label: "Analytics", icon: TrendingUp },
  { key: "sessions", label: "Sessions", icon: List },
  { key: "audience", label: "Audience", icon: Users },
  { key: "gameintel", label: "Game Intel", icon: Swords },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [todayStream, setTodayStream] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const user = await base44.auth.me();
    const now = new Date();

    const [profiles, streams, allSessions] = await Promise.all([
      base44.entities.CreatorProfile.filter({ created_by: user.email }),
      base44.entities.ScheduledStream.filter({ created_by: user.email }),
      loadAllSessions(100),
    ]);

    setProfile(profiles[0] || null);
    setTodayStream(streams.find(s => s.scheduled_date === TODAY_STR) || null);
    setRecentSessions(allSessions);
    setLoading(false);
  }

  if (loading) return <div className="pt-20"><LoadingState message="Loading command center..." /></div>;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const last7Sessions = recentSessions.filter(s => new Date(s.stream_date) >= sevenDaysAgo);
  const mostRecentSession = recentSessions[0] || null;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Desktop App Download Banner */}
        <div className="bg-red-500/5 border-2 border-red-500/60 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-red-400 text-lg">🖥️</span>
            <div>
              <p className="text-sm font-bold text-white">⚠️ Desktop App Required</p>
              <p className="text-xs font-mono text-slate-400">You must download and install the AltCtrl Desktop App to use live coaching, auto-sync, and stream alerts.</p>
            </div>
          </div>
          <a href="https://drive.google.com/file/d/1a0vmkRfL_oS0ZlSol2ivizuXsP4hpPIO/view?usp=sharing" target="_blank" rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-400 transition-all">
            Download Now
          </a>
        </div>

        {/* Header */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/60 mb-1">Creator Command Center</p>
          <h1 className="text-3xl font-black uppercase text-white mb-2">
            Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-cyan-900/30 pb-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 transition-all -mb-px ${
                activeTab === key
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Today's Stream */}
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

            {/* Most Recent Stream */}
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

            {/* Performance Overview */}
            <div className="space-y-5">
              <SummaryStats sessions={recentSessions} />
            </div>

            {/* Strategy */}
            <StrategySection />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && <AnalyticsTab />}

        {/* Sessions Tab */}
        {activeTab === "sessions" && <SessionsTab />}

        {/* Audience Tab */}
        {activeTab === "audience" && <AudienceTab />}

        {/* Game Intel Tab */}
        {activeTab === "gameintel" && <GameIntelTab />}
      </div>

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
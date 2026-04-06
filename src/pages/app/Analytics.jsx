import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import LogSessionDrawer from "../../components/app/drawers/LogSessionDrawer";
import SummaryStats from "../../components/app/analytics/SummaryStats";
import PerformanceChart from "../../components/app/analytics/PerformanceChart";
import GameBreakdown from "../../components/app/analytics/GameBreakdown";
import TimeHeatmap from "../../components/app/analytics/TimeHeatmap";
import PromoImpact from "../../components/app/analytics/PromoImpact";
import SessionHistory from "../../components/app/analytics/SessionHistory";
import TopFollowersStats from "../../components/app/analytics/TopFollowersStats";
import DataProgressBanner from "../../components/app/DataProgressBanner";
import EngagementTriggersAnalysis from "../../components/app/analytics/EngagementTriggersAnalysis";
import TikTokAccountStats from "../../components/app/analytics/TikTokAccountStats";
import TikTokVideoStats from "../../components/app/analytics/TikTokVideoStats";
import { Plus, X, SlidersHorizontal } from "lucide-react";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [logOpen, setLogOpen] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ startDate: null, endDate: null, game: null, streamType: null, source: null });
  const [allGames, setAllGames] = useState([]);
  const [allStreamTypes, setAllStreamTypes] = useState([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const [liveSessions, desktopSessions] = await Promise.all([
      base44.entities.LiveSession.filter({ owner_email: user.email }, "-stream_date", 200),
      base44.entities.DesktopSession.filter({ user_id: user.email }, "-started_at", 200),
    ]);

    // Normalize desktop sessions to the same shape as LiveSession
    const normalizedDesktop = desktopSessions.map(d => ({
      id: d.id,
      stream_date: d.started_at ? d.started_at.split('T')[0] : null,
      game: d.game || "",
      stream_type: null,
      avg_viewers: d.avg_viewers ?? 0,
      peak_viewers: d.peak_viewers ?? 0,
      duration_minutes: d.duration_min ?? 0,
      followers_gained: d.total_follows ?? 0,
      comments: d.unique_chatters ?? 0,
      gifters: d.unique_gifters ?? 0,
      diamonds: d.total_diamonds ?? 0,
      shares: d.total_shares ?? 0,
      promo_posted: false,
      energy_level: null,
      source: "desktop_sync",
      title: d.title || "",
      _desktop: true,
    }));

    const all = [...liveSessions, ...normalizedDesktop].sort((a, b) =>
      (b.stream_date || "").localeCompare(a.stream_date || "")
    );

    setSessions(all);
    setAllGames([...new Set(all.map(s => s.game).filter(Boolean))].sort());
    setAllStreamTypes([...new Set(all.map(s => s.stream_type).filter(Boolean))].sort());
    setLoading(false);
  }

  const filtered = sessions.filter(s => {
    if (filters.startDate && new Date(s.stream_date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(s.stream_date) > new Date(filters.endDate)) return false;
    if (filters.game && s.game !== filters.game) return false;
    if (filters.streamType && s.stream_type !== filters.streamType) return false;
    if (filters.source && s.source !== filters.source) return false;
    return true;
  });

  const hasFilters = Object.values(filters).some(v => v !== null);
  const clearFilters = () => setFilters({ startDate: null, endDate: null, game: null, streamType: null, source: null });

  const inp = "w-full bg-[#02040f] border border-cyan-900/20 focus:border-cyan-500/20 text-white rounded-lg px-3 py-2 text-xs font-mono outline-none transition-all";

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/60 mb-1">Performance</p>
          <h1 className="text-2xl font-black uppercase text-white">Analytics</h1>
        </div>
        <div className="flex gap-2">
          {sessions.length > 0 && (
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-2.5 rounded-lg border transition-all ${
                showFilters || hasFilters ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "border-cyan-900/20 text-slate-500 hover:text-cyan-400"
              }`}>
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters{hasFilters ? " ·" : ""}
            </button>
          )}
          <button onClick={() => setLogOpen(true)}
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15 transition-all shrink-0">
            <Plus className="w-3.5 h-3.5" /> Log
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && sessions.length > 0 && (
        <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-4 mb-5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="text-[9px] font-mono uppercase text-slate-700 mb-1 block">From</label>
              <input type="date" value={filters.startDate || ""} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value || null }))} className={inp} />
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase text-slate-700 mb-1 block">To</label>
              <input type="date" value={filters.endDate || ""} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value || null }))} className={inp} />
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase text-slate-700 mb-1 block">Game</label>
              <select value={filters.game || ""} onChange={e => setFilters(f => ({ ...f, game: e.target.value || null }))} className={inp}>
                <option value="">All</option>
                {allGames.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase text-slate-700 mb-1 block">Type</label>
              <select value={filters.streamType || ""} onChange={e => setFilters(f => ({ ...f, streamType: e.target.value || null }))} className={inp}>
                <option value="">All</option>
                {allStreamTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase text-slate-700 mb-1 block">Source</label>
              <select value={filters.source || ""} onChange={e => setFilters(f => ({ ...f, source: e.target.value || null }))} className={inp}>
                <option value="">All</option>
                <option value="manual">Manual</option>
                <option value="extension_import">Extension</option>
                <option value="hybrid">Hybrid</option>
                <option value="desktop_sync">Desktop Sync</option>
              </select>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 flex items-center gap-1 text-[9px] font-mono uppercase text-slate-600 hover:text-cyan-400 transition-colors">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading performance data..." />
      ) : sessions.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-8 text-center">
            <p className="text-sm font-bold text-slate-400 mb-1">No sessions logged yet</p>
            <p className="text-xs font-mono text-slate-600 mb-4">Log your first stream to unlock analytics.</p>
            <button onClick={() => setLogOpen(true)}
              className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-5 py-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15 transition-all">
              <Plus className="w-3.5 h-3.5" /> Log First Session
            </button>
          </div>
          <TikTokAccountStats />
          <TikTokVideoStats />
        </div>
      ) : sessions.length < 3 ? (
        <div className="space-y-6">
          <TikTokAccountStats />
          <DataProgressBanner current={sessions.length} required={3} featureName="Full Analytics"
            hint={`${sessions.length} session${sessions.length > 1 ? "s" : ""} logged. ${3 - sessions.length} more to unlock charts and breakdowns.`}
            actionLabel="Log a session" actionLink="/app/analytics" />
          <SessionHistory sessions={sessions} onLogSession={() => setLogOpen(true)} onRefresh={loadData} onEditSession={s => setEditSession(s)} />
          <TikTokVideoStats />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-12 text-center">
          <p className="text-sm font-bold text-slate-400 mb-2">No sessions match filters</p>
          <button onClick={clearFilters} className="text-xs font-mono uppercase text-cyan-400 hover:text-cyan-300 transition-colors">Clear Filters</button>
        </div>
      ) : (
        <div className="space-y-6">
          <TikTokAccountStats />
          <SummaryStats sessions={filtered} />
          <PerformanceChart sessions={filtered} />
          <div className="grid md:grid-cols-2 gap-5">
            <GameBreakdown sessions={filtered} />
            <PromoImpact sessions={filtered} />
          </div>
          <TopFollowersStats />
          <EngagementTriggersAnalysis />
          <SessionHistory sessions={filtered} onLogSession={() => setLogOpen(true)} onRefresh={loadData} onEditSession={s => setEditSession(s)} />
          <TimeHeatmap sessions={filtered} />
        </div>
      )}

      <LogSessionDrawer open={logOpen} onClose={() => setLogOpen(false)} onSaved={loadData} />
      <LogSessionDrawer open={!!editSession} onClose={() => setEditSession(null)} session={editSession} onSaved={loadData} />
    </PageContainer>
  );
}
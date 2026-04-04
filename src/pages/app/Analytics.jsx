import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import SourceBadge from "../../components/app/SourceBadge";
import LoadingState from "../../components/app/LoadingState";
import LogSessionDrawer from "../../components/app/drawers/LogSessionDrawer";
import SummaryStats from "../../components/app/analytics/SummaryStats";
import PerformanceChart from "../../components/app/analytics/PerformanceChart";
import GameBreakdown from "../../components/app/analytics/GameBreakdown";
import TimeHeatmap from "../../components/app/analytics/TimeHeatmap";
import PromoImpact from "../../components/app/analytics/PromoImpact";
import SessionHistory from "../../components/app/analytics/SessionHistory";
import { Plus, X } from "lucide-react";
import DataProgressBanner from "../../components/app/DataProgressBanner";
import TikTokAccountStats from "../../components/app/analytics/TikTokAccountStats";
import TikTokVideoStats from "../../components/app/analytics/TikTokVideoStats";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [logOpen, setLogOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    game: null,
    streamType: null,
    source: null,
  });
  const [allGames, setAllGames] = useState([]);
  const [allStreamTypes, setAllStreamTypes] = useState([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const all = await base44.entities.LiveSession.filter(
      { owner_email: user.email },
      "-stream_date",
      200
    );
    setSessions(all);
    const games = [...new Set(all.map(s => s.game).filter(Boolean))];
    const types = [...new Set(all.map(s => s.stream_type).filter(Boolean))];
    setAllGames(games.sort());
    setAllStreamTypes(types.sort());
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

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// PILLAR_04 — PERFORMANCE</div>
          <h1 className="text-2xl font-black uppercase text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-mono">Turn your session data into clear, actionable insight.</p>
        </div>
        <button
          onClick={() => setLogOpen(true)}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-4 py-2.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all shrink-0">
          <Plus className="w-3.5 h-3.5" /> Log Session
        </button>
      </div>

      {/* Filters */}
      {sessions.length > 0 && (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-600 mb-1 block">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={e => setFilters(f => ({ ...f, startDate: e.target.value || null }))}
                className="w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white rounded px-3 py-2 text-sm font-mono outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-600 mb-1 block">End Date</label>
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={e => setFilters(f => ({ ...f, endDate: e.target.value || null }))}
                className="w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white rounded px-3 py-2 text-sm font-mono outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-600 mb-1 block">Game</label>
              <select
                value={filters.game || ""}
                onChange={e => setFilters(f => ({ ...f, game: e.target.value || null }))}
                className="w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white rounded px-3 py-2 text-sm font-mono outline-none transition-all"
              >
                <option value="">All Games</option>
                {allGames.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-600 mb-1 block">Stream Type</label>
              <select
                value={filters.streamType || ""}
                onChange={e => setFilters(f => ({ ...f, streamType: e.target.value || null }))}
                className="w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white rounded px-3 py-2 text-sm font-mono outline-none transition-all"
              >
                <option value="">All Types</option>
                {allStreamTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-600 mb-1 block">Source</label>
              <select
                value={filters.source || ""}
                onChange={e => setFilters(f => ({ ...f, source: e.target.value || null }))}
                className="w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white rounded px-3 py-2 text-sm font-mono outline-none transition-all"
              >
                <option value="">All Sources</option>
                <option value="manual">Manual</option>
                <option value="extension_import">Extension</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 flex items-center gap-1.5 text-[10px] font-mono uppercase text-slate-600 hover:text-cyan-400 transition-colors"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
      )}

      {/* TikTok Account Stats + Video Stats — always shown */}
      <TikTokAccountStats />
      <div className="mt-6">
        <TikTokVideoStats />
      </div>

      {loading ? (
        <LoadingState message="Loading performance data..." />
      ) : sessions.length === 0 ? (
        <div className="mt-6 bg-[#060d1f] border border-cyan-900/30 rounded-lg p-8 text-center">
          <div className="text-sm font-black uppercase text-slate-400 mb-1">No live sessions logged yet</div>
          <p className="text-xs font-mono text-slate-600 mb-4">Log your first stream session to unlock performance analytics.</p>
          <button
            onClick={() => setLogOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-5 py-3 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Log Your First Session
          </button>
        </div>
      ) : sessions.length < 3 ? (
        <div className="mt-6">
          <DataProgressBanner
            current={sessions.length}
            required={3}
            featureName="Full Analytics"
            hint={`You've logged ${sessions.length} session${sessions.length > 1 ? 's' : ''}. Log ${3 - sessions.length} more to unlock charts, game breakdowns, and promo impact analysis.`}
            actionLabel="Log a session"
            actionLink="/app/analytics"
          />
          {/* Show session history even with minimal data */}
          <SessionHistory sessions={sessions} onLogSession={() => setLogOpen(true)} onRefresh={loadData} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-12 text-center mt-6">
          <div className="text-sm font-black uppercase text-slate-400 mb-2">No sessions match filters</div>
          <p className="text-xs font-mono text-slate-600 mb-4">Try adjusting your filters to see data.</p>
          <button
            onClick={clearFilters}
            className="text-xs font-mono uppercase text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          <SummaryStats sessions={filtered} />
          <PerformanceChart sessions={filtered} />
          <div className="grid md:grid-cols-2 gap-6">
            <GameBreakdown sessions={filtered} />
            <PromoImpact sessions={filtered} />
          </div>
          <TimeHeatmap sessions={filtered} />
          <SessionHistory sessions={filtered} onLogSession={() => setLogOpen(true)} onRefresh={loadData} />
        </div>
      )}

      <LogSessionDrawer open={logOpen} onClose={() => { setLogOpen(false); }} onSaved={loadData} />
    </PageContainer>
  );
}
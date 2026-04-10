import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import LoadingState from "../LoadingState";
import AudienceStats from "../audience/AudienceStats";
import ConversionRatios from "../audience/ConversionRatios";
import TrendCharts from "../audience/TrendCharts";
import SourceBadge from "../SourceBadge";
import { loadAllSessions } from "../../../utils/sessionLoader";
import { TrendingUp, X } from "lucide-react";

const inp = "w-full bg-[#02040f] border border-cyan-900/20 focus:border-cyan-500/20 text-white rounded-lg px-3 py-2 text-xs font-mono outline-none transition-all";

export default function AudienceTab() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [filters, setFilters] = useState({ game: null, streamType: null, source: null });
  const [games, setGames] = useState([]);
  const [types, setTypes] = useState([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const all = await loadAllSessions(200);
    setSessions(all);
    setFilteredSessions(all);
    setGames([...new Set(all.map(s => s.game).filter(Boolean))].sort());
    setTypes([...new Set(all.map(s => s.stream_type).filter(Boolean))].sort());
    setLoading(false);
  }

  useEffect(() => {
    let f = sessions;
    if (filters.game) f = f.filter(s => s.game === filters.game);
    if (filters.streamType) f = f.filter(s => s.stream_type === filters.streamType);
    if (filters.source) f = f.filter(s => s.source === filters.source);
    setFilteredSessions(f);
  }, [filters, sessions]);

  const clearFilters = () => setFilters({ game: null, streamType: null, source: null });
  const hasFilters = Object.values(filters).some(v => v !== null);

  if (loading) return <LoadingState message="Loading audience data..." />;

  if (sessions.length === 0) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-12 text-center">
        <TrendingUp className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <div className="text-sm font-black uppercase text-slate-500 mb-2">No sessions yet</div>
        <p className="text-xs font-mono text-slate-600">Log streams to track audience growth and monetization trends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-600 mb-1 block">Game</label>
            <select value={filters.game || ""} onChange={e => setFilters(f => ({ ...f, game: e.target.value || null }))} className={inp}>
              <option value="">All Games</option>
              {games.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-600 mb-1 block">Stream Type</label>
            <select value={filters.streamType || ""} onChange={e => setFilters(f => ({ ...f, streamType: e.target.value || null }))} className={inp}>
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-600 mb-1 block">Source</label>
            <select value={filters.source || ""} onChange={e => setFilters(f => ({ ...f, source: e.target.value || null }))} className={inp}>
              <option value="">All Sources</option>
              <option value="manual">Manual</option>
              <option value="extension_import">Extension</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="mt-3 flex items-center gap-1 text-[10px] font-mono uppercase text-slate-600 hover:text-cyan-400 transition-colors">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {filteredSessions.length === 0 ? (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-12 text-center">
          <div className="text-sm font-black uppercase text-slate-500 mb-2">No sessions match filters</div>
          <button onClick={clearFilters} className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors">Clear Filters</button>
        </div>
      ) : (
        <>
          <AudienceStats sessions={filteredSessions} />
          <ConversionRatios sessions={filteredSessions} />
          <TrendCharts sessions={filteredSessions} />

          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 overflow-x-auto">
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-4">// Recent Sessions Detail</div>
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-cyan-900/20">
                <tr>
                  <th className="text-left py-2 px-3 text-[9px] font-mono uppercase text-slate-600">Date</th>
                  <th className="text-left py-2 px-3 text-[9px] font-mono uppercase text-slate-600">Game</th>
                  <th className="text-right py-2 px-3 text-[9px] font-mono uppercase text-slate-600">Followers</th>
                  <th className="text-right py-2 px-3 text-[9px] font-mono uppercase text-slate-600">Gifts</th>
                  <th className="text-right py-2 px-3 text-[9px] font-mono uppercase text-slate-600">Gifters</th>
                  <th className="text-right py-2 px-3 text-[9px] font-mono uppercase text-slate-600">Comments</th>
                  <th className="text-right py-2 px-3 text-[9px] font-mono uppercase text-slate-600">Shares</th>
                  <th className="text-left py-2 px-3 text-[9px] font-mono uppercase text-slate-600">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-900/10">
                {filteredSessions.slice(0, 10).map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-xs font-mono text-slate-400">{s.stream_date}</td>
                    <td className="py-2.5 px-3 text-xs font-black text-white">{s.game}</td>
                    <td className="py-2.5 px-3 text-xs font-black text-cyan-400 text-right">{s.followers_gained ?? "—"}</td>
                    <td className="py-2.5 px-3 text-xs font-black text-pink-400 text-right">{s.diamonds ?? "—"}</td>
                    <td className="py-2.5 px-3 text-xs font-black text-yellow-400 text-right">{s.gifters ?? "—"}</td>
                    <td className="py-2.5 px-3 text-xs font-black text-slate-400 text-right">{s.comments ?? "—"}</td>
                    <td className="py-2.5 px-3 text-xs font-black text-slate-400 text-right">{s.shares ?? "—"}</td>
                    <td className="py-2.5 px-3"><SourceBadge source={s.source} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSessions.length > 10 && (
              <p className="text-xs font-mono text-slate-600 mt-3">Showing 10 of {filteredSessions.length} sessions</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
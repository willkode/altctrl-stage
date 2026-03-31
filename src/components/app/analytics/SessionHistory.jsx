import { useState } from "react";
import { ChevronUp, ChevronDown, Search, Plus } from "lucide-react";
import { filterSessions } from "../../../utils/analyticsCalc";
import AppBadge from "../AppBadge";
import EmptyState from "../EmptyState";

const ENERGY_COLOR = { low: "slate", medium: "cyan", high: "yellow" };
const SORT_KEYS = ["stream_date", "avg_viewers", "peak_viewers", "duration_minutes", "followers_gained"];

export default function SessionHistory({ sessions, onLogSession, onRefresh }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("stream_date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(0);
  };

  const { rows: paginated, total: filteredTotal, totalPages, page: safePage } = filterSessions(sessions, { query: search, sortKey, sortDir, page, pageSize: PAGE_SIZE });

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return null;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const thCls = (k) =>
    `text-left text-[9px] font-mono uppercase tracking-widest py-2 px-3 cursor-pointer select-none transition-colors ${sortKey === k ? "text-cyan-400" : "text-slate-600 hover:text-slate-400"}`;

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 flex-wrap">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex-1">// SESSION HISTORY</div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search sessions…"
            className="bg-[#02040f] border border-cyan-900/30 text-white placeholder-slate-700 rounded pl-8 pr-4 py-1.5 text-xs font-mono outline-none focus:border-cyan-500/30 transition-all w-44" />
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="No sessions logged"
            message="Start logging your streams to build your performance history."
            action={
              <button onClick={onLogSession}
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest px-4 py-2.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all">
                <Plus className="w-3.5 h-3.5" /> Log First Session
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-white/5">
                <tr className="bg-[#02040f]/50">
                  <th className={thCls("stream_date")} onClick={() => handleSort("stream_date")}>Date <SortIcon k="stream_date" /></th>
                  <th className="text-left text-[9px] font-mono uppercase tracking-widest py-2 px-3 text-slate-600">Game</th>
                  <th className="text-left text-[9px] font-mono uppercase tracking-widest py-2 px-3 text-slate-600">Type</th>
                  <th className={thCls("avg_viewers")} onClick={() => handleSort("avg_viewers")}>Avg Viewers <SortIcon k="avg_viewers" /></th>
                  <th className={thCls("peak_viewers")} onClick={() => handleSort("peak_viewers")}>Peak <SortIcon k="peak_viewers" /></th>
                  <th className={thCls("duration_minutes")} onClick={() => handleSort("duration_minutes")}>Duration <SortIcon k="duration_minutes" /></th>
                  <th className={thCls("followers_gained")} onClick={() => handleSort("followers_gained")}>Follows <SortIcon k="followers_gained" /></th>
                  <th className="text-left text-[9px] font-mono uppercase tracking-widest py-2 px-3 text-slate-600">Promo</th>
                  <th className="text-left text-[9px] font-mono uppercase tracking-widest py-2 px-3 text-slate-600">Energy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {paginated.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-xs font-mono text-slate-400">{s.stream_date}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs font-black uppercase text-white">{s.game}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {s.stream_type && <AppBadge label={s.stream_type.replace("_", " ")} accent="slate" />}
                    </td>
                    <td className="py-2.5 px-3 text-sm font-black text-cyan-400">{s.avg_viewers ?? "—"}</td>
                    <td className="py-2.5 px-3 text-sm font-black text-pink-400">{s.peak_viewers ?? "—"}</td>
                    <td className="py-2.5 px-3 text-xs font-mono text-slate-500">{s.duration_minutes ? `${s.duration_minutes}m` : "—"}</td>
                    <td className="py-2.5 px-3 text-xs font-mono text-yellow-400">{s.followers_gained > 0 ? `+${s.followers_gained}` : "—"}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-mono uppercase ${s.promo_posted ? "text-green-400" : "text-slate-700"}`}>
                        {s.promo_posted ? "✓" : "✕"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {s.energy_level && <AppBadge label={s.energy_level} accent={ENERGY_COLOR[s.energy_level] || "slate"} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
              <span className="text-[10px] font-mono text-slate-600">{filteredTotal} sessions · page {safePage + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                  className="text-[10px] font-mono uppercase px-3 py-1.5 rounded border border-cyan-900/30 text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 disabled:opacity-30 transition-all">
                  Prev
                </button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                  className="text-[10px] font-mono uppercase px-3 py-1.5 rounded border border-cyan-900/30 text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 disabled:opacity-30 transition-all">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
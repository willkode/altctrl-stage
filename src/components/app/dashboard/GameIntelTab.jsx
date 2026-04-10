import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import LoadingState from "../LoadingState";
import { Search, Filter, X } from "lucide-react";

const inp = "w-full bg-[#02040f] border border-cyan-900/20 focus:border-cyan-500/20 text-white rounded-lg px-3 py-2 text-xs font-mono outline-none transition-all";

export default function GameIntelTab() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ genre: null, streamStyle: null, challengeFriendly: null });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { loadGames(); }, []);

  async function loadGames() {
    setLoading(true);
    const all = await base44.entities.GameLibrary.list("-sort_priority", 500);
    setGames(all);
    setLoading(false);
  }

  const allGenres = [...new Set(games.flatMap(g => g.genres || []))].sort();
  const allStreamStyles = [...new Set(games.map(g => g.gameplay_pacing).filter(Boolean))].sort();

  const filtered = games.filter(g => {
    const q = search.toLowerCase();
    const matchesSearch = !search || g.title.toLowerCase().includes(q) || g.developer?.toLowerCase().includes(q);
    const matchesGenre = !filters.genre || g.genres?.includes(filters.genre);
    const matchesStyle = !filters.streamStyle || g.gameplay_pacing === filters.streamStyle;
    const matchesChallenge = filters.challengeFriendly === null || g.challenge_friendly === filters.challengeFriendly;
    return matchesSearch && matchesGenre && matchesStyle && matchesChallenge;
  });

  const hasFilters = Object.values(filters).some(v => v !== null);
  const clearFilters = () => setFilters({ genre: null, streamStyle: null, challengeFriendly: null });

  if (loading) return <LoadingState message="Loading game library..." />;

  return (
    <div className="space-y-5">
      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or developer…" className={inp + " pl-10"} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-lg border transition-all ${
              showFilters || hasFilters ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "border-cyan-900/20 text-slate-500 hover:text-cyan-400"
            }`}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-600 hover:text-cyan-400 transition-colors">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
          <span className="text-[10px] font-mono text-slate-700 ml-auto">{filtered.length} of {games.length} games</span>
        </div>

        {showFilters && (
          <div className="bg-[#060d1f] border border-cyan-900/20 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-[9px] font-mono uppercase text-slate-600 mb-1.5 block">Genre</label>
              <select value={filters.genre || ""} onChange={e => setFilters(f => ({ ...f, genre: e.target.value || null }))} className={inp}>
                <option value="">All Genres</option>
                {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase text-slate-600 mb-1.5 block">Stream Style</label>
              <select value={filters.streamStyle || ""} onChange={e => setFilters(f => ({ ...f, streamStyle: e.target.value || null }))} className={inp}>
                <option value="">All Styles</option>
                {allStreamStyles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase text-slate-600 mb-1.5 block">Challenge Friendly</label>
              <select value={filters.challengeFriendly === null ? "" : filters.challengeFriendly ? "true" : "false"}
                onChange={e => setFilters(f => ({ ...f, challengeFriendly: e.target.value === "" ? null : e.target.value === "true" }))} className={inp}>
                <option value="">Any</option>
                <option value="true">Challenge Friendly</option>
                <option value="false">Not Challenge Friendly</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-[#060d1f] border border-cyan-900/20 rounded-lg p-12 text-center">
          <p className="text-sm text-slate-500">No games match your search or filters.</p>
        </div>
      ) : (
        <div className="bg-[#060d1f] border border-cyan-900/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-900/30 bg-[#030609] text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                  <th className="text-right py-3.5 px-4">Score</th>
                  <th className="text-left py-3.5 px-4">Title</th>
                  <th className="text-left py-3.5 px-4">Genre</th>
                  <th className="text-left py-3.5 px-4">Platform</th>
                  <th className="text-left py-3.5 px-4">Style</th>
                  <th className="text-center py-3.5 px-4">Challenge</th>
                  <th className="text-left py-3.5 px-4">Tags</th>
                  <th className="text-left py-3.5 px-4">Skill</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, idx) => {
                  const score = g.sort_priority ? Math.max(0, Math.min(100, 100 - g.sort_priority)) : 50;
                  const scoreColor = score >= 75 ? "bg-green-500/15 border-l-2 border-green-500" : score >= 50 ? "bg-cyan-500/10 border-l-2 border-cyan-500" : score >= 25 ? "bg-yellow-500/10 border-l-2 border-yellow-500" : "bg-slate-500/5 border-l-2 border-slate-700";
                  const scoreTextColor = score >= 75 ? "text-green-400" : score >= 50 ? "text-cyan-400" : score >= 25 ? "text-yellow-400" : "text-slate-600";
                  return (
                    <tr key={g.id} className={`border-b border-cyan-900/10 hover:bg-cyan-500/5 transition-all ${idx % 2 === 0 ? "bg-[#020408]" : ""}`}>
                      <td className={`text-right py-4 px-4 font-bold text-lg ${scoreTextColor} ${scoreColor}`}>{score}</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-white truncate">{g.title}</div>
                        {g.developer && <div className="text-[10px] text-slate-600 truncate">{g.developer}</div>}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {g.genres?.slice(0, 2).map(genre => (
                            <span key={genre} className="text-[9px] font-mono px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">{genre}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">{g.multiplayer_type?.replace("_", " ") || "—"}</td>
                      <td className="py-4 px-4 text-xs text-slate-400">{g.gameplay_pacing || "—"}</td>
                      <td className="text-center py-4 px-4">
                        {g.challenge_friendly ? (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 text-xs font-bold">✓</span>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {g.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-500/10 border border-slate-500/20 text-slate-400 whitespace-nowrap">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">{g.difficulty_style || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
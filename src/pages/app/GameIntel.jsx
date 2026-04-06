import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import { Search, Filter, X } from "lucide-react";

export default function GameIntel() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    genre: null,
    streamStyle: null,
    challengeFriendly: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    setLoading(true);
    const all = await base44.entities.GameLibrary.list("-sort_priority", 500);
    setGames(all);
    setLoading(false);
  }

  // Get unique filter options
  const allGenres = [...new Set(games.flatMap(g => g.genres || []))].sort();
  const allStreamStyles = [...new Set(games.map(g => g.gameplay_pacing).filter(Boolean))].sort();

  // Filter games
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

  const inp = "w-full bg-[#02040f] border border-cyan-900/20 focus:border-cyan-500/20 text-white rounded-lg px-3 py-2 text-xs font-mono outline-none transition-all";

  if (loading) return <div className="pt-20"><LoadingState message="Loading game library..." /></div>;

  return (
    <PageContainer>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/60 mb-1">Library</p>
          <h1 className="text-2xl font-black uppercase text-white">Game Intel</h1>
          <p className="text-sm text-slate-400 mt-2">Browse all games in your library with detailed metadata.</p>
        </div>

        {/* Search + Filter Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or developer…"
              className={inp + " pl-10"}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-lg border transition-all ${
                showFilters || hasFilters
                  ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                  : "border-cyan-900/20 text-slate-500 hover:text-cyan-400"
              }`}
            >
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-600 hover:text-cyan-400 transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}

            <span className="text-[10px] font-mono text-slate-700 ml-auto">
              {filtered.length} of {games.length} games
            </span>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-[#060d1f] border border-cyan-900/20 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-[9px] font-mono uppercase text-slate-600 mb-1.5 block">Genre</label>
                <select
                  value={filters.genre || ""}
                  onChange={e => setFilters(f => ({ ...f, genre: e.target.value || null }))}
                  className={inp}
                >
                  <option value="">All Genres</option>
                  {allGenres.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase text-slate-600 mb-1.5 block">Stream Style</label>
                <select
                  value={filters.streamStyle || ""}
                  onChange={e => setFilters(f => ({ ...f, streamStyle: e.target.value || null }))}
                  className={inp}
                >
                  <option value="">All Styles</option>
                  {allStreamStyles.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase text-slate-600 mb-1.5 block">Challenge Friendly</label>
                <select
                  value={filters.challengeFriendly === null ? "" : filters.challengeFriendly ? "true" : "false"}
                  onChange={e => setFilters(f => ({ ...f, challengeFriendly: e.target.value === "" ? null : e.target.value === "true" }))}
                  className={inp}
                >
                  <option value="">Any</option>
                  <option value="true">Challenge Friendly</option>
                  <option value="false">Not Challenge Friendly</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Games Table */}
        {filtered.length === 0 ? (
          <div className="bg-[#060d1f] border border-cyan-900/20 rounded-lg p-12 text-center">
            <p className="text-sm text-slate-500">No games match your search or filters.</p>
          </div>
        ) : (
          <div className="bg-[#060d1f] border border-cyan-900/20 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyan-900/20 text-[10px] font-mono uppercase tracking-widest text-slate-600">
                    <th className="text-right py-3 px-4">Score</th>
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Genre</th>
                    <th className="text-left py-3 px-4">Platform Fit</th>
                    <th className="text-left py-3 px-4">Stream Style</th>
                    <th className="text-center py-3 px-4">Challenge</th>
                    <th className="text-left py-3 px-4">Type Tags</th>
                    <th className="text-left py-3 px-4">Skill Curve</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(g => {
                    const score = g.sort_priority ? Math.max(0, Math.min(100, 100 - g.sort_priority)) : 50;
                    return (
                      <tr key={g.id} className="border-b border-cyan-900/10 hover:bg-white/[0.02] transition-colors">
                        <td className="text-right py-3 px-4">
                          <span className={`font-bold ${score >= 70 ? "text-green-400" : score >= 40 ? "text-yellow-400" : "text-slate-500"}`}>
                            {score}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{g.title}</div>
                          {g.developer && <div className="text-[10px] text-slate-600">{g.developer}</div>}
                        </td>
                        <td className="py-3 px-4 text-[10px]">{g.genres?.join(", ") || "—"}</td>
                        <td className="py-3 px-4 text-[10px]">{g.multiplayer_type || "—"}</td>
                        <td className="py-3 px-4 text-[10px]">{g.gameplay_pacing || "—"}</td>
                        <td className="text-center py-3 px-4">
                          {g.challenge_friendly ? (
                            <span className="text-pink-400 font-bold">✓</span>
                          ) : (
                            <span className="text-slate-700">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[10px]">{g.tags?.join(", ") || "—"}</td>
                        <td className="py-3 px-4 text-[10px]">{g.difficulty_style || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
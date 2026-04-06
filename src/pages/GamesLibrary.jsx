import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Filter, X, Swords } from "lucide-react";
import GlitchText from "../components/GlitchText";

const inp = "w-full bg-[#02040f] border border-cyan-900/20 focus:border-cyan-500/20 text-white rounded-lg px-3 py-2 text-xs font-mono outline-none transition-all";

export default function GamesLibrary() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ genre: null, challengeFriendly: null });
  const [showFilters, setShowFilters] = useState(false);

  const allGenres = [...new Set(games.flatMap(g => g.genres || []))].sort();
  const filtered = games.filter(g => {
    const q = search.toLowerCase();
    const matchesSearch = !search || g.title.toLowerCase().includes(q) || g.developer?.toLowerCase().includes(q);
    const matchesGenre = !filters.genre || g.genres?.includes(filters.genre);
    const matchesChallenge = filters.challengeFriendly === null || g.challenge_friendly === filters.challengeFriendly;
    return matchesSearch && matchesGenre && matchesChallenge;
  });

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    setLoading(true);
    const all = await base44.entities.GameLibrary.filter({ is_active: true }, "sort_priority", 500);
    setGames(all);
    setLoading(false);
  }

  const hasFilters = Object.values(filters).some(v => v !== null);
  const clearFilters = () => setFilters({ genre: null, challengeFriendly: null });

  return (
    <div style={{ backgroundColor: "#020408", minHeight: "100vh" }} className="pt-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-3">// GAME LIBRARY</div>
          <GlitchText text="EXPLORE ALL GAMES" className="text-3xl sm:text-4xl font-black uppercase text-white block" tag="h1" />
          <p className="text-slate-400 text-sm mt-3">Browse our complete game library with ratings, genres, and challenge-friendly insights.</p>
        </div>

        {/* Search + Filters */}
        <div className="space-y-3 mb-6">
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
                  ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
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
            <div className="bg-[#060d1f] border border-purple-900/20 rounded-lg p-4 space-y-3">
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

        {/* Games Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 font-mono text-sm">Loading games…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-mono text-sm">No games match your filters.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((game) => (
              <div
                key={game.id}
                className="bg-[#060d1f] border border-purple-900/30 rounded-xl p-4 hover:border-purple-500/50 transition-all group"
              >
                {/* Cover */}
                {game.cover_image && (
                  <div className="mb-4 h-32 overflow-hidden rounded-lg">
                    <img
                      src={game.cover_image}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                {/* Info */}
                <div>
                  <h3 className="font-bold text-white text-sm mb-0.5">{game.title}</h3>
                  {game.developer && (
                    <p className="text-[10px] text-slate-600 mb-3">{game.developer}</p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {game.challenge_friendly && (
                      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded bg-pink-500/20 border border-pink-500/30 text-pink-400">
                        <Swords className="w-2.5 h-2.5" /> Challenge
                      </span>
                    )}
                    {game.genres?.slice(0, 2).map(g => (
                      <span key={g} className="text-[9px] px-2 py-1 rounded bg-cyan-500/10 border border-cyan-900/30 text-cyan-400">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Search, X, Gamepad2, Star, Swords, ChevronDown, Grid3X3, List, Loader2 } from "lucide-react";
import GameCard from "./GameCard";
import GameDetailDrawer from "./GameDetailDrawer";
import { debounce } from "lodash";

const MULTIPLAYER_FILTERS = [
  { value: "battle_royale", label: "Battle Royale" },
  { value: "online_multiplayer", label: "Multiplayer" },
  { value: "co_op", label: "Co-op" },
  { value: "single_player", label: "Single Player" },
  { value: "mmo", label: "MMO" },
];

export default function GameSearchSelector({
  onSelect,
  selectedIds = [],
  multiSelect = false,
  showPriorityToggle = false,
  topGameIds = [],
  onToggleTop,
  compact = false,
  maxHeight = "500px",
}) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterMultiplayer, setFilterMultiplayer] = useState(null);
  const [filterChallenge, setFilterChallenge] = useState(false);
  const [detailGame, setDetailGame] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 30;
  const scrollRef = useRef(null);

  useEffect(() => { loadGames(true); }, [filterMultiplayer, filterChallenge]);

  const loadGames = async (reset = false) => {
    setLoading(true);
    const filter = { is_active: true, pc_supported: true };
    if (filterMultiplayer) filter.multiplayer_type = filterMultiplayer;
    if (filterChallenge) filter.challenge_friendly = true;

    const all = await base44.entities.GameLibrary.filter(filter, "sort_priority", 200);
    setGames(all);
    setHasMore(false);
    setPage(0);
    setLoading(false);
  };

  const filtered = games.filter(g => {
    if (!query) return true;
    const q = query.toLowerCase();
    return g.title?.toLowerCase().includes(q) ||
      g.normalized_title?.includes(q) ||
      g.genres?.some(t => t.toLowerCase().includes(q)) ||
      g.tags?.some(t => t.toLowerCase().includes(q)) ||
      g.developer?.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    const aSelected = selectedIds.includes(a.id) ? 0 : 1;
    const bSelected = selectedIds.includes(b.id) ? 0 : 1;
    if (aSelected !== bSelected) return aSelected - bSelected;
    return (a.sort_priority || 100) - (b.sort_priority || 100);
  });

  const handleSelect = (game) => {
    onSelect?.(game);
  };

  const debouncedSearch = useCallback(debounce((val) => setQuery(val), 200), []);

  const chip = (active, label, onClick) => (
    <button onClick={onClick}
      className={`text-[10px] font-mono uppercase px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
        active ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "border-cyan-900/20 text-slate-600 hover:text-slate-400"
      }`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
        <input
          onChange={e => debouncedSearch(e.target.value)}
          placeholder="Search games, genres, tags…"
          className="w-full bg-[#02040f] border border-cyan-900/20 focus:border-cyan-500/20 text-white placeholder-slate-700 rounded-lg pl-10 pr-10 py-3 text-sm font-mono outline-none transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(""); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-slate-700 hover:text-slate-400 transition-colors" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {chip(filterChallenge, "⚔ Challenge Friendly", () => setFilterChallenge(!filterChallenge))}
        {MULTIPLAYER_FILTERS.map(f => chip(filterMultiplayer === f.value, f.label, () => setFilterMultiplayer(filterMultiplayer === f.value ? null : f.value)))}
        <div className="flex-1" />
        <div className="flex gap-1">
          <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "text-cyan-400" : "text-slate-700"}`}>
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "text-cyan-400" : "text-slate-700"}`}>
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono text-slate-700">{sorted.length} games{query ? ` matching "${query}"` : ""}</p>
        {selectedIds.length > 0 && <p className="text-[10px] font-mono text-cyan-400">{selectedIds.length} selected</p>}
      </div>

      {/* Game list */}
      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-12 text-center">
            <Gamepad2 className="w-8 h-8 text-slate-800 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-500 mb-1">{query ? "No games found" : "No games in library"}</p>
            <p className="text-xs font-mono text-slate-700">{query ? "Try a different search term." : "Ask an admin to seed the game library."}</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className={`grid ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"} gap-2`}>
            {sorted.map(game => (
              <GameCard
                key={game.id}
                game={game}
                selected={selectedIds.includes(game.id)}
                isTop={topGameIds.includes(game.id)}
                showPriority={showPriorityToggle}
                onSelect={() => handleSelect(game)}
                onToggleTop={() => onToggleTop?.(game)}
                onDetail={() => setDetailGame(game)}
                compact={compact}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {sorted.map(game => (
              <GameListRow
                key={game.id}
                game={game}
                selected={selectedIds.includes(game.id)}
                isTop={topGameIds.includes(game.id)}
                onSelect={() => handleSelect(game)}
                onToggleTop={() => onToggleTop?.(game)}
                onDetail={() => setDetailGame(game)}
              />
            ))}
          </div>
        )}
      </div>

      <GameDetailDrawer game={detailGame} onClose={() => setDetailGame(null)} />
    </div>
  );
}

function GameListRow({ game, selected, isTop, onSelect, onToggleTop, onDetail }) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
        selected ? "bg-cyan-500/5 border-cyan-500/20" : "border-transparent hover:bg-white/[0.02] hover:border-cyan-900/10"
      }`}>
      {game.cover_image ? (
        <img src={game.cover_image} alt="" className="w-8 h-8 rounded object-cover shrink-0" loading="lazy" />
      ) : (
        <div className="w-8 h-8 rounded bg-cyan-900/10 flex items-center justify-center shrink-0">
          <Gamepad2 className="w-3.5 h-3.5 text-slate-700" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-white truncate">{game.title}</span>
          {isTop && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />}
          {game.challenge_friendly && <Swords className="w-3 h-3 text-pink-400/60 shrink-0" />}
        </div>
        <span className="text-[10px] font-mono text-slate-600 truncate block">{game.genres?.slice(0, 2).join(" · ")}</span>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDetail(); }}
        className="text-[9px] font-mono text-slate-700 hover:text-cyan-400 transition-colors shrink-0 px-1">
        info
      </button>
    </div>
  );
}
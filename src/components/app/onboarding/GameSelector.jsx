import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Search, Loader2, ChevronDown } from "lucide-react";

export default function GameSelector({ initialGames = [], onComplete }) {
  const [games, setGames] = useState(initialGames);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gameLibrary, setGameLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    // Load game library on mount
    base44.entities.GameLibrary.list("-sort_priority", 200).then(lib => {
      setGameLibrary(lib);
      setLoading(false);
    });
  }, []);

  // Dynamic search across library
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const q = search.toLowerCase();
    const matching = gameLibrary
      .filter(g => g.title.toLowerCase().includes(q) && !games.find(x => x.id === g.id))
      .slice(0, 10)
      .map(g => ({ id: g.id, title: g.title, source: "library" }));

    setSuggestions(matching);
  }, [search, games, gameLibrary]);

  const handleAddGame = (game) => {
    setGames(prev => [...prev, game]);
    setSearch("");
    setSuggestions([]);
  };

  const handleAddCustom = async () => {
    if (!search.trim()) return;
    setAdding(true);

    // Create custom game entry
    const customGame = {
      id: `custom_${Date.now()}`,
      title: search.trim(),
      source: "custom",
    };

    setGames(prev => [...prev, customGame]);
    setSearch("");
    setSuggestions([]);
    setAdding(false);
  };

  const handleRemoveGame = (id) => {
    setGames(prev => prev.filter(g => g.id !== id));
  };

  const canSubmit = games.length > 0;

  return (
    <div className="space-y-4">
      {/* Search input with dynamic suggestions */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search games or type a custom title…"
            className="w-full bg-[#02040f] border border-cyan-900/30 focus:border-cyan-500/30 text-white placeholder-slate-700 rounded-lg px-4 py-3 pl-10 text-sm outline-none transition-all font-mono"
          />
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && (search.trim() || suggestions.length > 0) && (
          <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-[#060d1f] border border-cyan-900/40 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
            ) : suggestions.length > 0 ? (
              <>
                {suggestions.map(game => (
                  <button
                    key={game.id}
                    onMouseDown={() => handleAddGame(game)}
                    className="w-full text-left px-4 py-3 text-sm font-mono text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all border-b border-cyan-900/10 last:border-b-0 flex items-center justify-between"
                  >
                    <span>{game.title}</span>
                    <Plus className="w-3.5 h-3.5 opacity-50" />
                  </button>
                ))}
              </>
            ) : search.trim() ? (
              <button
                onMouseDown={handleAddCustom}
                disabled={adding}
                className="w-full text-left px-4 py-3 text-sm font-mono text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all disabled:opacity-50 flex items-center justify-between"
              >
                <span className="text-cyan-400">+ Add "{search.trim()}" as new game</span>
                {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Selected games */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase tracking-widest text-slate-600">
          Selected Games ({games.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {games.length === 0 ? (
            <div className="w-full text-center py-4 text-sm text-slate-600 font-mono">
              Add at least one game to continue
            </div>
          ) : (
            games.map(game => (
              <div
                key={game.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-mono"
              >
                <span className="flex-1">{game.title}</span>
                {game.source === "custom" && <span className="text-[9px] text-cyan-500/60">CUSTOM</span>}
                <button
                  onClick={() => handleRemoveGame(game.id)}
                  className="text-cyan-600 hover:text-cyan-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={() => onComplete(games)}
        disabled={!canSubmit}
        className="w-full bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3 rounded-lg text-sm hover:bg-cyan-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue with {games.length} game{games.length !== 1 ? "s" : ""}
      </button>
    </div>
  );
}
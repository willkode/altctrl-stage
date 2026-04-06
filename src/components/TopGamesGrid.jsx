import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Swords } from "lucide-react";

export default function TopGamesGrid() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopGames();
  }, []);

  async function loadTopGames() {
    setLoading(true);
    try {
      const all = await base44.entities.GameLibrary.filter({ is_active: true }, "sort_priority", 100);
      setGames(all.slice(0, 10));
    } catch (err) {
      console.error("Failed to load games:", err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="font-mono text-sm">No games in library yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {games.map((game) => (
        <div
          key={game.id}
          className="relative group bg-[#060d1f] border border-purple-900/30 rounded-lg p-4 hover:border-purple-500/50 transition-all"
        >
          {/* Game cover */}
          {game.cover_image && (
            <div className="mb-3 overflow-hidden rounded h-24">
              <img
                src={game.cover_image}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          )}
          
          {/* Game info */}
          <div className="text-left">
            <h3 className="text-sm font-black text-white truncate">{game.title}</h3>
            {game.developer && (
              <p className="text-[10px] text-slate-600 truncate">{game.developer}</p>
            )}
            
            {/* Badges */}
            <div className="flex items-center gap-1 mt-2">
              {game.challenge_friendly && (
                <span className="flex items-center gap-1 text-[9px] px-2 py-1 rounded bg-pink-500/20 border border-pink-500/30 text-pink-400">
                  <Swords className="w-2.5 h-2.5" />
                </span>
              )}
              {game.genres?.length > 0 && (
                <span className="text-[9px] px-2 py-1 rounded bg-cyan-500/10 border border-cyan-900/30 text-cyan-400 truncate">
                  {game.genres[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
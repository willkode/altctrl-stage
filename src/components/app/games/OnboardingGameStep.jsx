import { useState } from "react";
import GameSearchSelector from "./GameSearchSelector";
import { Star, ArrowRight, Gamepad2 } from "lucide-react";

export default function OnboardingGameStep({ onNext, onBack, initialSelections = [], initialTopIds = [] }) {
  const [selectedGames, setSelectedGames] = useState(initialSelections);
  const [topGameIds, setTopGameIds] = useState(initialTopIds);

  const selectedIds = selectedGames.map(g => g.id);

  const handleSelect = (game) => {
    setSelectedGames(prev => {
      const exists = prev.find(g => g.id === game.id);
      if (exists) {
        setTopGameIds(t => t.filter(id => id !== game.id));
        return prev.filter(g => g.id !== game.id);
      }
      return [...prev, game];
    });
  };

  const handleToggleTop = (game) => {
    setTopGameIds(prev =>
      prev.includes(game.id)
        ? prev.filter(id => id !== game.id)
        : prev.length < 3 ? [...prev, game.id] : prev
    );
  };

  const topGames = selectedGames.filter(g => topGameIds.includes(g.id));
  const otherGames = selectedGames.filter(g => !topGameIds.includes(g.id));

  return (
    <div className="space-y-5">
      <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">// SELECT YOUR GAMES</div>

      <p className="text-xs font-mono text-slate-500 leading-relaxed">
        Pick the games you actually stream so ALT CTRL can build smarter schedules, stronger promo packs, and better challenge ideas.
      </p>

      {/* Selected summary */}
      {selectedGames.length > 0 && (
        <div className="space-y-2">
          {topGames.length > 0 && (
            <div>
              <p className="text-[9px] font-mono uppercase text-yellow-400/60 mb-1.5 flex items-center gap-1">
                <Star className="w-3 h-3" /> Top Games ({topGames.length}/3)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topGames.map(g => (
                  <span key={g.id} className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" /> {g.title}
                  </span>
                ))}
              </div>
            </div>
          )}
          {otherGames.length > 0 && (
            <div>
              <p className="text-[9px] font-mono uppercase text-slate-600 mb-1.5">Other Games ({otherGames.length})</p>
              <div className="flex flex-wrap gap-1">
                {otherGames.map(g => (
                  <span key={g.id} className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/5 text-cyan-400/40">{g.title}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] font-mono text-slate-700">
        Click ★ on selected games to mark them as Top Games (up to 3). These are the games you're most known for.
      </p>

      <GameSearchSelector
        onSelect={handleSelect}
        selectedIds={selectedIds}
        multiSelect
        showPriorityToggle
        topGameIds={topGameIds}
        onToggleTop={handleToggleTop}
        maxHeight="340px"
      />

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-3.5 rounded border border-cyan-900/40 text-slate-500 text-xs font-mono uppercase tracking-widest hover:text-slate-300 transition-all">
          Back
        </button>
        <button onClick={() => onNext(selectedGames, topGameIds)} disabled={selectedGames.length === 0}
          className="flex-[2] flex items-center justify-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3.5 rounded text-xs hover:bg-cyan-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
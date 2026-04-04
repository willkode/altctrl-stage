import { Gamepad2, Star, Swords, Check } from "lucide-react";

export default function GameCard({ game, selected, isTop, showPriority, onSelect, onToggleTop, onDetail, compact }) {
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-xl border overflow-hidden cursor-pointer transition-all group ${
        selected
          ? "border-cyan-500/30 bg-cyan-500/[0.03] ring-1 ring-cyan-500/10"
          : "border-cyan-900/15 hover:border-cyan-500/20 bg-[#060d1f]/60"
      }`}>
      {/* Cover */}
      <div className={`relative ${compact ? "h-20" : "h-24"} bg-[#02040f] overflow-hidden`}>
        {game.cover_image ? (
          <img src={game.cover_image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-slate-800" />
          </div>
        )}
        {/* Selection indicator */}
        {selected && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
            <Check className="w-3 h-3 text-[#02040f]" />
          </div>
        )}
        {/* Challenge badge */}
        {game.challenge_friendly && (
          <div className="absolute bottom-1.5 left-1.5">
            <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-pink-500/80 text-white backdrop-blur-sm flex items-center gap-0.5">
              <Swords className="w-2.5 h-2.5" /> Challenge
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`${compact ? "p-2" : "p-2.5"}`}>
        <div className="flex items-start justify-between gap-1">
          <h3 className={`font-bold text-white leading-tight truncate ${compact ? "text-xs" : "text-sm"}`}>{game.title}</h3>
          {isTop && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0 mt-0.5" />}
        </div>
        {!compact && (
          <p className="text-[10px] font-mono text-slate-600 mt-0.5 truncate">{game.genres?.slice(0, 2).join(" · ")}</p>
        )}
        {!compact && game.tags?.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-1.5">
            {game.tags.slice(0, 3).map(t => (
              <span key={t} className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/5 text-cyan-400/40">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Top game toggle */}
      {showPriority && selected && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleTop?.(); }}
          className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            isTop ? "bg-yellow-400 text-[#02040f]" : "bg-black/50 text-slate-500 hover:text-yellow-400 backdrop-blur-sm"
          }`}>
          <Star className={`w-3 h-3 ${isTop ? "fill-current" : ""}`} />
        </button>
      )}
    </div>
  );
}
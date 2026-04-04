import { Swords, Zap, Clock, Target, AlertTriangle } from "lucide-react";

const PACING = { slow: "Slow", medium: "Medium", fast: "Fast", mixed: "Mixed" };
const CHALLENGE_STYLES = [
  { value: "skill", label: "Skill Challenge", desc: "Test mechanical skill under pressure" },
  { value: "speed", label: "Speed Challenge", desc: "Race against the clock" },
  { value: "survival", label: "Survival Challenge", desc: "Last as long as possible" },
  { value: "viewer_vote", label: "Viewer Vote", desc: "Chat decides your fate" },
  { value: "restriction", label: "Restriction", desc: "Play with a handicap" },
  { value: "chaos", label: "Chaos Challenge", desc: "Maximum unpredictability" },
  { value: "progression", label: "Progression", desc: "Achieve a milestone" },
  { value: "custom", label: "Custom", desc: "Your own rules" },
];

export default function GameContextPanel({ game, challengeEnabled, selectedStyle, onStyleSelect }) {
  if (!game) return null;

  const suggestedStyles = CHALLENGE_STYLES.filter(s => {
    if (!game.challenge_friendly) return s.value === "viewer_vote" || s.value === "custom";
    if (game.difficulty_style === "punishing") return ["skill", "survival", "restriction"].includes(s.value);
    if (game.gameplay_pacing === "fast") return ["skill", "speed", "chaos"].includes(s.value);
    if (game.session_style === "sandbox") return ["viewer_vote", "restriction", "custom", "progression"].includes(s.value);
    return true;
  });

  return (
    <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl overflow-hidden">
      {/* Game header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.03]">
        {game.cover_image ? (
          <img src={game.cover_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-cyan-900/10 flex items-center justify-center">
            <Swords className="w-5 h-5 text-slate-700" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white truncate">{game.title}</h4>
          <div className="flex items-center gap-2">
            {game.tags?.slice(0, 3).map(t => (
              <span key={t} className="text-[8px] font-mono uppercase text-cyan-400/40">{t}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-600" />
          <span className="text-[10px] font-mono text-slate-600">{PACING[game.gameplay_pacing] || "—"}</span>
        </div>
      </div>

      {/* Challenge mode content */}
      {challengeEnabled && (
        <div className="p-4 space-y-3">
          {/* Not challenge-friendly warning */}
          {!game.challenge_friendly && (
            <div className="flex items-start gap-2 bg-yellow-400/5 border border-yellow-900/20 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400/60 shrink-0 mt-0.5" />
              <p className="text-[11px] text-yellow-400/60 leading-relaxed">
                This game can still work for challenge streams, but the AI may give better results with custom or viewer-vote challenges.
              </p>
            </div>
          )}

          {/* Challenge notes */}
          {game.challenge_notes && (
            <div>
              <p className="text-[9px] font-mono uppercase text-pink-400/60 mb-1">Why it works for challenges</p>
              <p className="text-xs text-slate-400 leading-relaxed">{game.challenge_notes}</p>
            </div>
          )}

          {/* Style selector */}
          <div>
            <p className="text-[9px] font-mono uppercase text-pink-400/60 mb-2">Challenge Style</p>
            <div className="grid grid-cols-2 gap-1.5">
              {CHALLENGE_STYLES.map(s => {
                const suggested = suggestedStyles.some(ss => ss.value === s.value);
                return (
                  <button key={s.value} onClick={() => onStyleSelect?.(s.value)}
                    className={`text-left px-3 py-2 rounded-lg border transition-all ${
                      selectedStyle === s.value
                        ? "bg-pink-500/10 border-pink-500/20 text-pink-400"
                        : suggested
                          ? "border-cyan-900/15 text-slate-400 hover:border-cyan-500/20"
                          : "border-cyan-900/10 text-slate-600 hover:text-slate-400"
                    }`}>
                    <span className="text-[10px] font-mono uppercase block">{s.label}</span>
                    <span className="text-[9px] text-slate-600 block">{s.desc}</span>
                    {suggested && selectedStyle !== s.value && (
                      <span className="text-[8px] font-mono text-cyan-400/40 mt-0.5 block">Recommended</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
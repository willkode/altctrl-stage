import AppModal from "../AppModal";
import { Gamepad2, Swords, Clock, Target, AlertTriangle, Trophy, XCircle, Zap, Tag } from "lucide-react";

const LABELS = {
  multiplayer_type: { single_player: "Single Player", co_op: "Co-op", online_multiplayer: "Online Multiplayer", mmo: "MMO", battle_royale: "Battle Royale", mixed: "Mixed" },
  gameplay_pacing: { slow: "Slow", medium: "Medium", fast: "Fast", mixed: "Mixed" },
  session_style: { short_runs: "Short Runs", long_sessions: "Long Sessions", sandbox: "Sandbox", mission_based: "Mission-Based", endless: "Endless", mixed: "Mixed" },
  difficulty_style: { casual: "Casual", competitive: "Competitive", punishing: "Punishing", mixed: "Mixed" },
  camera_style: { first_person: "First Person", third_person: "Third Person", top_down: "Top Down", side_scroller: "Side Scroller", isometric: "Isometric", mixed: "Mixed" },
};

function MetaChip({ label, value, accent = "cyan" }) {
  const cls = accent === "pink" ? "bg-pink-500/10 text-pink-400/60" : accent === "yellow" ? "bg-yellow-400/10 text-yellow-400/60" : "bg-cyan-500/10 text-cyan-400/60";
  return (
    <div className={`text-[10px] font-mono uppercase px-2.5 py-1.5 rounded-lg ${cls}`}>
      <span className="text-slate-600">{label}: </span>{value}
    </div>
  );
}

export default function GameDetailDrawer({ game, onClose }) {
  if (!game) return null;

  return (
    <AppModal open={!!game} onClose={onClose} title={game.title} accent="cyan">
      <div className="space-y-4">
        {/* Banner / Cover */}
        {(game.banner_image || game.cover_image) && (
          <div className="h-36 -mx-6 -mt-2 overflow-hidden">
            <img src={game.banner_image || game.cover_image} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Short description */}
        {game.description_short && (
          <p className="text-sm text-slate-300 leading-relaxed">{game.description_short}</p>
        )}

        {/* Badges */}
        {game.challenge_friendly && (
          <div className="flex items-center gap-2 bg-pink-500/5 border border-pink-500/20 rounded-lg px-3 py-2">
            <Swords className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-mono uppercase text-pink-400">Challenge Friendly</span>
          </div>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5">
          {game.genres?.map(g => <MetaChip key={g} label="Genre" value={g} />)}
          {game.multiplayer_type && <MetaChip label="Mode" value={LABELS.multiplayer_type[game.multiplayer_type] || game.multiplayer_type} />}
          {game.gameplay_pacing && <MetaChip label="Pacing" value={LABELS.gameplay_pacing[game.gameplay_pacing] || game.gameplay_pacing} accent="yellow" />}
          {game.session_style && <MetaChip label="Sessions" value={LABELS.session_style[game.session_style] || game.session_style} />}
          {game.difficulty_style && <MetaChip label="Difficulty" value={LABELS.difficulty_style[game.difficulty_style] || game.difficulty_style} accent="pink" />}
          {game.camera_style && <MetaChip label="Camera" value={LABELS.camera_style[game.camera_style] || game.camera_style} />}
        </div>

        {/* Tags */}
        {game.tags?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3 h-3 text-slate-600" />
              <span className="text-[9px] font-mono uppercase text-slate-600">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {game.tags.map(t => (
                <span key={t} className="text-[9px] font-mono uppercase px-2 py-1 rounded bg-cyan-500/5 text-cyan-400/40 border border-cyan-900/10">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Game modes */}
        {game.game_modes?.length > 0 && (
          <div>
            <span className="text-[9px] font-mono uppercase text-slate-600 block mb-1.5">Game Modes</span>
            <div className="flex flex-wrap gap-1">
              {game.game_modes.map(m => (
                <span key={m} className="text-[9px] font-mono uppercase px-2 py-1 rounded bg-yellow-400/5 text-yellow-400/40 border border-yellow-900/10">{m.replace("_", " ")}</span>
              ))}
            </div>
          </div>
        )}

        {/* Core objective */}
        {game.core_objective && (
          <div className="bg-[#02040f] border border-cyan-900/15 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3 h-3 text-cyan-400/60" />
              <span className="text-[9px] font-mono uppercase text-cyan-400/60">Core Objective</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{game.core_objective}</p>
          </div>
        )}

        {/* Win / Fail */}
        <div className="grid grid-cols-2 gap-2">
          {game.win_conditions && (
            <div className="bg-[#02040f] border border-green-900/20 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Trophy className="w-3 h-3 text-green-400/60" />
                <span className="text-[9px] font-mono uppercase text-green-400/60">Win</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{game.win_conditions}</p>
            </div>
          )}
          {game.fail_conditions && (
            <div className="bg-[#02040f] border border-red-900/20 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <XCircle className="w-3 h-3 text-red-400/60" />
                <span className="text-[9px] font-mono uppercase text-red-400/60">Fail</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{game.fail_conditions}</p>
            </div>
          )}
        </div>

        {/* Challenge notes */}
        {game.challenge_notes && (
          <div className="bg-[#02040f] border border-pink-900/15 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Swords className="w-3 h-3 text-pink-400/60" />
              <span className="text-[9px] font-mono uppercase text-pink-400/60">Challenge Notes</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{game.challenge_notes}</p>
          </div>
        )}

        {/* Developer / Publisher */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-700 pt-2 border-t border-white/[0.03]">
          {game.developer && <span>Dev: {game.developer}</span>}
          {game.publisher && <span>Pub: {game.publisher}</span>}
          {game.release_date && <span>{game.release_date}</span>}
        </div>
      </div>
    </AppModal>
  );
}
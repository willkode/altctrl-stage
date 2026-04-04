import { Trophy, XCircle, MessageSquare, Gamepad2, Copy, Check, Megaphone } from "lucide-react";
import { useState } from "react";

export default function ChallengeCard({ challenge, onSelect, onSkip, isSelected }) {
  const [copied, setCopied] = useState(null);

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const statusColor = {
    generated: "border-cyan-900/20",
    selected: "border-green-500/30 bg-green-500/[0.02]",
    used: "border-slate-700/30 opacity-60",
    skipped: "border-slate-800/30 opacity-40",
  }[challenge.status] || "border-cyan-900/20";

  return (
    <div className={`bg-[#060d1f]/80 border ${statusColor} rounded-xl overflow-hidden transition-all`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.03]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black uppercase text-white leading-tight">{challenge.challenge_title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400/60">{challenge.challenge_mode}</span>
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400/60">{challenge.challenge_style}</span>
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {challenge.status === "generated" && (
              <>
                <button onClick={() => onSelect?.(challenge)}
                  className="text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/15 transition-all">
                  Select
                </button>
                <button onClick={() => onSkip?.(challenge)}
                  className="text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-800 text-slate-600 hover:text-slate-400 transition-all">
                  Skip
                </button>
              </>
            )}
            {challenge.status === "selected" && (
              <span className="text-[9px] font-mono uppercase px-2.5 py-1 rounded-full bg-green-500/10 text-green-400">✓ Selected</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Rules */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-1.5">Rules</p>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{challenge.challenge_rules}</p>
        </div>

        {/* Win / Fail conditions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#02040f] border border-green-900/20 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Trophy className="w-3 h-3 text-green-400/60" />
              <span className="text-[9px] font-mono uppercase text-green-400/60">Win</span>
            </div>
            <p className="text-xs text-slate-300">{challenge.win_condition}</p>
          </div>
          <div className="bg-[#02040f] border border-red-900/20 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <XCircle className="w-3 h-3 text-red-400/60" />
              <span className="text-[9px] font-mono uppercase text-red-400/60">Fail</span>
            </div>
            <p className="text-xs text-slate-300">{challenge.fail_condition}</p>
          </div>
        </div>

        {/* Streamer intro */}
        <CopyableBlock
          icon={Megaphone} label="Intro Line" accent="yellow"
          text={challenge.streamer_intro_line}
          copied={copied === "intro"} onCopy={() => copyText(challenge.streamer_intro_line, "intro")}
        />

        {/* Promo hook */}
        <CopyableBlock
          icon={Copy} label="Promo Hook" accent="pink"
          text={challenge.promo_hook}
          copied={copied === "promo"} onCopy={() => copyText(challenge.promo_hook, "promo")}
        />

        {/* Viewer interaction */}
        <div className="bg-[#02040f] border border-cyan-900/15 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-3 h-3 text-cyan-400/60" />
            <span className="text-[9px] font-mono uppercase text-cyan-400/60">Viewer Interaction</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{challenge.viewer_interaction_idea}</p>
        </div>

        {/* Game fit */}
        <div className="bg-[#02040f] border border-slate-800/30 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Gamepad2 className="w-3 h-3 text-slate-500" />
            <span className="text-[9px] font-mono uppercase text-slate-500">Game Fit</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">{challenge.game_fit_reason}</p>
        </div>
      </div>
    </div>
  );
}

function CopyableBlock({ icon: Icon, label, accent, text, copied, onCopy }) {
  const accentCls = {
    yellow: "border-yellow-900/20 text-yellow-400/60",
    pink: "border-pink-900/20 text-pink-400/60",
  }[accent] || "border-cyan-900/20 text-cyan-400/60";

  return (
    <div className={`bg-[#02040f] border ${accentCls.split(" ")[0]} rounded-lg p-3`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3 h-3 ${accentCls.split(" ")[1]}`} />
          <span className={`text-[9px] font-mono uppercase ${accentCls.split(" ")[1]}`}>{label}</span>
        </div>
        <button onClick={onCopy} className="text-slate-700 hover:text-slate-400 transition-colors">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed italic">"{text}"</p>
    </div>
  );
}
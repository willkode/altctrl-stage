import { Target, Zap, TrendingDown, DoorOpen, Gift, AlertTriangle, FlaskConical, Clock, Database } from "lucide-react";

function Section({ icon: Icon, label, content, accent = "cyan" }) {
  if (!content) return null;
  const colors = {
    cyan: "border-cyan-900/20 text-cyan-400/60",
    yellow: "border-yellow-900/20 text-yellow-400/60",
    pink: "border-pink-900/20 text-pink-400/60",
    green: "border-green-900/20 text-green-400/60",
    red: "border-red-900/20 text-red-400/60",
  }[accent] || "border-cyan-900/20 text-cyan-400/60";
  return (
    <div className={`bg-[#02040f] border ${colors.split(" ")[0]} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3.5 h-3.5 ${colors.split(" ")[1]}`} />
        <p className={`text-[10px] font-mono uppercase tracking-widest ${colors.split(" ")[1]}`}>{label}</p>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

export default function StrategyCard({ strategy }) {
  if (!strategy) return null;

  const prompts = (() => { try { return JSON.parse(strategy.engagement_prompts || "[]"); } catch { return []; } })();
  const milestones = (() => { try { return JSON.parse(strategy.milestones || "[]"); } catch { return []; } })();

  const confColor = strategy.confidence === "high" ? "text-green-400 bg-green-500/10 border-green-500/20"
    : strategy.confidence === "medium" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
    : "text-slate-400 bg-slate-500/10 border-slate-500/20";

  return (
    <div className="space-y-4">
      {/* Objective + Confidence */}
      <div className="bg-gradient-to-r from-cyan-950/30 to-[#060d1f] border border-cyan-500/20 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-1">Session Objective</p>
            <p className="text-lg font-black uppercase text-white leading-tight">{strategy.overall_objective}</p>
          </div>
          <span className={`text-[9px] font-mono uppercase px-2 py-1 rounded-full border shrink-0 ${confColor}`}>
            {strategy.confidence} conf
          </span>
        </div>
        {strategy.data_summary && (
          <div className="flex items-start gap-2 mt-3 pt-3 border-t border-white/[0.04]">
            <Database className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-mono text-slate-500 leading-relaxed">{strategy.data_summary}</p>
          </div>
        )}
      </div>

      {/* Strategy sections */}
      <div className="grid md:grid-cols-2 gap-3">
        <Section icon={DoorOpen} label="Opening (First 5-10 min)" content={strategy.opening_strategy} accent="green" />
        <Section icon={Zap} label="Peak Engagement" content={strategy.peak_strategy} accent="cyan" />
        <Section icon={TrendingDown} label="Recovery Plays" content={strategy.recovery_plays} accent="pink" />
        <Section icon={Target} label="Closing (Last 10 min)" content={strategy.closing_strategy} accent="yellow" />
      </div>

      <Section icon={Gift} label="Monetization Windows" content={strategy.monetization_windows} accent="yellow" />

      {/* Engagement prompts */}
      {prompts.length > 0 && (
        <div className="bg-[#02040f] border border-cyan-900/20 rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-3">Engagement Prompts</p>
          <div className="space-y-2">
            {prompts.map((p, i) => {
              const typeBg = { question: "bg-cyan-500/10 text-cyan-400", challenge: "bg-pink-500/10 text-pink-400", cta: "bg-yellow-400/10 text-yellow-400", follow_prompt: "bg-green-500/10 text-green-400" }[p.type] || "bg-slate-500/10 text-slate-400";
              return (
                <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-[#060d1f]/50 border border-white/[0.02]">
                  <span className="text-[10px] font-mono text-slate-600 shrink-0 w-14 mt-0.5">{p.minute_range || "—"}</span>
                  <p className="text-xs text-slate-300 flex-1 leading-relaxed">{p.prompt}</p>
                  <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-full shrink-0 ${typeBg}`}>{p.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="bg-[#02040f] border border-yellow-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-yellow-400/60" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-yellow-400/60">Time-Based Milestones</p>
          </div>
          <div className="space-y-2">
            {milestones.map((m, i) => (
              <div key={i} className="bg-[#060d1f]/50 border border-white/[0.02] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-black text-yellow-400">{m.minute}m</span>
                  <span className="text-xs text-slate-300">{m.check}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="text-green-400/60">↑ {m.action_if_above}</div>
                  <div className="text-red-400/60">↓ {m.action_if_below}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Talking points + avoid */}
      <div className="grid md:grid-cols-2 gap-3">
        <Section icon={Zap} label="Key Talking Points" content={strategy.key_talking_points} accent="cyan" />
        <Section icon={AlertTriangle} label="Avoid" content={strategy.avoid_list} accent="red" />
      </div>

      {/* Experiment note */}
      {strategy.experiment_note && (
        <Section icon={FlaskConical} label="Experiment Note" content={strategy.experiment_note} accent="pink" />
      )}
    </div>
  );
}
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw, TrendingUp, AlertTriangle, Zap, Calendar, Clock, Target, Mic, Users, DollarSign, FlaskConical, ChevronDown, ChevronRight, Award } from "lucide-react";

function BottleneckCard({ number, title, evidence, upside, accent = "red" }) {
  const [open, setOpen] = useState(number === 1);
  const colors = {
    red:    "border-red-500/30 bg-red-500/5 text-red-400",
    orange: "border-orange-500/30 bg-orange-500/5 text-orange-400",
    yellow: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
  };
  const c = colors[accent];
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${c}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${c}`}>#{number}</span>
          <span className="text-sm font-bold text-white">{title}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {evidence && (
            <div>
              <p className="text-[9px] font-mono uppercase text-slate-600 mb-1">Evidence</p>
              <p className="text-xs text-slate-400 leading-relaxed">{evidence}</p>
            </div>
          )}
          {upside && (
            <div className="flex items-start gap-2 bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2">
              <TrendingUp className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
              <p className="text-xs text-green-400 leading-relaxed">{upside}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StreamPlanCard({ stream, index }) {
  const [open, setOpen] = useState(index === 0);
  const dayLabel = stream.date
    ? new Date(stream.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : stream.day?.toUpperCase();

  return (
    <div className="bg-[#02040f] border border-cyan-900/20 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-cyan-500/5 transition-all">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase text-cyan-400/60 w-16 shrink-0">{dayLabel}</span>
          <div>
            <span className="text-sm font-bold text-white">{stream.game}</span>
            <span className="text-[10px] font-mono text-slate-600 ml-2">{stream.stream_type} · {stream.duration_minutes}m{stream.start_time ? ` · ${stream.start_time}` : ""}</span>
          </div>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
          {stream.objective && (
            <div className="flex items-start gap-2">
              <Target className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-300"><span className="text-[9px] font-mono uppercase text-slate-600 mr-1">Goal:</span>{stream.objective}</p>
            </div>
          )}
          {stream.opener && (
            <div className="flex items-start gap-2 bg-pink-500/5 border border-pink-900/20 rounded-lg px-3 py-2">
              <Mic className="w-3 h-3 text-pink-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-400 italic">"{stream.opener}"</p>
            </div>
          )}
          {stream.key_tactic && (
            <div className="flex items-start gap-2">
              <Zap className="w-3 h-3 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-300"><span className="text-[9px] font-mono uppercase text-slate-600 mr-1">Key tactic:</span>{stream.key_tactic}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StrategyBlock({ icon: BlockIcon, label, content, accent = "cyan" }) {
  if (!content) return null;
  const colors = {
    cyan:   "border-cyan-900/30",
    pink:   "border-pink-900/30",
    yellow: "border-yellow-900/30",
  };
  const textColors = {
    cyan:   "text-cyan-400",
    pink:   "text-pink-400",
    yellow: "text-yellow-400",
  };
  return (
    <div className={`bg-[#02040f] border rounded-xl px-4 py-4 ${colors[accent]}`}>
      <div className="flex items-center gap-2 mb-2">
        <BlockIcon className={`w-3.5 h-3.5 ${textColors[accent]}`} />
        <p className={`text-[9px] font-mono uppercase tracking-widest ${textColors[accent]}`}>{label}</p>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{content}</p>
    </div>
  );
}

export default function WeeklyPlanView({ plan, onRefresh }) {
  const [generating, setGenerating] = useState(false);

  async function regenerate() {
    setGenerating(true);
    await base44.functions.invoke("generateWeeklyPlan", { force: true });
    setGenerating(false);
    onRefresh?.();
  }

  if (!plan) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/20 rounded-xl p-10 text-center">
        <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-3" />
        <p className="text-sm font-bold text-white mb-1">No weekly plan yet</p>
        <p className="text-xs font-mono text-slate-600 mb-5">The AI Strategy engine will diagnose your top bottlenecks and build a complete weekly playbook from your session data.</p>
        <button onClick={regenerate} disabled={generating}
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-5 py-3 rounded-lg bg-cyan-400 text-[#02040f] font-black hover:bg-cyan-300 transition-all disabled:opacity-50">
          {generating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analyzing…</> : <><Zap className="w-3.5 h-3.5" />Generate Weekly Plan</>}
        </button>
      </div>
    );
  }

  let streamsPlan = [];
  try { streamsPlan = JSON.parse(plan.streams_plan || "[]"); } catch {}

  const bottlenecks = [
    { n: 1, title: plan.bottleneck_1, evidence: plan.bottleneck_1_evidence, upside: plan.bottleneck_1_upside, accent: "red" },
    { n: 2, title: plan.bottleneck_2, evidence: plan.bottleneck_2_evidence, upside: plan.bottleneck_2_upside, accent: "orange" },
    { n: 3, title: plan.bottleneck_3, evidence: plan.bottleneck_3_evidence, upside: plan.bottleneck_3_upside, accent: "yellow" },
  ].filter(b => b.title);

  const confidencePct = Math.round((plan.confidence_score || 0) * 100);

  return (
    <div className="space-y-5">
      {/* Plan header */}
      <div className="bg-gradient-to-r from-cyan-950/20 to-[#060d1f] border border-cyan-500/20 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/60 mb-1">Strategy AI · Week {plan.week_number}</p>
            {plan.ai_brief && <p className="text-sm font-bold text-white leading-relaxed">{plan.ai_brief}</p>}
          </div>
          <button onClick={regenerate} disabled={generating} title="Regenerate"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-cyan-900/30 text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-all disabled:opacity-30 shrink-0">
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
          </button>
        </div>

        {plan.primary_goal_context && (
          <p className="text-xs text-slate-400 leading-relaxed mb-3 border-l-2 border-cyan-500/30 pl-3">{plan.primary_goal_context}</p>
        )}

        <div className="flex flex-wrap gap-3 text-[10px] font-mono">
          {plan.recommended_games?.length > 0 && (
            <span className="bg-cyan-500/10 border border-cyan-500/20 rounded px-2.5 py-1 text-cyan-400">
              🎮 {plan.recommended_games.slice(0, 3).join(" · ")}
            </span>
          )}
          {plan.recommended_days?.length > 0 && (
            <span className="bg-[#02040f] border border-cyan-900/20 rounded px-2.5 py-1 text-slate-400 uppercase">
              📅 {plan.recommended_days.join(" · ")}
            </span>
          )}
          {plan.target_duration_minutes && (
            <span className="bg-[#02040f] border border-cyan-900/20 rounded px-2.5 py-1 text-slate-400">
              ⏱ {plan.target_duration_minutes}min target
            </span>
          )}
          {confidencePct > 0 && (
            <span className={`border rounded px-2.5 py-1 ${confidencePct >= 70 ? "bg-green-500/10 border-green-500/20 text-green-400" : confidencePct >= 40 ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : "bg-slate-500/10 border-slate-500/20 text-slate-500"}`}>
              {confidencePct}% confidence · {plan.data_sessions_analyzed || 0} sessions
            </span>
          )}
        </div>
      </div>

      {/* Bottlenecks */}
      {bottlenecks.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-red-400/60 mb-3">// Growth Bottlenecks</p>
          <div className="space-y-2">
            {bottlenecks.map(b => (
              <BottleneckCard key={b.n} number={b.n} title={b.title} evidence={b.evidence} upside={b.upside} accent={b.accent} />
            ))}
          </div>
        </div>
      )}

      {/* Strategies */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-3">// Weekly Playbook</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <StrategyBlock icon={Mic} label="Opener Strategy" content={plan.opener_strategy} accent="cyan" />
          <StrategyBlock icon={Users} label="Engagement Strategy" content={plan.engagement_strategy} accent="pink" />
          <StrategyBlock icon={DollarSign} label="Monetization Strategy" content={plan.monetization_strategy} accent="yellow" />
        </div>
      </div>

      {/* Per-stream plan */}
      {streamsPlan.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-3">// Per-Stream Playbook ({streamsPlan.length} streams)</p>
          <div className="space-y-2">
            {streamsPlan.map((s, i) => (
              <StreamPlanCard key={i} stream={s} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Experiment focus */}
      {plan.experiment_focus && (
        <div className="flex items-start gap-3 bg-purple-500/5 border border-purple-500/20 rounded-xl px-4 py-4">
          <FlaskConical className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[9px] font-mono uppercase text-purple-400/60 mb-1">Experiment This Week</p>
            <p className="text-xs text-slate-300 leading-relaxed">{plan.experiment_focus}</p>
          </div>
        </div>
      )}
    </div>
  );
}
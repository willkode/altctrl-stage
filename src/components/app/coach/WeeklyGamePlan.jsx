import { Link } from "react-router-dom";
import { useState } from "react";
import { Calendar, CheckCircle, Clock, AlertTriangle, RefreshCw, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AppBadge from "../AppBadge";
import ProgressBar from "../ProgressBar";

export default function WeeklyGamePlan({ plan, streams, sessions, profile, onRefresh }) {
  const [generating, setGenerating] = useState(false);

  async function generate(force = false) {
    setGenerating(true);
    await base44.functions.invoke('generateWeeklyPlan', { force });
    setGenerating(false);
    onRefresh?.();
  }
  const target = plan?.stream_target || profile?.weekly_stream_target || 3;
  const completed = streams.filter(s => s.status === "completed").length;
  const planned = streams.filter(s => s.status === "planned").length;
  const skipped = streams.filter(s => s.status === "skipped" || s.status === "cancelled").length;

  if (!plan) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// WEEKLY GAME PLAN</div>
        <div className="text-center py-6">
          <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-black uppercase text-slate-400 mb-2">No plan this week</p>
          <p className="text-xs font-mono text-slate-600 mb-4">Generate an AI plan or schedule streams manually.</p>
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => generate(false)} disabled={generating}
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-4 py-2.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all disabled:opacity-50">
              {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {generating ? 'Generating...' : "Generate Week Plan"}
            </button>
            <Link to="/app/schedule"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded text-slate-600 hover:text-slate-400 transition-all">
              <Calendar className="w-3 h-3" /> Or open Schedule
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">// WEEKLY GAME PLAN</div>
        <div className="flex items-center gap-2">
          {plan?.status && <AppBadge label={plan.status} accent={plan.status === "active" ? "cyan" : plan.status === "completed" ? "green" : "slate"} dot />}
          <button onClick={() => generate(true)} disabled={generating} title="Regenerate plan"
            className="w-7 h-7 flex items-center justify-center rounded border border-cyan-500/20 text-cyan-400/50 hover:text-cyan-400 hover:border-cyan-500/40 transition-all disabled:opacity-30">
            <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {plan?.focus_note && (
        <p className="text-sm text-slate-300 mb-4 leading-relaxed border-l-2 border-cyan-500/30 pl-3">{plan.focus_note}</p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-3 text-center">
          <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
          <div className="text-lg font-black text-white">{completed}</div>
          <div className="text-[9px] font-mono uppercase text-slate-600">Done</div>
        </div>
        <div className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-3 text-center">
          <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
          <div className="text-lg font-black text-white">{planned}</div>
          <div className="text-[9px] font-mono uppercase text-slate-600">Planned</div>
        </div>
        <div className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-3 text-center">
          <AlertTriangle className="w-4 h-4 text-red-400/60 mx-auto mb-1" />
          <div className="text-lg font-black text-white">{skipped}</div>
          <div className="text-[9px] font-mono uppercase text-slate-600">Skipped</div>
        </div>
      </div>

      <ProgressBar value={completed} max={target} label={`${completed} of ${target} streams this week`} accent="cyan" />

      {plan?.primary_game && (
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-500">
          Main game: <span className="text-white font-bold">{plan.primary_game}</span>
          {plan?.secondary_games?.length > 0 && (
            <span className="text-slate-600">+ {plan.secondary_games.join(", ")}</span>
          )}
        </div>
      )}

      {plan?.ai_brief && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-[10px] font-mono uppercase text-cyan-400/70 mb-2">AI Brief:</div>
          <p className="text-xs text-slate-400 leading-relaxed">{plan.ai_brief}</p>
        </div>
      )}
    </div>
  );
}
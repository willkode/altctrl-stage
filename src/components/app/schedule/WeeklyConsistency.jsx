import ProgressBar from "../ProgressBar";
import { Flame, Target } from "lucide-react";

export default function WeeklyConsistency({ streams, target, sessions, streak = 0 }) {
  const completed = streams.filter(s => s.status === "completed").length;
  const planned = streams.filter(s => s.status === "planned").length;
  const pct = target > 0 ? Math.round((completed / target) * 100) : 0;

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
      <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// WEEKLY PROGRESS</div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center">
          <div className="text-2xl font-black text-white">{completed}</div>
          <div className="text-[10px] font-mono uppercase text-slate-600 mt-0.5">Done</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-white">{planned}</div>
          <div className="text-[10px] font-mono uppercase text-slate-600 mt-0.5">Planned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-white">{target}</div>
          <div className="text-[10px] font-mono uppercase text-slate-600 mt-0.5">Target</div>
        </div>
      </div>

      <ProgressBar value={completed} max={target} label={`${pct}% of weekly target`} accent="cyan" />

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
        <Flame className={`w-4 h-4 ${streak > 0 ? "text-yellow-400" : "text-slate-700"}`} />
        {streak > 1
          ? <span className="text-xs font-mono text-slate-400"><span className="text-yellow-400 font-black">{streak}</span> week streak 🔥</span>
          : streak === 1
            ? <span className="text-xs font-mono text-slate-400">First week — keep it going!</span>
            : <span className="text-xs font-mono text-slate-700">Log a session to start your streak</span>
        }
      </div>
    </div>
  );
}
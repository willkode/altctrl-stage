import ProgressBar from "./ProgressBar";
import AppBadge from "./AppBadge";
import { Target, Plus } from "lucide-react";

export default function DashboardGoalsSnapshot({ goals, onAddGoal }) {
  if (!goals?.length) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">// ACTIVE GOALS</div>
          <button onClick={onAddGoal} className="flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors">
            <Plus className="w-3 h-3" /> Add Goal
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Target className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-mono text-slate-600">No active goals. Set a target to track your progress.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">// ACTIVE GOALS</div>
        <button onClick={onAddGoal} className="flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-4">
        {goals.slice(0, 3).map(g => (
          <div key={g.id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono text-slate-300">{g.title || g.goal_type.replace(/_/g, " ")}</span>
              <AppBadge label={g.status} accent={g.status === "completed" ? "green" : g.status === "missed" ? "red" : "cyan"} />
            </div>
            <ProgressBar
              value={g.current_value || 0}
              max={g.target_value}
              showValue={false}
              accent={g.status === "completed" ? "cyan" : g.status === "missed" ? "pink" : "cyan"}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs font-mono text-slate-600">{g.current_value || 0} / {g.target_value} {g.unit || ""}</span>
              <span className="text-xs font-mono text-slate-700">{g.period}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
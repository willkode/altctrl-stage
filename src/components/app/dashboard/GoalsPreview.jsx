import { Target, Plus } from "lucide-react";

export default function GoalsPreview({ goals, onAddGoal }) {
  return (
    <div className="bg-[#060d1f]/80 border border-cyan-900/30 rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60">Goals</span>
        <button onClick={onAddGoal} className="text-slate-700 hover:text-cyan-400 transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {!goals?.length ? (
        <div className="flex items-center gap-3 flex-1">
          <Target className="w-4 h-4 text-slate-800" />
          <span className="text-xs font-mono text-slate-700">No active goals yet.</span>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {goals.slice(0, 3).map(g => {
            const pct = g.target_value > 0 ? Math.min(100, Math.round(((g.current_value || 0) / g.target_value) * 100)) : 0;
            return (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono text-slate-400 truncate">{g.title || g.goal_type.replace(/_/g, " ")}</span>
                  <span className="text-[10px] font-mono text-slate-600">{pct}%</span>
                </div>
                <div className="h-1 bg-[#02040f] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-400/60 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
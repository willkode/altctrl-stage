import { useState } from "react";
import { Target, Plus, Check, Edit2, Trash2 } from "lucide-react";
import ProgressBar from "../ProgressBar";
import AppBadge from "../AppBadge";
import GoalDrawer from "../drawers/GoalDrawer";
import { base44 } from "@/api/base44Client";
import { useAppToast } from "../../../hooks/useAppToast";

export default function GoalsTracker({ goals, sessions, onRefresh }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const toast = useAppToast();

  const activeGoals = goals.filter(g => g.status === "active");
  const completedGoals = goals.filter(g => g.status === "completed");

  // Calculate progress for goal types
  function getProgress(goal) {
    const thisWeekSessions = sessions.filter(s => {
      if (!s.stream_date) return false;
      const d = new Date(s.stream_date);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      return d >= weekStart;
    });

    switch (goal.goal_type) {
      case "weekly_streams":
        return thisWeekSessions.length;
      case "avg_viewers": {
        const withViewers = thisWeekSessions.filter(s => s.avg_viewers > 0);
        return withViewers.length > 0 
          ? Math.round(withViewers.reduce((a, s) => a + s.avg_viewers, 0) / withViewers.length) 
          : 0;
      }
      case "peak_viewers":
        return Math.max(0, ...thisWeekSessions.map(s => s.peak_viewers || 0));
      case "followers_gained":
        return thisWeekSessions.reduce((a, s) => a + (s.followers_gained || 0), 0);
      case "promo_rate": {
        const withPromo = thisWeekSessions.filter(s => s.promo_posted).length;
        return thisWeekSessions.length > 0 ? Math.round((withPromo / thisWeekSessions.length) * 100) : 0;
      }
      default:
        return goal.current_value || 0;
    }
  }

  async function handleComplete(goal) {
    await base44.entities.GrowthGoal.update(goal.id, { 
      status: "completed", 
      completed_at: new Date().toISOString() 
    });
    toast.saved("Goal completed!");
    onRefresh?.();
  }

  async function handleDelete(goal) {
    if (!confirm("Delete this goal?")) return;
    await base44.entities.GrowthGoal.delete(goal.id);
    toast.deleted("Goal deleted");
    onRefresh?.();
  }

  return (
    <div className="bg-[#060d1f] border border-yellow-900/30 rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-yellow-400" />
          <div className="text-xs font-mono uppercase tracking-widest text-yellow-400">// ACTIVE GOALS</div>
        </div>
        <button onClick={() => { setEditGoal(null); setDrawerOpen(true); }}
          className="flex items-center gap-1 text-[10px] font-mono uppercase text-yellow-400/70 hover:text-yellow-400 transition-colors">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {activeGoals.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-black uppercase text-slate-400 mb-1">No active goals</p>
          <p className="text-xs font-mono text-slate-600 mb-4">Set goals to track your progress and stay motivated.</p>
          <button onClick={() => { setEditGoal(null); setDrawerOpen(true); }}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/20 transition-all">
            <Plus className="w-3 h-3" /> Set First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeGoals.map(goal => {
            const current = getProgress(goal);
            const pct = Math.min(100, Math.round((current / goal.target_value) * 100));
            const isComplete = current >= goal.target_value;

            return (
              <div key={goal.id} className={`bg-[#02040f] border rounded-lg p-4 transition-all ${isComplete ? "border-green-500/30" : "border-cyan-900/20"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{goal.title || goal.goal_type.replace("_", " ")}</span>
                      <AppBadge label={goal.period} accent="slate" />
                      {isComplete && <AppBadge label="Ready to complete!" accent="green" />}
                    </div>
                    {goal.description && (
                      <p className="text-xs text-slate-600 mt-1">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isComplete && (
                      <button onClick={() => handleComplete(goal)}
                        className="w-7 h-7 flex items-center justify-center rounded border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all"
                        title="Mark complete">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => { setEditGoal(goal); setDrawerOpen(true); }}
                      className="w-7 h-7 flex items-center justify-center rounded border border-cyan-900/30 text-slate-600 hover:text-yellow-400 hover:border-yellow-400/30 transition-all">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(goal)}
                      className="w-7 h-7 flex items-center justify-center rounded border border-cyan-900/30 text-slate-600 hover:text-red-400 hover:border-red-500/30 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <ProgressBar 
                  value={current} 
                  max={goal.target_value} 
                  label={`${current} / ${goal.target_value} ${goal.unit || ""}`} 
                  accent={isComplete ? "green" : "yellow"} 
                />
              </div>
            );
          })}
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-600 mb-2">
            {completedGoals.length} goal{completedGoals.length > 1 ? "s" : ""} completed
          </div>
          <div className="flex flex-wrap gap-1">
            {completedGoals.slice(0, 5).map(g => (
              <span key={g.id} className="text-[10px] font-mono px-2 py-1 rounded bg-green-500/10 text-green-400/70 border border-green-500/20">
                ✓ {g.title || g.goal_type.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      <GoalDrawer 
        open={drawerOpen} 
        onClose={() => { setDrawerOpen(false); setEditGoal(null); }} 
        goal={editGoal}
        onSaved={onRefresh}
      />
    </div>
  );
}
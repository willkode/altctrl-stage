import { useState, useEffect } from "react";
import AppModal from "../AppModal";
import { base44 } from "@/api/base44Client";
import { useAppToast } from "../../../hooks/useAppToast";

const GOAL_TYPES = [
  { value: "stream_frequency", label: "Stream Frequency", description: "How many streams per week", unit: "streams" },
  { value: "average_viewers", label: "Average Viewers", description: "Avg viewers per stream", unit: "viewers" },
  { value: "follower_milestone", label: "Follower Milestone", description: "Total followers gained", unit: "followers" },
  { value: "streak", label: "Consistency Streak", description: "Consecutive weeks streaming", unit: "weeks" },
];

const empty = () => ({
  goal_type: "stream_frequency",
  title: "",
  description: "",
  target_value: 3,
  unit: "streams",
  period: "weekly",
  status: "active",
});

export default function GoalDrawer({ open, onClose, goal = null, onSaved }) {
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const toast = useAppToast();

  useEffect(() => {
    if (goal) setForm({ ...empty(), ...goal });
    else setForm(empty());
  }, [goal, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.target_value || !form.title?.trim()) return;
    setSaving(true);
    const now = new Date();
    const week_number = getISOWeek(now);
    const data = { ...form, week_number, year: now.getFullYear() };
    if (goal?.id) {
      await base44.entities.GrowthGoal.update(goal.id, data);
    } else {
      await base44.entities.GrowthGoal.create(data);
    }
    toast.saved(goal?.id ? "Goal updated" : "Goal created");
    setSaving(false);
    onSaved?.();
    onClose();
  }

  const handleArchive = async () => {
    await base44.entities.GrowthGoal.update(goal.id, { status: "paused" });
    onSaved?.();
    onClose();
  }

  const handleComplete = async () => {
    await base44.entities.GrowthGoal.update(goal.id, { status: "completed", completed_at: new Date().toISOString() });
    onSaved?.();
    onClose();
  }

  const selectedType = GOAL_TYPES.find(t => t.value === form.goal_type);

  return (
    <AppModal open={open} onClose={onClose} title={goal?.id ? "Edit Goal" : "New Goal"} accent="yellow">
      <div className="space-y-4">
        {selectedType?.description && (
          <p className="text-xs text-slate-500 italic">{selectedType.description}</p>
        )}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Goal Type *</label>
          <div className="grid grid-cols-2 gap-1.5">
            {GOAL_TYPES.map(g => (
              <button key={g.value} onClick={() => { set("goal_type", g.value); set("unit", g.unit); }}
                className={`py-3 px-2 rounded text-xs font-mono uppercase text-left transition-all ${form.goal_type === g.value ? "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400" : "bg-[#02040f] border border-cyan-900/30 text-slate-600 hover:text-slate-300"}`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Goal Title *</label>
          <input value={form.title} onChange={e => set("title", e.target.value)}
            placeholder={`e.g. ${selectedType?.description || "Stream 4x this week"}`} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Target Value *</label>
            <input type="number" value={form.target_value} onChange={e => set("target_value", +e.target.value)}
              min={1} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Unit</label>
            <input value={form.unit} onChange={e => set("unit", e.target.value)}
              className={inputCls} disabled />
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Time Period</label>
          <div className="flex gap-2">
            {["weekly", "monthly", "ongoing"].map(p => (
              <button key={p} onClick={() => set("period", p)}
                className={`flex-1 py-2.5 rounded text-xs font-mono uppercase transition-all ${form.period === p ? "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400" : "bg-[#02040f] border border-cyan-900/30 text-slate-600 hover:text-slate-300"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Notes (optional)</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)}
            rows={2} placeholder="Why this goal? What's the context?" className={inputCls + " resize-none"} />
        </div>
        <div className="flex gap-2">
          {goal?.id && (
            <button onClick={handleArchive}
              className="flex-1 border border-slate-600 text-slate-500 font-mono uppercase tracking-widest py-2.5 rounded text-xs hover:text-slate-400 hover:border-slate-500 transition-all">
              Archive
            </button>
          )}
          <button onClick={handleSave} disabled={saving || !form.target_value || !form.title?.trim()}
            className="flex-1 bg-yellow-400 text-[#02040f] font-black uppercase tracking-widest py-3.5 rounded text-xs hover:bg-yellow-300 transition-all disabled:opacity-40">
            {saving ? "Saving..." : goal?.id ? "Update" : "Create Goal"}
          </button>
        </div>
        {goal?.id && goal.status === "active" && (
          <button onClick={handleComplete}
            className="w-full border border-green-500/30 text-green-400 font-mono uppercase tracking-widest py-2 rounded text-xs hover:bg-green-500/5 transition-all">
            Mark Complete
          </button>
        )}
      </div>
    </AppModal>
  );
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

const inputCls = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-4 py-2.5 text-sm outline-none transition-all";
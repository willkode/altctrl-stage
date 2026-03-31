import { useState } from "react";
import { Zap, X } from "lucide-react";

const VARIABLES = [
  { value: "stream_title", label: "Stream Title" },
  { value: "promo_posted", label: "Promo Posted vs Not" },
  { value: "stream_type", label: "Stream Type (solo vs collab)" },
  { value: "game", label: "Game A vs Game B" },
  { value: "start_time", label: "Stream Start Time" },
  { value: "duration", label: "Stream Duration" },
  { value: "custom", label: "Custom Variable" },
];

const METRICS = [
  { value: "avg_viewers", label: "Average Viewers" },
  { value: "peak_viewers", label: "Peak Viewers" },
  { value: "followers_gained", label: "Followers Gained" },
  { value: "comments", label: "Comments" },
  { value: "gifters", label: "Gifters" },
  { value: "diamonds", label: "Diamonds/Gifts" },
  { value: "duration", label: "Stream Duration" },
  { value: "custom", label: "Custom Metric" },
];

const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-3 py-2.5 text-sm outline-none transition-all font-mono";
const lbl = "block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5";

export default function ExperimentForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    variable_tested: "game",
    custom_variable: "",
    variant_a: "",
    variant_b: "",
    success_metric: "avg_viewers",
    custom_metric: "",
    hypothesis: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  const handleSave = () => {
    if (!form.title || !form.variant_a || !form.variant_b) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#060d1f] border border-cyan-900/40 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-black uppercase text-cyan-400">Create Experiment</div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className={lbl}>Experiment Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g., Early vs Late Stream Time Test"
            className={inp}
          />
        </div>

        <div>
          <label className={lbl}>Variable Being Tested *</label>
          <select value={form.variable_tested} onChange={e => setForm(f => ({ ...f, variable_tested: e.target.value }))} className={inp + " appearance-none"}>
            {VARIABLES.map(v => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {form.variable_tested === "custom" && (
          <div>
            <label className={lbl}>Describe Custom Variable</label>
            <input
              type="text"
              value={form.custom_variable}
              onChange={e => setForm(f => ({ ...f, custom_variable: e.target.value }))}
              placeholder="What are you testing?"
              className={inp}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Variant A *</label>
            <input
              type="text"
              value={form.variant_a}
              onChange={e => setForm(f => ({ ...f, variant_a: e.target.value }))}
              placeholder="e.g., 7:00 PM"
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>Variant B *</label>
            <input
              type="text"
              value={form.variant_b}
              onChange={e => setForm(f => ({ ...f, variant_b: e.target.value }))}
              placeholder="e.g., 9:00 PM"
              className={inp}
            />
          </div>
        </div>

        <div>
          <label className={lbl}>Success Metric *</label>
          <select value={form.success_metric} onChange={e => setForm(f => ({ ...f, success_metric: e.target.value }))} className={inp + " appearance-none"}>
            {METRICS.map(m => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {form.success_metric === "custom" && (
          <div>
            <label className={lbl}>Describe Custom Metric</label>
            <input
              type="text"
              value={form.custom_metric}
              onChange={e => setForm(f => ({ ...f, custom_metric: e.target.value }))}
              placeholder="How will you measure success?"
              className={inp}
            />
          </div>
        )}

        <div>
          <label className={lbl}>Hypothesis</label>
          <textarea
            value={form.hypothesis}
            onChange={e => setForm(f => ({ ...f, hypothesis: e.target.value }))}
            placeholder="Why do you think variant A or B will win? What's your prediction?"
            rows={3}
            className={inp + " resize-none"}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>End Date</label>
            <input
              type="date"
              value={form.end_date}
              onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              className={inp}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded border border-slate-700 text-slate-400 font-mono uppercase text-xs hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.title || !form.variant_a || !form.variant_b}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono uppercase text-xs hover:bg-cyan-500/20 disabled:opacity-40 transition-all"
          >
            <Zap className="w-3.5 h-3.5" /> Create Experiment
          </button>
        </div>
      </div>
    </div>
  );
}
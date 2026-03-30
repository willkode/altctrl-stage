import { useState, useEffect } from "react";
import AppModal from "../AppModal";
import { base44 } from "@/api/base44Client";
import { useAppToast } from "../../../hooks/useAppToast";

const STREAM_TYPES = ["ranked", "chill", "viewer_games", "challenge", "collab", "special", "other"];

const empty = () => ({
  title: "",
  game: "",
  stream_type: "ranked",
  scheduled_date: new Date().toISOString().split("T")[0],
  start_time: "19:00",
  target_duration_minutes: 60,
  notes: "",
  recurring: false,
});

export default function StreamDrawer({ open, onClose, stream = null, onSaved }) {
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const toast = useAppToast();

  useEffect(() => {
    if (stream) setForm({ ...empty(), ...stream });
    else setForm(empty());
  }, [stream, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.game || !form.scheduled_date) return;
    setSaving(true);
    const d = new Date(form.scheduled_date);
    const week_number = getISOWeek(d);
    const year = d.getFullYear();
    const data = { ...form, week_number, year };
    if (stream?.id) {
      await base44.entities.ScheduledStream.update(stream.id, data);
    } else {
      await base44.entities.ScheduledStream.create(data);
    }
    toast.saved(stream?.id ? "Stream updated" : "Stream scheduled");
    setSaving(false);
    onSaved?.();
    onClose();
  };

  return (
    <AppModal open={open} onClose={onClose} title={stream?.id ? "Edit Stream" : "Schedule Stream"} accent="cyan">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Game *</label>
          <input value={form.game} onChange={e => set("game", e.target.value)}
            placeholder="e.g. Fortnite, Warzone" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Title</label>
          <input value={form.title} onChange={e => set("title", e.target.value)}
            placeholder="Optional stream title" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Stream Type</label>
          <div className="grid grid-cols-4 gap-1.5">
            {STREAM_TYPES.map(t => (
              <button key={t} onClick={() => set("stream_type", t)}
                className={`py-2 rounded text-xs font-mono uppercase transition-all ${form.stream_type === t ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400" : "bg-[#02040f] border border-cyan-900/30 text-slate-600 hover:text-slate-300"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Date *</label>
            <input type="date" value={form.scheduled_date} onChange={e => set("scheduled_date", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Start Time</label>
            <input type="time" value={form.start_time} onChange={e => set("start_time", e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Duration (min)</label>
          <input type="number" value={form.target_duration_minutes} onChange={e => set("target_duration_minutes", +e.target.value)}
            min={15} max={360} step={15} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
            rows={2} placeholder="Any notes..." className={inputCls + " resize-none"} />
        </div>
        <button onClick={handleSave} disabled={saving || !form.game || !form.scheduled_date}
          className="w-full bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3.5 rounded text-xs hover:bg-cyan-300 transition-all disabled:opacity-40">
          {saving ? "Saving..." : stream?.id ? "Update Stream" : "Schedule Stream"}
        </button>
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
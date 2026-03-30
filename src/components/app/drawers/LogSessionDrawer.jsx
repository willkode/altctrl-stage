import { useState, useEffect } from "react";
import AppModal from "../AppModal";
import { base44 } from "@/api/base44Client";
import { useAppToast } from "../../../hooks/useAppToast";

const ENERGY = ["low", "medium", "high"];
const STREAM_TYPES = ["ranked", "chill", "viewer_games", "challenge", "collab", "special", "other"];

const empty = () => ({
  game: "",
  stream_type: "ranked",
  stream_date: new Date().toISOString().split("T")[0],
  duration_minutes: 60,
  avg_viewers: "",
  peak_viewers: "",
  followers_gained: 0,
  likes_received: 0,
  promo_posted: false,
  went_as_planned: true,
  energy_level: "medium",
  notes: "",
});

export default function LogSessionDrawer({ open, onClose, session = null, onSaved }) {
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const toast = useAppToast();

  useEffect(() => {
    if (session) setForm({ ...empty(), ...session });
    else setForm(empty());
  }, [session, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.game || !form.stream_date) return;
    setSaving(true);
    const d = new Date(form.stream_date);
    const week_number = getISOWeek(d);
    const year = d.getFullYear();
    const data = {
      ...form,
      avg_viewers: form.avg_viewers === "" ? null : +form.avg_viewers,
      peak_viewers: form.peak_viewers === "" ? null : +form.peak_viewers,
      week_number,
      year,
    };
    if (session?.id) {
      await base44.entities.LiveSession.update(session.id, data);
    } else {
      await base44.entities.LiveSession.create(data);
    }
    toast.saved(session?.id ? "Session updated" : "Session logged");
    setSaving(false);
    onSaved?.();
    onClose();
  };

  return (
    <AppModal open={open} onClose={onClose} title={session?.id ? "Edit Session" : "Log Session"} accent="yellow">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Game *</label>
          <input value={form.game} onChange={e => set("game", e.target.value)}
            placeholder="e.g. Fortnite" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Date *</label>
            <input type="date" value={form.stream_date} onChange={e => set("stream_date", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Duration (min)</label>
            <input type="number" value={form.duration_minutes} onChange={e => set("duration_minutes", +e.target.value)} min={0} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Avg Viewers</label>
            <input type="number" value={form.avg_viewers} onChange={e => set("avg_viewers", e.target.value)} min={0} placeholder="0" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Peak Viewers</label>
            <input type="number" value={form.peak_viewers} onChange={e => set("peak_viewers", e.target.value)} min={0} placeholder="0" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Followers Gained</label>
            <input type="number" value={form.followers_gained} onChange={e => set("followers_gained", +e.target.value)} min={0} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Likes</label>
            <input type="number" value={form.likes_received} onChange={e => set("likes_received", +e.target.value)} min={0} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Energy Level</label>
          <div className="flex gap-2">
            {ENERGY.map(e => (
              <button key={e} onClick={() => set("energy_level", e)}
                className={`flex-1 py-2.5 rounded text-xs font-mono uppercase transition-all ${form.energy_level === e ? "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400" : "bg-[#02040f] border border-cyan-900/30 text-slate-600 hover:text-slate-300"}`}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.promo_posted} onChange={e => set("promo_posted", e.target.checked)} className="rounded border-cyan-900" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Promo Posted</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.went_as_planned} onChange={e => set("went_as_planned", e.target.checked)} className="rounded border-cyan-900" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Went As Planned</span>
          </label>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
            rows={2} placeholder="Anything worth noting..." className={inputCls + " resize-none"} />
        </div>
        <button onClick={handleSave} disabled={saving || !form.game || !form.stream_date}
          className="w-full bg-yellow-400 text-[#02040f] font-black uppercase tracking-widest py-3.5 rounded text-xs hover:bg-yellow-300 transition-all disabled:opacity-40">
          {saving ? "Saving..." : session?.id ? "Update Session" : "Log Session"}
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
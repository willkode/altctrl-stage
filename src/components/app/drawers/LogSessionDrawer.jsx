import { useState, useEffect, useRef } from "react";
import AppModal from "../AppModal";
import { base44 } from "@/api/base44Client";
import { useAppToast } from "../../../hooks/useAppToast";
import { Trash2, Zap, Check } from "lucide-react";

const STREAM_TYPES = ["ranked", "chill", "viewer_games", "challenge", "collab", "special", "other"];
const DURATIONS = [30, 45, 60, 90, 120, 180, 240];
const ENERGY = ["low", "medium", "high"];
const ENERGY_ACCENT = { low: "text-slate-400", medium: "text-cyan-400", high: "text-yellow-400" };
const ENERGY_BG = { low: "bg-slate-500/10 border-slate-500/30", medium: "bg-cyan-500/10 border-cyan-500/30", high: "bg-yellow-400/10 border-yellow-400/30" };

const empty = () => ({
  game: "",
  stream_type: "ranked",
  stream_date: new Date().toISOString().split("T")[0],
  duration_minutes: 60,
  avg_viewers: "",
  peak_viewers: "",
  followers_gained: "",
  promo_posted: false,
  went_as_planned: true,
  energy_level: "medium",
  notes: "",
  scheduled_stream_id: "",
});

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-3 py-2.5 text-sm outline-none transition-all font-mono";
const lbl = "block text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1.5";

export default function LogSessionDrawer({ open, onClose, session = null, onSaved }) {
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [gameSuggestions, setGameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [upcomingStreams, setUpcomingStreams] = useState([]);
  const [saved, setSaved] = useState(false);
  const gameRef = useRef(null);
  const toast = useAppToast();
  const isEdit = !!session?.id;

  useEffect(() => {
    if (!open) return;
    if (session) setForm({ ...empty(), ...session,
      avg_viewers: session.avg_viewers ?? "",
      peak_viewers: session.peak_viewers ?? "",
      followers_gained: session.followers_gained ?? "",
    });
    else setForm(empty());
    setConfirmDelete(false);
    setSaved(false);

    // Load game suggestions + upcoming streams
    base44.auth.me().then(user => {
      Promise.all([
        base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 50),
        base44.entities.ScheduledStream.filter({ created_by: user.email }),
      ]).then(([sessions, streams]) => {
        const games = [...new Set(sessions.map(s => s.game).filter(Boolean))];
        setGameSuggestions(games);
        const today = new Date().toISOString().split("T")[0];
        const upcoming = streams
          .filter(s => s.scheduled_date >= today && s.status !== "cancelled")
          .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
          .slice(0, 8);
        setUpcomingStreams(upcoming);
      });
    });
  }, [session, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.game?.trim() || !form.stream_date) return;
    setSaving(true);
    const d = new Date(form.stream_date);
    const data = {
      ...form,
      avg_viewers: form.avg_viewers === "" ? null : +form.avg_viewers,
      peak_viewers: form.peak_viewers === "" ? null : +form.peak_viewers,
      followers_gained: form.followers_gained === "" ? 0 : +form.followers_gained,
      week_number: getISOWeek(d),
      year: d.getFullYear(),
    };
    if (isEdit) {
      await base44.entities.LiveSession.update(session.id, data);
    } else {
      await base44.entities.LiveSession.create(data);
    }
    setSaved(true);
    setSaving(false);
    toast.saved(isEdit ? "Session updated" : "Session logged!");
    onSaved?.();
    setTimeout(() => { onClose(); setSaved(false); }, 600);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await base44.entities.LiveSession.delete(session.id);
    toast.deleted("Session deleted");
    setDeleting(false);
    onSaved?.();
    onClose();
  };

  const filteredGames = gameSuggestions.filter(g =>
    form.game && g.toLowerCase().includes(form.game.toLowerCase()) && g.toLowerCase() !== form.game.toLowerCase()
  );

  return (
    <AppModal open={open} onClose={() => { setConfirmDelete(false); onClose(); }}
      title={isEdit ? "Edit Session" : "Log Session"} accent="yellow">
      <div className="space-y-4">

        {/* Game — with suggestions */}
        <div className="relative" ref={gameRef}>
          <label className={lbl}>Game *</label>
          <input value={form.game}
            onChange={e => { set("game", e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Fortnite, Warzone…"
            className={inp} />
          {showSuggestions && filteredGames.length > 0 && (
            <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-[#060d1f] border border-cyan-900/40 rounded-lg overflow-hidden shadow-xl">
              {filteredGames.slice(0, 5).map(g => (
                <button key={g} onMouseDown={() => { set("game", g); setShowSuggestions(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-mono text-slate-300 hover:bg-yellow-400/5 hover:text-yellow-400 transition-all">
                  {g}
                </button>
              ))}
            </div>
          )}
          {/* Quick chips from history */}
          {!form.game && gameSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {gameSuggestions.slice(0, 5).map(g => (
                <button key={g} onClick={() => set("game", g)}
                  className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-yellow-400/5 border border-yellow-900/30 text-slate-600 hover:text-yellow-400 hover:border-yellow-400/30 transition-all">
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date + Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Date *</label>
            <input type="date" value={form.stream_date}
              onChange={e => set("stream_date", e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Duration</label>
            <div className="flex flex-wrap gap-1">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => set("duration_minutes", d)}
                  className={`px-2 py-1.5 rounded text-[10px] font-mono transition-all ${
                    form.duration_minutes === d
                      ? "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400"
                      : "bg-[#02040f] border border-cyan-900/30 text-slate-600 hover:text-slate-300"
                  }`}>
                  {d}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Viewers + Followers */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={lbl}>Avg Viewers</label>
            <input type="number" min={0} value={form.avg_viewers}
              onChange={e => set("avg_viewers", e.target.value)}
              placeholder="0" className={inp} />
          </div>
          <div>
            <label className={lbl}>Peak Viewers</label>
            <input type="number" min={0} value={form.peak_viewers}
              onChange={e => set("peak_viewers", e.target.value)}
              placeholder="0" className={inp} />
          </div>
          <div>
            <label className={lbl}>Followers +</label>
            <input type="number" min={0} value={form.followers_gained}
              onChange={e => set("followers_gained", e.target.value)}
              placeholder="0" className={inp} />
          </div>
        </div>

        {/* Stream Type */}
        <div>
          <label className={lbl}>Stream Type</label>
          <div className="grid grid-cols-4 gap-1.5">
            {STREAM_TYPES.map(t => (
              <button key={t} onClick={() => set("stream_type", t)}
                className={`py-2 rounded text-[10px] font-mono uppercase transition-all ${
                  form.stream_type === t
                    ? "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400"
                    : "bg-[#02040f] border border-cyan-900/30 text-slate-600 hover:text-slate-300"
                }`}>
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Promo + Went as planned toggles */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => set("promo_posted", !form.promo_posted)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded border text-xs font-mono uppercase transition-all ${
              form.promo_posted
                ? "bg-pink-500/10 border-pink-500/30 text-pink-400"
                : "bg-[#02040f] border-cyan-900/30 text-slate-600"
            }`}>
            <span className={`w-4 h-4 rounded border flex items-center justify-center ${form.promo_posted ? "bg-pink-500 border-pink-500" : "border-cyan-900/60"}`}>
              {form.promo_posted && <Check className="w-2.5 h-2.5 text-white" />}
            </span>
            Promo Posted
          </button>
          <button onClick={() => set("went_as_planned", !form.went_as_planned)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded border text-xs font-mono uppercase transition-all ${
              form.went_as_planned
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-[#02040f] border-cyan-900/30 text-slate-600"
            }`}>
            <span className={`w-4 h-4 rounded border flex items-center justify-center ${form.went_as_planned ? "bg-green-500 border-green-500" : "border-cyan-900/60"}`}>
              {form.went_as_planned && <Check className="w-2.5 h-2.5 text-white" />}
            </span>
            Went as Planned
          </button>
        </div>

        {/* Energy level */}
        <div>
          <label className={lbl}>Energy Level</label>
          <div className="flex gap-2">
            {ENERGY.map(e => (
              <button key={e} onClick={() => set("energy_level", e)}
                className={`flex-1 py-2 rounded border text-xs font-mono uppercase transition-all ${
                  form.energy_level === e
                    ? `${ENERGY_BG[e]} ${ENERGY_ACCENT[e]}`
                    : "bg-[#02040f] border-cyan-900/30 text-slate-600 hover:text-slate-300"
                }`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Link to scheduled stream */}
        {upcomingStreams.length > 0 && (
          <div>
            <label className={lbl}>Link to Scheduled Stream <span className="normal-case text-slate-700">(optional)</span></label>
            <select value={form.scheduled_stream_id || ""}
              onChange={e => set("scheduled_stream_id", e.target.value)}
              className={inp + " appearance-none"}>
              <option value="">— None —</option>
              {upcomingStreams.map(s => (
                <option key={s.id} value={s.id}>
                  {s.scheduled_date} · {s.game}{s.start_time ? ` · ${s.start_time}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className={lbl}>Notes <span className="normal-case text-slate-700">(optional)</span></label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
            rows={2} placeholder="What happened? What to improve?"
            className={inp + " resize-none"} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {isEdit && (
            <button onClick={handleDelete} disabled={deleting}
              className={`flex items-center gap-1.5 px-4 py-3 rounded text-xs font-mono uppercase tracking-widest transition-all disabled:opacity-40 ${
                confirmDelete
                  ? "bg-red-500/20 border border-red-500/50 text-red-400"
                  : "bg-red-500/5 border border-red-900/30 text-red-500/60 hover:text-red-400 hover:border-red-500/40"
              }`}>
              <Trash2 className="w-3 h-3" />
              {deleting ? "Deleting…" : confirmDelete ? "Confirm?" : "Delete"}
            </button>
          )}
          <button onClick={handleSave} disabled={saving || !form.game?.trim() || !form.stream_date}
            className={`flex-1 flex items-center justify-center gap-2 font-black uppercase tracking-widest py-3.5 rounded text-xs transition-all disabled:opacity-40 ${
              saved
                ? "bg-green-400 text-[#02040f]"
                : "bg-yellow-400 text-[#02040f] hover:bg-yellow-300"
            }`}>
            {saved ? <><Check className="w-4 h-4" /> Saved!</> :
             saving ? "Saving…" :
             <><Zap className="w-4 h-4" /> {isEdit ? "Update Session" : "Log Session"}</>}
          </button>
        </div>

        {confirmDelete && (
          <p className="text-xs font-mono text-red-400 text-center">Tap "Confirm?" to permanently delete this session.</p>
        )}
      </div>
    </AppModal>
  );
}
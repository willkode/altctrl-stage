import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import { Zap, Check, Plus, Trash2 } from "lucide-react";

const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-3 py-3 text-sm outline-none transition-all font-mono";
const lbl = "block text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1.5";

const STAR_RATINGS = [1, 2, 3, 4, 5];

function TimestampNote({ note, index, onChange, onDelete }) {
  return (
    <div className="flex gap-2 items-start">
      <input type="text" value={note.ts} onChange={e => onChange({ ...note, ts: e.target.value })}
        placeholder="1:23" className="w-16 bg-[#02040f] border border-cyan-900/40 text-cyan-400 rounded px-2 py-2 text-xs font-mono outline-none" />
      <input type="text" value={note.note} onChange={e => onChange({ ...note, note: e.target.value })}
        placeholder="What happened here?" className="flex-1 bg-[#02040f] border border-cyan-900/40 text-white rounded px-3 py-2 text-sm font-mono outline-none placeholder-slate-700" />
      <button onClick={onDelete} className="text-slate-700 hover:text-red-500 transition-colors mt-2">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ReplayReviewPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [review, setReview] = useState(null);
  const [reviewId, setReviewId] = useState(null);
  const [form, setForm] = useState({
    strongest_opening: "", strongest_engagement: "", dead_zones: "",
    clip_worthy: "", lessons: "", overall_rating: 3, reviewed: false,
  });
  const [tsNotes, setTsNotes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const user = await base44.auth.me();
    const all = await base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 30);
    setSessions(all);
    if (all.length > 0) await loadReview(all[0], user.email);
    setLoading(false);
  }

  async function loadReview(session, email) {
    setSelectedSessionId(session.id);
    const existing = await base44.entities.ReplayReview.filter({ created_by: email, live_session_id: session.id }, "-created_date", 1);
    if (existing[0]) {
      const r = existing[0];
      setReviewId(r.id);
      setForm({
        strongest_opening: r.strongest_opening || "", strongest_engagement: r.strongest_engagement || "",
        dead_zones: r.dead_zones || "", clip_worthy: r.clip_worthy || "",
        lessons: r.lessons || "", overall_rating: r.overall_rating || 3, reviewed: !!r.reviewed,
      });
      try { setTsNotes(JSON.parse(r.timestamp_notes || "[]")); } catch { setTsNotes([]); }
    } else {
      setReviewId(null);
      setForm({ strongest_opening: "", strongest_engagement: "", dead_zones: "", clip_worthy: "", lessons: "", overall_rating: 3, reviewed: false });
      setTsNotes([]);
    }
  }

  async function handleSessionChange(id) {
    const session = sessions.find(s => s.id === id);
    const user = await base44.auth.me();
    await loadReview(session, user.email);
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addTs = () => setTsNotes(n => [...n, { ts: "", note: "" }]);
  const updateTs = (i, v) => setTsNotes(n => n.map((x, idx) => idx === i ? v : x));
  const deleteTs = (i) => setTsNotes(n => n.filter((_, idx) => idx !== i));

  async function handleSave() {
    setSaving(true);
    const session = sessions.find(s => s.id === selectedSessionId);
    const data = {
      ...form, live_session_id: selectedSessionId,
      session_date: session?.stream_date || "", game: session?.game || "",
      reviewed_at: new Date().toISOString(),
      timestamp_notes: JSON.stringify(tsNotes),
    };
    if (reviewId) await base44.entities.ReplayReview.update(reviewId, data);
    else { const c = await base44.entities.ReplayReview.create(data); setReviewId(c.id); }
    // Mark parent session as replay_reviewed
    if (selectedSessionId) await base44.entities.LiveSession.update(selectedSessionId, { replay_reviewed: true });
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <PageContainer><LoadingState message="Loading sessions..." /></PageContainer>;

  const selected = sessions.find(s => s.id === selectedSessionId);

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// REPLAY_REVIEW</div>
        <h1 className="text-2xl font-black uppercase text-white">Replay Review</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">Watch the replay. Learn from it.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-10 text-center">
          <p className="text-slate-500 font-mono text-sm">No sessions logged yet. Debrief first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Session picker */}
          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4">
            <label className={lbl}>Session</label>
            <select value={selectedSessionId} onChange={e => handleSessionChange(e.target.value)} className={inp + " appearance-none"}>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.stream_date} · {s.game}{s.replay_reviewed ? " ✓" : ""}
                </option>
              ))}
            </select>
            {selected && (
              <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-slate-600">
                {selected.replay_reviewed ? <span className="text-green-500">✓ Replay reviewed</span> : <span className="text-yellow-500/70">⚑ Not yet reviewed</span>}
                {selected.avg_viewers && <span>Avg {selected.avg_viewers} viewers</span>}
                {selected.duration_minutes && <span>{selected.duration_minutes}m</span>}
              </div>
            )}
          </div>

          {/* Star rating */}
          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4">
            <label className={lbl}>Overall Session Rating</label>
            <div className="flex gap-2 mt-1">
              {STAR_RATINGS.map(r => (
                <button key={r} onClick={() => set("overall_rating", r)}
                  className={`flex-1 py-2.5 rounded border text-sm font-black transition-all ${
                    form.overall_rating >= r
                      ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-400"
                      : "bg-[#02040f] border-cyan-900/30 text-slate-700 hover:text-slate-500"
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Replay notes */}
          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-1">// Replay Analysis</div>
            {[
              { field: "strongest_opening", label: "Strongest Opening Moment", placeholder: "What landed in the first 2 min?" },
              { field: "strongest_engagement", label: "Strongest Engagement Moment", placeholder: "When was chat the most alive?" },
              { field: "dead_zones", label: "Dead Zones / Slow Periods", placeholder: "Where did the room go quiet?" },
              { field: "clip_worthy", label: "Clip-Worthy Moments", placeholder: "What would you cut for content?" },
              { field: "lessons", label: "Lessons for Next Time", placeholder: "What's the actual takeaway?" },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className={lbl}>{label}</label>
                <textarea value={form[field]} onChange={e => set(field, e.target.value)}
                  rows={2} placeholder={placeholder} className={inp + " resize-none"} />
              </div>
            ))}
          </div>

          {/* Timestamp notes */}
          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">// Timestamp Notes</div>
              <button onClick={addTs} className="flex items-center gap-1 text-[10px] font-mono uppercase text-cyan-400 hover:text-cyan-300 transition-colors">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {tsNotes.length === 0 && <p className="text-xs font-mono text-slate-700">No timestamps yet. Add one above.</p>}
              {tsNotes.map((n, i) => <TimestampNote key={i} note={n} index={i} onChange={v => updateTs(i, v)} onDelete={() => deleteTs(i)} />)}
            </div>
          </div>

          {/* Mark reviewed */}
          <button onClick={() => set("reviewed", !form.reviewed)}
            className={`flex items-center gap-3 w-full px-4 py-4 rounded border text-sm transition-all ${
              form.reviewed ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-[#02040f] border-cyan-900/30 text-slate-500"
            }`}>
            <span className={`w-5 h-5 rounded border flex items-center justify-center ${form.reviewed ? "bg-green-500 border-green-500" : "border-cyan-900/50"}`}>
              {form.reviewed && <Check className="w-3 h-3 text-white" />}
            </span>
            <span className="font-mono text-xs uppercase tracking-widest">Mark Replay as Reviewed</span>
          </button>

          {/* Save */}
          <button onClick={handleSave} disabled={saving || !selectedSessionId}
            className={`w-full flex items-center justify-center gap-2 font-black uppercase tracking-widest py-4 rounded text-sm transition-all disabled:opacity-40 ${
              saved ? "bg-green-400 text-[#02040f]" : "bg-cyan-400 text-[#02040f] hover:bg-cyan-300"
            }`}>
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? "Saving…" : <><Zap className="w-4 h-4" /> Save Review</>}
          </button>
        </div>
      )}
    </PageContainer>
  );
}
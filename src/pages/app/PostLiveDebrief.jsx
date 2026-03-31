import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import { Zap, Check, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-3 py-3 text-sm outline-none transition-all font-mono";
const lbl = "block text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1.5";
const STREAM_TYPES = ["ranked","chill","viewer_games","challenge","collab","special","other"];

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function SourceBadge({ source }) {
  if (!source || source === "manual") return null;
  return (
    <span className="ml-2 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">TikTok</span>
  );
}

function MetricField({ label, field, form, setForm, source, placeholder = "0", note }) {
  return (
    <div>
      <label className={lbl + " flex items-center gap-1"}>
        {label} <SourceBadge source={source?.[field]} />
      </label>
      <input type="number" inputMode="numeric" min={0}
        value={form[field] === null || form[field] === undefined ? "" : form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value === "" ? null : Number(e.target.value) }))}
        placeholder={placeholder} className={inp} />
      {note && <p className="text-[10px] font-mono text-slate-700 mt-1">{note}</p>}
    </div>
  );
}

const empty = () => ({
  game: "", stream_type: "ranked", stream_date: new Date().toISOString().split("T")[0],
  start_time: "", end_time: "", duration_minutes: null, avg_viewers: null, peak_viewers: null,
  followers_gained: null, comments: null, shares: null, gifters: null, diamonds: null,
  fan_club_joins: null, promo_posted: false, went_as_planned: true, would_repeat: true,
  energy_level: "medium", best_moment: "", weakest_moment: "", spike_reason: "", drop_off_reason: "",
  notes: "", source: "manual", source_confidence: "high",
});

export default function PostLiveDebrief() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState("__new__");
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [gameSuggestions, setGameSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const user = await base44.auth.me();
    const all = await base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 20);
    setSessions(all);
    const games = [...new Set(all.map(s => s.game).filter(Boolean))];
    setGameSuggestions(games);
    setLoading(false);
  }

  function selectSession(id) {
    setSelectedId(id);
    if (id === "__new__") { setForm(empty()); return; }
    const s = sessions.find(x => x.id === id);
    if (!s) return;
    setForm({
      game: s.game || "", stream_type: s.stream_type || "ranked", stream_date: s.stream_date || "",
      start_time: s.start_time || "", end_time: s.end_time || "", duration_minutes: s.duration_minutes ?? null,
      avg_viewers: s.avg_viewers ?? null, peak_viewers: s.peak_viewers ?? null,
      followers_gained: s.followers_gained ?? null, comments: s.comments ?? null,
      shares: s.shares ?? null, gifters: s.gifters ?? null, diamonds: s.diamonds ?? null,
      fan_club_joins: s.fan_club_joins ?? null, promo_posted: !!s.promo_posted,
      went_as_planned: s.went_as_planned !== false, would_repeat: s.would_repeat !== false,
      energy_level: s.energy_level || "medium", best_moment: s.best_moment || "",
      weakest_moment: s.weakest_moment || "", spike_reason: s.spike_reason || "",
      drop_off_reason: s.drop_off_reason || "", notes: s.notes || "",
      source: s.source || "manual", source_confidence: s.source_confidence || "high",
    });
  }

  async function handleSave() {
    if (!form.game || !form.stream_date) return;
    setSaving(true);
    const d = new Date(form.stream_date);
    const data = { ...form, week_number: getISOWeek(d), year: d.getFullYear() };
    if (selectedId === "__new__") {
      await base44.entities.LiveSession.create(data);
    } else {
      await base44.entities.LiveSession.update(selectedId, data);
    }
    setSaved(true); setSaving(false);
    await load();
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <PageContainer><LoadingState message="Loading sessions..." /></PageContainer>;

  const isNew = selectedId === "__new__";
  const ENERGY = ["low", "medium", "high"];
  const ENERGY_STYLE = { low: "bg-slate-500/10 border-slate-500/30 text-slate-400", medium: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400", high: "bg-yellow-400/10 border-yellow-400/30 text-yellow-400" };

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-1">// POST_LIVE_DEBRIEF</div>
        <h1 className="text-2xl font-black uppercase text-white">Post-Live Debrief</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">Log everything from your stream.</p>
      </div>

      {/* Session selector */}
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4 mb-4">
        <label className={lbl}>Session</label>
        <select value={selectedId} onChange={e => selectSession(e.target.value)} className={inp + " appearance-none"}>
          <option value="__new__">+ New Debrief</option>
          {sessions.map(s => <option key={s.id} value={s.id}>{s.stream_date} · {s.game}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {/* Core info */}
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 space-y-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 mb-1">// Stream Info</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Game *</label>
              <input value={form.game} onChange={e => setForm(f => ({ ...f, game: e.target.value }))}
                list="game-suggestions" placeholder="Fortnite, Warzone…" className={inp} />
              <datalist id="game-suggestions">{gameSuggestions.map(g => <option key={g} value={g} />)}</datalist>
            </div>
            <div>
              <label className={lbl}>Date *</label>
              <input type="date" value={form.stream_date} onChange={e => setForm(f => ({ ...f, stream_date: e.target.value }))} className={inp} />
            </div>
          </div>
          <div>
            <label className={lbl}>Stream Type</label>
            <div className="grid grid-cols-4 gap-1">
              {STREAM_TYPES.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, stream_type: t }))}
                  className={`py-2.5 rounded border text-[10px] font-mono uppercase transition-all ${form.stream_type === t ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400" : "bg-[#02040f] border-cyan-900/30 text-slate-600 hover:text-slate-300"}`}>
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Viewer metrics */}
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">// Viewer Metrics</span>
            <span className="text-[9px] font-mono text-slate-700 bg-[#02040f] border border-cyan-900/20 px-2 py-0.5 rounded">Manual entry — not available via TikTok API</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricField label="Avg Viewers" field="avg_viewers" form={form} setForm={setForm} />
            <MetricField label="Peak Viewers" field="peak_viewers" form={form} setForm={setForm} />
            <MetricField label="Duration (min)" field="duration_minutes" form={form} setForm={setForm} />
          </div>
        </div>

        {/* Audience & monetization */}
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-pink-400 mb-2">// Audience & Monetization</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricField label="Followers Gained" field="followers_gained" form={form} setForm={setForm} />
            <MetricField label="Comments" field="comments" form={form} setForm={setForm} />
            <MetricField label="Shares" field="shares" form={form} setForm={setForm} />
            <MetricField label="Gifters" field="gifters" form={form} setForm={setForm} />
            <MetricField label="Diamonds" field="diamonds" form={form} setForm={setForm} note="Total diamond value received" />
            <MetricField label="Fan Club Joins" field="fan_club_joins" form={form} setForm={setForm} />
          </div>
        </div>

        {/* Session flags */}
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2">// Session Flags</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { field: "promo_posted", label: "Promo Posted" },
              { field: "went_as_planned", label: "Went as Planned" },
              { field: "would_repeat", label: "Would Repeat Format" },
            ].map(({ field, label }) => (
              <button key={field} onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))}
                className={`flex items-center gap-2 py-3 px-4 rounded border text-xs font-mono uppercase transition-all ${
                  form[field] ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-[#02040f] border-cyan-900/30 text-slate-600"}`}>
                <span className={`w-4 h-4 rounded border flex items-center justify-center ${form[field] ? "bg-green-500 border-green-500" : "border-cyan-900/50"}`}>
                  {form[field] && <Check className="w-2.5 h-2.5 text-white" />}
                </span>
                {label}
              </button>
            ))}
          </div>
          <div>
            <label className={lbl}>Energy Level</label>
            <div className="flex gap-2">
              {ENERGY.map(e => (
                <button key={e} onClick={() => setForm(f => ({ ...f, energy_level: e }))}
                  className={`flex-1 py-2.5 rounded border text-xs font-mono uppercase transition-all ${form.energy_level === e ? ENERGY_STYLE[e] : "bg-[#02040f] border-cyan-900/30 text-slate-600"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* After-action review */}
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 mb-2">// After-Action Review</div>
          {[
            { field: "best_moment", label: "Best Moment", placeholder: "What hit hardest?" },
            { field: "weakest_moment", label: "Weakest Moment", placeholder: "Where did you lose the room?" },
            { field: "spike_reason", label: "Spike Reason", placeholder: "Why did viewers jump?" },
            { field: "drop_off_reason", label: "Drop-Off Reason", placeholder: "What caused the dip?" },
            { field: "notes", label: "Notes", placeholder: "Anything else..." },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className={lbl}>{label}</label>
              <textarea value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                rows={2} placeholder={placeholder} className={inp + " resize-none"} />
            </div>
          ))}
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving || !form.game || !form.stream_date}
          className={`w-full flex items-center justify-center gap-2 font-black uppercase tracking-widest py-4 rounded text-sm transition-all disabled:opacity-40 ${
            saved ? "bg-green-400 text-[#02040f]" : "bg-yellow-400 text-[#02040f] hover:bg-yellow-300"
          }`}>
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? "Saving…" : <><Zap className="w-4 h-4" /> {isNew ? "Save Debrief" : "Update Debrief"}</>}
        </button>
      </div>
    </PageContainer>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import { Plus, Zap, Check, ChevronRight, FlaskConical } from "lucide-react";

const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-3 py-3 text-sm outline-none transition-all font-mono";
const lbl = "block text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1.5";

const VARIABLES = ["game","stream_type","stream_title","promo_posted","start_time","duration","collab","energy_level","custom"];
const METRICS = ["avg_viewers","peak_viewers","followers_gained","comments","gifters","diamonds","duration","custom"];
const RESULTS = { pending: { label: "Pending", style: "text-slate-500 bg-slate-500/10 border-slate-500/20" }, a_wins: { label: "A Wins", style: "text-green-400 bg-green-500/10 border-green-500/20" }, b_wins: { label: "B Wins", style: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" }, inconclusive: { label: "Inconclusive", style: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" } };
const STATUS_STYLE = { active: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5", completed: "text-green-400 border-green-500/30 bg-green-500/5", cancelled: "text-slate-500 border-slate-700 bg-slate-800/5" };

const emptyForm = () => ({
  title: "", variable_tested: "game", custom_variable: "", variant_a: "", variant_b: "",
  success_metric: "avg_viewers", custom_metric: "", hypothesis: "",
  start_date: new Date().toISOString().split("T")[0], end_date: "",
  result: "pending", result_notes: "", status: "active",
});

function ExperimentCard({ exp, sessions, onSelect }) {
  const r = RESULTS[exp.result] || RESULTS.pending;
  // Compute results from linked sessions
  const idsA = (exp.sessions_a_ids || "").split(",").map(s => s.trim()).filter(Boolean);
  const idsB = (exp.sessions_b_ids || "").split(",").map(s => s.trim()).filter(Boolean);
  const metric = exp.success_metric === "custom" ? null : exp.success_metric;
  const avg = (ids) => {
    if (!metric || ids.length === 0) return null;
    const vals = ids.map(id => { const s = sessions.find(x => x.id === id); return s ? Number(s[metric]) : null; }).filter(v => v !== null && !isNaN(v));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  const avgA = avg(idsA);
  const avgB = avg(idsB);

  return (
    <button onClick={onSelect} className="w-full text-left bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 hover:border-cyan-500/30 transition-all group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">Testing: {exp.variable_tested.replace("_", " ")}</div>
          <div className="text-sm font-black text-white">{exp.title}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[9px] font-mono uppercase px-2 py-1 rounded border ${STATUS_STYLE[exp.status] || STATUS_STYLE.active}`}>{exp.status}</span>
          <span className={`text-[9px] font-mono uppercase px-2 py-1 rounded border ${r.style}`}>{r.label}</span>
          <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors" />
        </div>
      </div>
      <div className="flex gap-4 text-xs font-mono text-slate-600">
        <span>A: <span className="text-slate-400">{exp.variant_a || "—"}</span></span>
        <span>vs</span>
        <span>B: <span className="text-slate-400">{exp.variant_b || "—"}</span></span>
      </div>
      {(avgA !== null || avgB !== null) && (
        <div className="mt-3 flex gap-4 text-xs font-mono">
          {avgA !== null && <span>A avg: <span className="text-cyan-400 font-bold">{avgA.toFixed(1)}</span> {metric?.replace("_", " ")}</span>}
          {avgB !== null && <span>B avg: <span className="text-pink-400 font-bold">{avgB.toFixed(1)}</span> {metric?.replace("_", " ")}</span>}
        </div>
      )}
      {exp.start_date && <div className="mt-2 text-[10px] font-mono text-slate-700">{exp.start_date}{exp.end_date ? ` → ${exp.end_date}` : ""}</div>}
    </button>
  );
}

export default function Experiments() {
  const [loading, setLoading] = useState(true);
  const [experiments, setExperiments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const user = await base44.auth.me();
    const [exps, sess] = await Promise.all([
      base44.entities.Experiment.filter({ created_by: user.email }, "-created_date", 50),
      base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 100),
    ]);
    setExperiments(exps);
    setSessions(sess);
    setLoading(false);
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function openEdit(exp) {
    setEditId(exp.id);
    setForm({ title: exp.title || "", variable_tested: exp.variable_tested || "game", custom_variable: exp.custom_variable || "",
      variant_a: exp.variant_a || "", variant_b: exp.variant_b || "", success_metric: exp.success_metric || "avg_viewers",
      custom_metric: exp.custom_metric || "", hypothesis: exp.hypothesis || "",
      start_date: exp.start_date || "", end_date: exp.end_date || "",
      sessions_a_ids: exp.sessions_a_ids || "", sessions_b_ids: exp.sessions_b_ids || "",
      result: exp.result || "pending", result_notes: exp.result_notes || "", status: exp.status || "active",
    });
    setShowForm(true);
  }

  function openNew() {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title) return;
    setSaving(true);
    if (editId) await base44.entities.Experiment.update(editId, form);
    else await base44.entities.Experiment.create(form);
    setSaved(true); setSaving(false);
    await load();
    setTimeout(() => { setSaved(false); setShowForm(false); setEditId(null); }, 800);
  }

  if (loading) return <PageContainer><LoadingState message="Loading experiments..." /></PageContainer>;

  const active = experiments.filter(e => e.status === "active");
  const completed = experiments.filter(e => e.status === "completed");

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// EXPERIMENTS</div>
          <h1 className="text-2xl font-black uppercase text-white">Experiments</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-mono">Structured creator testing.</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-4 py-2.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all shrink-0">
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </div>

      {showForm && (
        <div className="bg-[#060d1f] border border-cyan-500/30 rounded-xl p-5 mb-6 space-y-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-1">{editId ? "// Edit Experiment" : "// New Experiment"}</div>
          <div>
            <label className={lbl}>Experiment Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Fortnite vs Warzone peak viewers" className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Variable Being Tested</label>
              <select value={form.variable_tested} onChange={e => set("variable_tested", e.target.value)} className={inp + " appearance-none"}>
                {VARIABLES.map(v => <option key={v} value={v}>{v.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Success Metric</label>
              <select value={form.success_metric} onChange={e => set("success_metric", e.target.value)} className={inp + " appearance-none"}>
                {METRICS.map(m => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Variant A</label>
              <input value={form.variant_a} onChange={e => set("variant_a", e.target.value)} placeholder="e.g. Fortnite" className={inp} />
            </div>
            <div>
              <label className={lbl}>Variant B</label>
              <input value={form.variant_b} onChange={e => set("variant_b", e.target.value)} placeholder="e.g. Warzone" className={inp} />
            </div>
          </div>
          <div>
            <label className={lbl}>Hypothesis</label>
            <input value={form.hypothesis} onChange={e => set("hypothesis", e.target.value)} placeholder="I believe Fortnite gets higher peak viewers because..." className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Start Date</label>
              <input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>End Date</label>
              <input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} className={inp} />
            </div>
          </div>
          {editId && (
            <>
              <div>
                <label className={lbl}>Session IDs — Variant A <span className="normal-case text-slate-700">(comma-separated)</span></label>
                <input value={form.sessions_a_ids || ""} onChange={e => set("sessions_a_ids", e.target.value)} placeholder="session-id-1, session-id-2" className={inp} />
              </div>
              <div>
                <label className={lbl}>Session IDs — Variant B <span className="normal-case text-slate-700">(comma-separated)</span></label>
                <input value={form.sessions_b_ids || ""} onChange={e => set("sessions_b_ids", e.target.value)} placeholder="session-id-3, session-id-4" className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Result</label>
                  <select value={form.result} onChange={e => set("result", e.target.value)} className={inp + " appearance-none"}>
                    {Object.entries(RESULTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Status</label>
                  <select value={form.status} onChange={e => set("status", e.target.value)} className={inp + " appearance-none"}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Result Notes</label>
                <textarea value={form.result_notes} onChange={e => set("result_notes", e.target.value)} rows={2} placeholder="What actually happened?" className={inp + " resize-none"} />
              </div>
            </>
          )}
          <div className="flex gap-3">
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 py-3.5 rounded border border-cyan-900/40 text-slate-500 font-mono uppercase text-xs tracking-widest hover:text-slate-300 transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.title}
              className={`flex-[2] flex items-center justify-center gap-2 font-black uppercase tracking-widest py-4 rounded text-sm transition-all disabled:opacity-40 ${saved ? "bg-green-400 text-[#02040f]" : "bg-cyan-400 text-[#02040f] hover:bg-cyan-300"}`}>
              {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? "Saving…" : <><Zap className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </div>
      )}

      {experiments.length === 0 && !showForm && (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-10 text-center">
          <FlaskConical className="w-8 h-8 text-cyan-900 mx-auto mb-3" />
          <p className="text-slate-500 font-mono text-sm mb-2">No experiments yet.</p>
          <p className="text-xs font-mono text-slate-700 mb-4">Define one variable, one metric. Run it. See what the data says.</p>
          <button onClick={openNew} className="text-xs font-mono uppercase tracking-widest text-cyan-400 hover:text-cyan-300">+ Start your first experiment</button>
        </div>
      )}

      {active.length > 0 && (
        <div className="mb-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">// Active</div>
          <div className="space-y-3">{active.map(e => <ExperimentCard key={e.id} exp={e} sessions={sessions} onSelect={() => openEdit(e)} />)}</div>
        </div>
      )}
      {completed.length > 0 && (
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-3">// Completed</div>
          <div className="space-y-3">{completed.map(e => <ExperimentCard key={e.id} exp={e} sessions={sessions} onSelect={() => openEdit(e)} />)}</div>
        </div>
      )}
    </PageContainer>
  );
}
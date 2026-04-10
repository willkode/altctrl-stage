import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import ExperimentForm from "../../components/app/experiments/ExperimentForm";
import ExperimentResults from "../../components/app/experiments/ExperimentResults";
import { Zap, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";

const STATUS_COLORS = {
  active: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  completed: "bg-green-500/10 border-green-500/30 text-green-400",
  cancelled: "bg-slate-500/10 border-slate-500/30 text-slate-500",
};

const STATUS_ICONS = {
  active: Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
};

export default function Experiments() {
  const [loading, setLoading] = useState(true);
  const [experiments, setExperiments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedExp, setSelectedExp] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const [exps, sess] = await Promise.all([
      base44.entities.Experiment.filter({ created_by: user.email }, "-created_date", 50),
      base44.entities.LiveSession.filter({ owner_email: user.email }, "-stream_date", 100),
    ]);
    setExperiments(exps);
    setSessions(sess);
    setLoading(false);
  }

  async function handleCreateExperiment(form) {
    const data = {
      ...form,
      status: "active",
      result: "pending",
    };
    await base44.entities.Experiment.create(data);
    setShowForm(false);
    await loadData();
  }

  async function handleLinkSessions(expId, variant, ids) {
    const exp = experiments.find(e => e.id === expId);
    if (!exp) return;
    const field = variant === "a" ? "sessions_a_ids" : "sessions_b_ids";
    await base44.entities.Experiment.update(expId, { [field]: ids.join(", ") });
    await loadData();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this experiment?")) return;
    await base44.entities.Experiment.delete(id);
    await loadData();
  }

  if (loading) return <PageContainer><LoadingState message="Loading experiments..." /></PageContainer>;

  const active = experiments.filter(e => e.status === "active");
  const completed = experiments.filter(e => e.status === "completed");

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-1">// EXPERIMENTS</div>
        <h1 className="text-2xl font-black uppercase text-white">Experiments</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">Run A/B tests instead of guessing.</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 font-black uppercase tracking-widest px-6 py-3 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm"
        >
          <Zap className="w-4 h-4" /> New Experiment
        </button>
      </div>

      {/* Active experiments */}
      {active.length > 0 && (
        <div className="mb-8 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-blue-400">// Active Experiments ({active.length})</div>
          {active.map(exp => (
            <div key={exp.id} className="bg-[#060d1f] border border-blue-900/30 rounded-lg p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black uppercase text-white">{exp.title}</h3>
                  <p className="text-xs font-mono text-slate-600 mt-1">
                    Testing: {exp.custom_variable || exp.variable_tested.replace("_", " ")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
                  <div className="text-[9px] font-mono uppercase text-slate-600 mb-2">Variant A</div>
                  <div className="text-white font-black mb-2">{exp.variant_a}</div>
                  <SessionSelector
                    sessionIds={exp.sessions_a_ids || ""}
                    availableSessions={sessions}
                    onSave={ids => handleLinkSessions(exp.id, "a", ids)}
                  />
                </div>
                <div className="bg-[#02040f] border border-pink-900/20 rounded p-3">
                  <div className="text-[9px] font-mono uppercase text-slate-600 mb-2">Variant B</div>
                  <div className="text-white font-black mb-2">{exp.variant_b}</div>
                  <SessionSelector
                    sessionIds={exp.sessions_b_ids || ""}
                    availableSessions={sessions}
                    onSave={ids => handleLinkSessions(exp.id, "b", ids)}
                  />
                </div>
              </div>

              {exp.hypothesis && (
                <div className="border-t border-blue-900/20 pt-3">
                  <div className="text-[10px] font-mono uppercase text-slate-600 mb-1">Hypothesis</div>
                  <p className="text-sm text-slate-300">{exp.hypothesis}</p>
                </div>
              )}

              <div className="text-[9px] font-mono text-slate-600">
                {exp.start_date} → {exp.end_date || "ongoing"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed experiments */}
      {completed.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-green-400">// Completed Experiments ({completed.length})</div>
          {completed.map(exp => (
            <div key={exp.id} className="bg-[#060d1f] border border-green-900/30 rounded-lg p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black uppercase text-white">{exp.title}</h3>
                  <p className="text-xs font-mono text-slate-600 mt-1">
                    {exp.custom_variable || exp.variable_tested.replace("_", " ")} vs {exp.success_metric.replace("_", " ")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <ExperimentResults experiment={exp} />
              </div>

              {exp.result_notes && (
                <div className="border-t border-green-900/20 pt-3">
                  <div className="text-[10px] font-mono uppercase text-slate-600 mb-1">Notes</div>
                  <p className="text-sm text-slate-300">{exp.result_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {experiments.length === 0 && (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-12 text-center">
          <Zap className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <div className="text-sm font-black uppercase text-slate-500 mb-2">No experiments yet</div>
          <p className="text-xs font-mono text-slate-600 mb-4">Start testing instead of guessing.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 font-black uppercase tracking-widest px-5 py-2.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all text-xs"
          >
            <Zap className="w-3.5 h-3.5" /> Create First Experiment
          </button>
        </div>
      )}

      {showForm && <ExperimentForm onSave={handleCreateExperiment} onCancel={() => setShowForm(false)} />}
    </PageContainer>
  );
}

function SessionSelector({ sessionIds, availableSessions, onSave }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(new Set(sessionIds.split(",").map(x => x.trim()).filter(Boolean)));

  const linkedCount = selected.size;
  const toggle = (id) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-2 px-2 rounded text-[9px] font-mono uppercase bg-[#02040f] border border-cyan-900/20 hover:border-cyan-500/30 text-cyan-400 transition-all"
      >
        {linkedCount} session{linkedCount !== 1 ? "s" : ""} linked
      </button>

      {open && (
        <div className="absolute z-40 bg-[#02040f] border border-cyan-900/40 rounded p-2 w-64 max-h-48 overflow-y-auto space-y-1">
          {availableSessions.map(s => (
            <label key={s.id} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer text-[9px]">
              <input
                type="checkbox"
                checked={selected.has(s.id)}
                onChange={() => toggle(s.id)}
                className="w-3 h-3 accent-cyan-400"
              />
              <span className="text-slate-300">{s.stream_date} · {s.game}</span>
            </label>
          ))}
          <button
            onClick={() => {
              onSave(Array.from(selected));
              setOpen(false);
            }}
            className="w-full py-2 mt-2 rounded text-[9px] font-mono uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
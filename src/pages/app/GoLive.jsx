import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import { Zap, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { inp, lbl } from "../../lib/formStyles";

function CheckItem({ label, checked, onChange, accent = "green" }) {
  const styles = {
    green: { active: "bg-green-500/5 border-green-500/30 text-green-400", check: "bg-green-500 border-green-500" },
    cyan: { active: "bg-cyan-500/5 border-cyan-500/30 text-cyan-400", check: "bg-cyan-500 border-cyan-500" },
  };
  const s = styles[accent];
  return (
    <button onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded border text-sm transition-all ${checked ? s.active : "bg-[#02040f] border-cyan-900/30 text-slate-500 hover:border-cyan-900/50"}`}>
      <span className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${checked ? s.check : "border-cyan-900/50"}`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </span>
      <span className="font-mono text-xs uppercase tracking-widest text-left">{label}</span>
    </button>
  );
}

const emptyForm = () => ({
  stream_title: "", objective: "", opening_points: "", first_five_plan: "",
  promo_confirmed: false, moderator_ready: false, event_ready: false,
  guest_ready: false, title_confirmed: false, game_confirmed: false, status: "prepping",
});

export default function GoLive() {
  const [loading, setLoading] = useState(true);
  const [streams, setStreams] = useState([]);
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [prepId, setPrepId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const user = await base44.auth.me();
    const all = await base44.entities.ScheduledStream.filter({ created_by: user.email }, "-scheduled_date", 30);
    const upcoming = all.filter(s => s.scheduled_date >= today && s.status !== "cancelled").slice(0, 10);
    setStreams(upcoming);
    if (upcoming.length > 0) {
      const pick = upcoming.find(s => s.scheduled_date === today) || upcoming[0];
      setSelectedStreamId(pick.id);
      await loadPrep(pick, user.email);
    }
    setLoading(false);
  }

  async function loadPrep(stream, email) {
    const preps = await base44.entities.GoLivePrep.filter({ created_by: email, linked_stream_id: stream.id }, "-created_date", 1);
    if (preps[0]) {
      setPrepId(preps[0].id);
      const p = preps[0];
      setForm({ stream_title: p.stream_title || "", objective: p.objective || "", opening_points: p.opening_points || "",
        first_five_plan: p.first_five_plan || "", promo_confirmed: !!p.promo_confirmed, moderator_ready: !!p.moderator_ready,
        event_ready: !!p.event_ready, guest_ready: !!p.guest_ready, title_confirmed: !!p.title_confirmed,
        game_confirmed: !!p.game_confirmed, status: p.status || "prepping" });
    } else {
      setPrepId(null);
      setForm({ ...emptyForm(), stream_title: stream.title || stream.game || "", game_confirmed: true });
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const checks = [form.promo_confirmed, form.moderator_ready, form.title_confirmed, form.game_confirmed, !!form.objective, !!form.opening_points];
  const checkedCount = checks.filter(Boolean).length;
  const isReady = checkedCount >= 4;

  async function handleSave(status) {
    setSaving(true);
    const data = { ...form, status: status || form.status, linked_stream_id: selectedStreamId, stream_date: today };
    if (prepId) await base44.entities.GoLivePrep.update(prepId, data);
    else { const c = await base44.entities.GoLivePrep.create(data); setPrepId(c.id); }
    setSaved(true); setSaving(false);
    setForm(f => ({ ...f, status: status || f.status }));
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleStreamChange(id) {
    setSelectedStreamId(id);
    const stream = streams.find(s => s.id === id);
    const user = await base44.auth.me();
    await loadPrep(stream, user.email);
  }

  if (loading) return <PageContainer><LoadingState message="Loading stream..." /></PageContainer>;

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-1">// GO_LIVE_OPS</div>
        <h1 className="text-2xl font-black uppercase text-white">Go Live Ops</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">Pre-stream readiness check.</p>
      </div>

      {streams.length === 0 ? (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-10 text-center">
          <p className="text-slate-500 font-mono text-sm mb-3">No upcoming streams scheduled.</p>
          <Link to="/app/schedule" className="text-xs font-mono uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">→ Schedule a stream first</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stream selector */}
          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4">
            <label className={lbl}>Stream</label>
            <select value={selectedStreamId} onChange={e => handleStreamChange(e.target.value)} className={inp + " appearance-none"}>
              {streams.map(s => <option key={s.id} value={s.id}>{s.scheduled_date} · {s.game}{s.start_time ? ` · ${s.start_time}` : ""}</option>)}
            </select>
          </div>

          {/* Readiness bar */}
          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">// Readiness</span>
              <span className={`text-sm font-black uppercase font-mono ${isReady ? "text-green-400" : "text-yellow-400"}`}>
                {checkedCount}/6 — {isReady ? "READY" : "NOT YET"}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all duration-500" style={{
                width: `${(checkedCount / 6) * 100}%`,
                background: isReady ? "linear-gradient(90deg,#22c55e,#4ade80)" : "linear-gradient(90deg,#f59e0b,#fbbf24)",
                boxShadow: isReady ? "0 0 8px rgba(34,197,94,0.5)" : "0 0 8px rgba(245,158,11,0.4)"
              }} />
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">// Pre-Stream Checklist</div>
            <CheckItem label="Stream title confirmed" checked={form.title_confirmed} onChange={v => set("title_confirmed", v)} />
            <CheckItem label="Game confirmed" checked={form.game_confirmed} onChange={v => set("game_confirmed", v)} />
            <CheckItem label="Promo posted" checked={form.promo_confirmed} onChange={v => set("promo_confirmed", v)} />
            <CheckItem label="Moderator ready" checked={form.moderator_ready} onChange={v => set("moderator_ready", v)} accent="cyan" />
            <CheckItem label="Event / challenge ready" checked={form.event_ready} onChange={v => set("event_ready", v)} accent="cyan" />
            <CheckItem label="Guest / collab confirmed" checked={form.guest_ready} onChange={v => set("guest_ready", v)} accent="cyan" />
          </div>

          {/* Stream prep notes */}
          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4 space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-1">// Prep Notes</div>
            <div>
              <label className={lbl}>Stream Title</label>
              <input value={form.stream_title} onChange={e => set("stream_title", e.target.value)} placeholder="What's showing up in your title bar?" className={inp} />
            </div>
            <div>
              <label className={lbl}>Session Objective</label>
              <input value={form.objective} onChange={e => set("objective", e.target.value)} placeholder="Hit 50 viewers? Grow followers? Stay consistent?" className={inp} />
            </div>
            <div>
              <label className={lbl}>Opening Talking Points</label>
              <textarea value={form.opening_points} onChange={e => set("opening_points", e.target.value)} rows={2} placeholder="What you'll say in the first 2 minutes..." className={inp + " resize-none"} />
            </div>
            <div>
              <label className={lbl}>First 5-Minute Plan</label>
              <textarea value={form.first_five_plan} onChange={e => set("first_five_plan", e.target.value)} rows={2} placeholder="Opening segment, first game mode, viewer interaction..." className={inp + " resize-none"} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => handleSave()} disabled={saving}
              className="flex-1 py-3.5 rounded border border-cyan-900/40 text-slate-500 font-mono uppercase text-xs tracking-widest hover:border-cyan-500/30 hover:text-cyan-400 transition-all disabled:opacity-40">
              {saved ? "✓ Saved" : saving ? "Saving…" : "Save Draft"}
            </button>
            <button onClick={() => handleSave("ready")} disabled={saving || !form.stream_title}
              className={`flex-[2] flex items-center justify-center gap-2 font-black uppercase tracking-widest py-4 rounded text-sm transition-all disabled:opacity-40 ${
                isReady ? "bg-green-500 text-white hover:bg-green-400" : "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30"
              }`}>
              <Zap className="w-4 h-4" />
              {isReady ? "READY TO GO LIVE" : "Mark Ready Anyway"}
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
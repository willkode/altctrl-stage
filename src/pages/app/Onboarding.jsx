import { useState } from "react";
import GlitchText from "../../components/GlitchText";
import { ArrowRight, Zap } from "lucide-react";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const GOALS = [
  { value: "grow_followers", label: "Grow Followers" },
  { value: "increase_viewers", label: "Increase Viewers" },
  { value: "improve_consistency", label: "Improve Consistency" },
  { value: "build_community", label: "Build Community" },
  { value: "monetize", label: "Monetize" },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    display_name: "",
    tiktok_handle: "",
    primary_game: "",
    stream_goal: "grow_followers",
    weekly_stream_target: 3,
    preferred_stream_days: [],
    preferred_stream_time: "19:00",
  });
  const [saving, setSaving] = useState(false);

  const toggleDay = (d) => {
    setForm(f => ({
      ...f,
      preferred_stream_days: f.preferred_stream_days.includes(d)
        ? f.preferred_stream_days.filter(x => x !== d)
        : [...f.preferred_stream_days, d],
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    await onComplete(form);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#02040f] flex items-center justify-center px-4 py-12">
      {/* Scanline */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)" }} />

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/5 rounded px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">// INITIALIZING CREATOR PROFILE</span>
          </div>
          <GlitchText text="WELCOME TO ALTCTRL" className="text-3xl font-black uppercase text-white block mb-1" tag="h1" />
          <p className="text-slate-500 text-sm font-mono">Step {step} of 3 — Let's get you set up.</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? "bg-cyan-400" : "bg-cyan-900/30"}`}
              style={s <= step ? { boxShadow: "0 0 6px rgba(0,245,255,0.4)" } : {}} />
          ))}
        </div>

        <div className="bg-[#060d1f] border border-cyan-900/40 rounded-xl p-6">
          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// STEP 1 — YOUR IDENTITY</div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Creator Name *</label>
                <input
                  value={form.display_name}
                  onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                  placeholder="Your name or creator alias"
                  className="w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-4 py-3 text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">TikTok Handle</label>
                <input
                  value={form.tiktok_handle}
                  onChange={e => setForm(f => ({ ...f, tiktok_handle: e.target.value }))}
                  placeholder="@yourhandle"
                  className="w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-4 py-3 text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Primary Game *</label>
                <input
                  value={form.primary_game}
                  onChange={e => setForm(f => ({ ...f, primary_game: e.target.value }))}
                  placeholder="e.g. Fortnite, Warzone, Free Fire"
                  className="w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-4 py-3 text-sm outline-none transition-all"
                />
              </div>
              <button
                disabled={!form.display_name || !form.primary_game}
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3.5 rounded text-xs hover:bg-cyan-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Goal + Target */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// STEP 2 — YOUR GOAL</div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Primary Stream Goal</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(g => (
                    <button key={g.value} onClick={() => setForm(f => ({ ...f, stream_goal: g.value }))}
                      className={`text-xs font-mono uppercase tracking-wide px-3 py-2.5 rounded border transition-all text-left ${
                        form.stream_goal === g.value
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                          : "bg-[#02040f] border-cyan-900/30 text-slate-500 hover:text-slate-300"
                      }`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Weekly Stream Target</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(n => (
                    <button key={n} onClick={() => setForm(f => ({ ...f, weekly_stream_target: n }))}
                      className={`flex-1 py-2.5 rounded border text-xs font-mono font-bold transition-all ${
                        form.weekly_stream_target === n
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                          : "bg-[#02040f] border-cyan-900/30 text-slate-600 hover:text-slate-300"
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-mono text-slate-600 mt-1.5">{form.weekly_stream_target} streams per week</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded border border-cyan-900/40 text-slate-500 text-xs font-mono uppercase tracking-widest hover:text-slate-300 transition-all">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="flex-[2] flex items-center justify-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3.5 rounded text-xs hover:bg-cyan-300 transition-all">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Schedule preference */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// STEP 3 — YOUR SCHEDULE</div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Preferred Stream Days</label>
                <div className="flex gap-1.5">
                  {DAYS.map(d => (
                    <button key={d} onClick={() => toggleDay(d)}
                      className={`flex-1 py-2.5 rounded border text-xs font-mono font-bold transition-all ${
                        form.preferred_stream_days.includes(d)
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                          : "bg-[#02040f] border-cyan-900/30 text-slate-600 hover:text-slate-300"
                      }`}>
                      {DAY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1.5">Preferred Start Time</label>
                <input type="time" value={form.preferred_stream_time}
                  onChange={e => setForm(f => ({ ...f, preferred_stream_time: e.target.value }))}
                  className="w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white rounded px-4 py-3 text-sm outline-none transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded border border-cyan-900/40 text-slate-500 text-xs font-mono uppercase tracking-widest hover:text-slate-300 transition-all">
                  Back
                </button>
                <button onClick={handleFinish} disabled={saving}
                  className="flex-[2] flex items-center justify-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3.5 rounded text-xs hover:bg-cyan-300 transition-all disabled:opacity-50">
                  <Zap className="w-4 h-4" />
                  {saving ? "Initializing..." : "Launch AltCtrl"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs font-mono text-slate-700 mt-5">// You can update all settings later in your profile.</p>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Calendar, Radio, BarChart3, Brain, Zap } from "lucide-react";

const STEPS = [
  { key: "profile",  icon: Zap,        label: "Set up your profile",          sub: "Add your display name, niche, and streaming goals.",      link: "/app/profile",   linkLabel: "Open Profile" },
  { key: "stream",   icon: Calendar,   label: "Schedule your first stream",   sub: "Pick a game, set a day and time — commit to showing up.",  link: "/app/schedule",  linkLabel: "Open Schedule" },
  { key: "promo",    icon: Radio,      label: "Generate a promo kit",         sub: "Post before you go live. Creators who do see 2× viewers.", link: "/app/promo",     linkLabel: "Open Promo" },
  { key: "session",  icon: BarChart3,  label: "Log your first session",       sub: "Track your viewers, energy, and notes after each stream.", link: "/app/analytics", linkLabel: "Open Analytics" },
  { key: "coach",    icon: Brain,      label: "Unlock daily coaching",        sub: "Log 3 sessions to get AI-powered recommendations.",        link: "/app/coach",     linkLabel: "Open Coach" },
];

export default function NewCreatorChecklist({ completedKeys = [] }) {
  const done = new Set(completedKeys);
  const completedCount = STEPS.filter(s => done.has(s.key)).length;

  return (
    <div className="bg-gradient-to-br from-cyan-500/5 to-pink-500/5 border border-cyan-900/40 rounded-xl p-5 mb-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// GETTING STARTED</div>
          <p className="text-sm font-black uppercase text-white">Complete your setup</p>
          <p className="text-xs font-mono text-slate-500 mt-0.5">{completedCount} of {STEPS.length} steps done</p>
        </div>
        <div className="shrink-0 flex gap-1">
          {STEPS.map(s => (
            <span key={s.key} className={`w-1.5 h-5 rounded-full transition-all ${done.has(s.key) ? "bg-cyan-400" : "bg-slate-800"}`} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {STEPS.map(s => {
          const isDone = done.has(s.key);
          const Icon = s.icon;
          return (
            <div key={s.key} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
              isDone
                ? "border-cyan-900/20 bg-[#02040f]/40 opacity-50"
                : "border-cyan-900/30 bg-[#02040f]/60"
            }`}>
              {isDone
                ? <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                : <Circle className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-sm font-bold ${isDone ? "line-through text-slate-600" : "text-white"}`}>{s.label}</span>
                  {!isDone && (
                    <Link to={s.link}
                      className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all shrink-0">
                      {s.linkLabel} →
                    </Link>
                  )}
                </div>
                {!isDone && <p className="text-xs font-mono text-slate-600 mt-0.5">{s.sub}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
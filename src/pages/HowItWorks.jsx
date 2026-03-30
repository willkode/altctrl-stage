import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown } from "lucide-react";
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";

const steps = [
  {
    step: "01",
    phase: "PLAN",
    accent: "cyan",
    title: "Map Your Week Like a Mission",
    desc: "Log in. See your week. Assign stream dates, game choices, themes, and goals. Build your schedule in under 5 minutes.",
    detail: "AltCtrl structures your week like a tactical ops board. Every stream slot is a mission with a purpose — not just time on a calendar.",
  },
  {
    step: "02",
    phase: "PROMOTE",
    accent: "pink",
    title: "Generate Your Promo Pack",
    desc: "Before each stream, AltCtrl generates a full promo kit — captions, hooks, and content angles — specific to what you're streaming today.",
    detail: "No more blank caption boxes. No more guessing what to post. One click generates everything. You review, edit, and copy.",
  },
  {
    step: "03",
    phase: "GO LIVE",
    accent: "cyan",
    title: "Check Your Systems. Go Live.",
    desc: "Open AltCtrl's pre-live HUD. Confirm your setup, goals, and promo are locked. Then hit go live with confidence.",
    detail: "The pre-live checklist keeps you sharp. No missed steps. No wasted sessions. Just clean execution every time.",
  },
  {
    step: "04",
    phase: "LEARN",
    accent: "pink",
    title: "Log Your Session. Track What Worked.",
    desc: "After each stream, log your performance. AltCtrl tracks everything — viewers, engagement, what worked, what didn't.",
    detail: "Over time, patterns emerge. AltCtrl shows you your best days, best games, best content angles — based on your actual data.",
  },
  {
    step: "05",
    phase: "COACH",
    accent: "yellow",
    title: "Get Your Weekly Strategy Brief",
    desc: "Every week, AltCtrl generates a personalized coaching brief. What to change. What to keep. What to push harder.",
    detail: "Not generic tips. Your data, interpreted by AI, turned into a real action plan. Like having a personal coach who watched every stream.",
  },
];

export default function HowItWorks() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// OPERATIONAL SEQUENCE</div>
          <GlitchText text="HOW THE OS RUNS" className="text-5xl sm:text-6xl font-black uppercase text-white block" tag="h1" />
          <p className="text-slate-400 mt-6 max-w-xl mx-auto">Five connected phases. One seamless loop. Built for creators who want to grow with intent, not luck.</p>
        </div>

        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={s.step}>
              <NeonCard accent={s.accent}>
                <div className="flex gap-6 items-start">
                  <div className={`text-4xl font-black tabular-nums shrink-0 ${s.accent === "pink" ? "text-pink-500/30" : s.accent === "yellow" ? "text-yellow-500/30" : "text-cyan-500/30"}`}>
                    {s.step}
                  </div>
                  <div>
                    <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${s.accent === "pink" ? "text-pink-400" : s.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>
                      // PHASE_{s.step} — {s.phase}
                    </div>
                    <h2 className="text-xl font-black uppercase text-white mb-2">{s.title}</h2>
                    <p className="text-slate-300 mb-3">{s.desc}</p>
                    <p className="text-slate-500 text-sm leading-relaxed border-l-2 border-cyan-900 pl-4">{s.detail}</p>
                  </div>
                </div>
              </NeonCard>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-5 h-5 text-cyan-900" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">// SYSTEM READY — AWAITING ACTIVATION</div>
          <Link to="/waitlist" className="inline-flex items-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest px-8 py-4 rounded text-sm hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(0,245,255,0.5)] transition-all">
            ACTIVATE YOUR ACCOUNT <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
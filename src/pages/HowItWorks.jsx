import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";

const steps = [
  {
    id: "01",
    label: "STEP 1",
    title: "Plan your week",
    sub: "Start with your schedule.",
    accent: "cyan",
    items: [
      "When you are streaming",
      "What game you are playing",
      "What kind of stream it is",
      "How often you want to go live this week",
    ],
    close: "Instead of deciding at the last second, you begin the week with a real plan.",
  },
  {
    id: "02",
    label: "STEP 2",
    title: "Generate promo before every stream",
    sub: "Before you go live, open AltCtrl and generate your promo pack.",
    accent: "pink",
    items: [
      "A hook",
      "A caption",
      "Hashtags",
      "Title options",
    ],
    close: "Copy what you need, post it, and move on. No staring at a blank screen trying to write promo from scratch.",
  },
  {
    id: "03",
    label: "STEP 3",
    title: "Go live with more intention",
    sub: "When your schedule is planned and your promo is ready, going live feels less random and more repeatable.",
    accent: "cyan",
    items: [
      "Better consistency",
      "Clearer goals",
      "Less chaos before stream",
      "Better context for what success looks like",
    ],
    close: "You are not just showing up. You are showing up with a system behind you.",
  },
  {
    id: "04",
    label: "STEP 4",
    title: "Log the session",
    sub: "After your stream, log the results.",
    accent: "pink",
    items: [
      "Game played",
      "Average viewers",
      "Peak viewers",
      "Stream duration",
      "Followers gained",
      "Whether promo was posted",
    ],
    close: "It takes a minute, but it gives AltCtrl the data it needs to get smarter.",
  },
  {
    id: "05",
    label: "STEP 5",
    title: "Learn what is working",
    sub: "As you log more sessions, AltCtrl helps you see the patterns behind your growth.",
    accent: "cyan",
    items: [
      "Which games pull the strongest viewers",
      "Which time slots perform best",
      "Whether promo is making a difference",
      "Where your consistency is slipping",
      "What to focus on next",
    ],
    close: "This is where random effort becomes intentional growth.",
  },
  {
    id: "06",
    label: "STEP 6",
    title: "Repeat next week, smarter",
    sub: "Every week you go through the loop again:",
    accent: "yellow",
    items: [
      "With better data",
      "Better coaching",
      "Stronger habits",
      "Better decisions",
    ],
    close: "That is the point of AltCtrl. Not just to help you stream more, but to help you improve every time you do.",
  },
];

export default function HowItWorks() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// THE SYSTEM</div>
          <GlitchText text="A BETTER WEEK OF STREAMING" className="text-4xl sm:text-5xl font-black uppercase text-white block" tag="h1" />
          <h1 className="text-4xl sm:text-5xl font-black uppercase text-cyan-400">STARTS WITH A BETTER SYSTEM.</h1>
          <p className="text-slate-400 mt-6 max-w-xl mx-auto leading-relaxed">
            AltCtrl is built around one simple loop. Every feature in the product exists to help you move through that cycle faster and more consistently.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            {["PLAN", "→", "PROMOTE", "→", "GO LIVE", "→", "LEARN"].map((step, i) => (
              <span key={i} className="text-sm font-mono font-bold uppercase"
                style={step !== "→" ? { color: "#fff", textShadow: "0 0 10px rgba(0,245,255,0.4)" } : { color: "#1a3040" }}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step) => (
            <NeonCard key={step.id} accent={step.accent}>
              <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${step.accent === "pink" ? "text-pink-400" : step.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>
                // {step.label}
              </div>
              <h2 className="text-2xl font-black uppercase text-white mb-3">{step.title}</h2>
              <p className="text-slate-400 text-sm mb-4">{step.sub}</p>
              <ul className="space-y-2 mb-4">
                {step.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className={`font-mono font-bold mt-0.5 ${step.accent === "pink" ? "text-pink-400" : step.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-slate-400 text-sm border-t border-white/5 pt-4">{step.close}</p>
            </NeonCard>
          ))}
        </div>

        {/* Closing CTA */}
        <div className="mt-16 bg-[#060d1f] border border-cyan-900/40 rounded-lg p-10 text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// SIGNAL LOCKED</div>
          <GlitchText text="RUN YOUR STREAMS LIKE YOU MEAN IT." className="text-3xl sm:text-4xl font-black uppercase text-white block mb-4" tag="h2" />
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed mb-10">
            AltCtrl gives you the structure behind consistent creator growth.
          </p>
          <Link to="/waitlist"
            className="inline-flex items-center gap-2 font-black uppercase tracking-widest px-10 py-5 rounded text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 40px rgba(0,245,255,0.7)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(0,245,255,0.4)"}>
            GET EARLY ACCESS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
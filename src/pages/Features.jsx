import { Link } from "react-router-dom";
import { Target, Radio, Zap, TrendingUp, Brain, Calendar, ArrowRight, CheckCircle } from "lucide-react";
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";

const modules = [
  {
    id: "01",
    icon: Calendar,
    label: "PLAN",
    title: "Weekly Mission Planning",
    accent: "cyan",
    desc: "Build your stream week like a tactical ops board. Assign themes, set goals, lock in your schedule. No more winging it.",
    bullets: [
      "7-day stream calendar with goal tracking",
      "Theme & game assignment per session",
      "Streak and consistency metrics",
      "Weekly performance vs goals review",
    ],
  },
  {
    id: "02",
    icon: Radio,
    label: "PROMOTE",
    title: "AI Promo Pack Generator",
    accent: "pink",
    desc: "Generate a full promo kit before every single stream — TikTok captions, hooks, and content ideas in seconds.",
    bullets: [
      "Stream-specific AI caption generation",
      "Hook library for pre-stream content",
      "Thumbnail concept suggestions",
      "One-click copy & export",
    ],
  },
  {
    id: "03",
    icon: Zap,
    label: "GO LIVE",
    title: "Pre-Live Command Check",
    accent: "cyan",
    desc: "A pre-stream HUD that confirms your gear, goals, and promo are locked before you go live.",
    bullets: [
      "Setup checklist with quick status",
      "Stream goal reminder display",
      "Promo confirmation log",
      "Energy and focus prompts",
    ],
  },
  {
    id: "04",
    icon: TrendingUp,
    label: "LEARN",
    title: "Real Performance Intelligence",
    accent: "pink",
    desc: "Track what actually drives growth. Not just views — engagement patterns, best times, game performance, audience behavior.",
    bullets: [
      "Stream-by-stream performance tracking",
      "Best time and game analysis",
      "Audience behavior patterns",
      "Growth velocity tracking",
    ],
  },
  {
    id: "05",
    icon: Brain,
    label: "COACH",
    title: "AI Coaching Engine",
    accent: "yellow",
    desc: "Your personal gaming strategist. Real coaching based on your actual data — what to change, what to double down on.",
    bullets: [
      "Weekly personalized strategy briefs",
      "Actionable improvement targets",
      "Confidence and momentum scoring",
      "Comparison vs your own best",
    ],
  },
];

export default function Features() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// SYSTEM MODULES — FULL SPEC</div>
          <GlitchText text="EVERY FEATURE." className="text-5xl sm:text-6xl font-black uppercase text-white block" tag="h1" />
          <h1 className="text-5xl sm:text-6xl font-black uppercase text-cyan-400">BUILT FOR BATTLE.</h1>
          <p className="text-slate-400 mt-6 max-w-xl mx-auto">AltCtrl isn't a dashboard. It's a gaming operating system. Every module connects. Every feature feeds the next.</p>
        </div>

        {/* Modules */}
        <div className="space-y-6">
          {modules.map((mod) => (
            <NeonCard key={mod.id} accent={mod.accent} className="group">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div>
                  <div className={`text-xs font-mono uppercase tracking-widest mb-3 ${mod.accent === "pink" ? "text-pink-400" : mod.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>
                    // MODULE_{mod.id} — {mod.label}
                  </div>
                  <mod.icon className={`w-8 h-8 mb-4 ${mod.accent === "pink" ? "text-pink-400" : mod.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`} />
                  <h2 className="text-2xl font-black uppercase text-white mb-3">{mod.title}</h2>
                  <p className="text-slate-400 leading-relaxed">{mod.desc}</p>
                </div>
                <div className="space-y-3">
                  {mod.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${mod.accent === "pink" ? "text-pink-400" : mod.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`} />
                      <span className="text-slate-300 text-sm">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </NeonCard>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link to="/waitlist" className="inline-flex items-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest px-8 py-4 rounded text-sm hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(0,245,255,0.5)] transition-all">
            GET EARLY ACCESS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
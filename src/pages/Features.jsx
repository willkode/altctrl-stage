import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Radio, Brain, TrendingUp } from "lucide-react";
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";

const pillars = [
  {
    id: "01",
    icon: Calendar,
    label: "PROGRAMMING",
    title: "Build a real stream schedule. Stop going live randomly.",
    accent: "cyan",
    intro: "Most creators stream whenever they feel like it. AltCtrl helps you build a weekly calendar with planned stream slots, assigned games, stream formats, and target durations.",
    canDo: {
      heading: "What you can do",
      items: [
        "Create a weekly stream schedule",
        "Assign games and stream types to each slot",
        "Set recurring streams",
        "Track weekly target vs completed streams",
        "Build consistency over time",
        "Get smarter schedule recommendations as you log more sessions",
      ],
    },
    why: "Consistency is not just about discipline. It is about structure. When your week has a plan, every other part of your growth gets easier.",
  },
  {
    id: "02",
    icon: Radio,
    label: "PROMOTION",
    title: "Get your promo pack before every stream.",
    accent: "pink",
    intro: "This is one of AltCtrl's most important features. Before each scheduled stream, generate a ready-to-use promo pack in seconds.",
    packIncludes: {
      heading: "Each promo pack includes",
      items: [
        "A TikTok hook",
        "A caption",
        "8 to 10 hashtags",
        "Stream title options",
      ],
    },
    canDo: {
      heading: "What you can do",
      items: [
        "Generate promo for upcoming streams",
        "Copy each element with one tap",
        "Save promo packs to your library",
        "Mark promo as posted",
        "Regenerate new versions when needed",
        "Match your promo tone to your style",
      ],
    },
    why: "Promo is one of the easiest ways to increase awareness before going live, but most creators skip it because it feels like extra work. AltCtrl removes that friction.",
  },
  {
    id: "03",
    icon: Brain,
    label: "COACHING",
    title: "Know what to focus on today — and what to improve this week.",
    accent: "yellow",
    intro: "AltCtrl gives you coaching based on your real session history, your goals, and your current momentum.",
    canDo: {
      heading: "Coaching features",
      items: [
        "Daily coaching cards",
        "Weekly game plans",
        "Goals tracking",
        "Weekly recaps",
        "Streak and consistency tracking",
        "Alerts for milestones, missed momentum, and opportunities",
      ],
    },
    why: "Generic creator advice does not help when your schedule, games, and audience patterns are different from everyone else's. AltCtrl is built to coach you based on your own data.",
  },
  {
    id: "04",
    icon: TrendingUp,
    label: "PERFORMANCE",
    title: "See what games, times, and habits actually grow your account.",
    accent: "cyan",
    intro: "AltCtrl helps you turn session data into decisions.",
    canDo: {
      heading: "Track and review",
      items: [
        "Average viewers",
        "Peak viewers",
        "Session duration",
        "Followers gained",
        "Promo posted vs not posted",
        "Game-by-game performance",
        "Time slot performance",
        "Full session history",
      ],
    },
    why: "Growth gets easier when you stop guessing. AltCtrl helps you see patterns, spot wins, and double down on what works.",
  },
];

export default function Features() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// SYSTEM MODULES — FULL SPEC</div>
          <GlitchText text="EVERYTHING YOU NEED TO RUN YOUR" className="text-4xl sm:text-5xl font-black uppercase text-white block" tag="h1" />
          <GlitchText text="TIKTOK LIVE GAMING GROWTH LOOP." className="text-4xl sm:text-5xl font-black uppercase text-cyan-400 block" tag="h1" />
          <p className="text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            AltCtrl is built around four core pillars: Programming, Promotion, Coaching, and Performance. Each one supports a different part of your weekly creator workflow.
          </p>
        </div>

        {/* Pillars */}
        <div className="space-y-12">
          {pillars.map((p) => (
            <div key={p.id} className="bg-[#060d1f] border border-cyan-900/30 rounded-lg overflow-hidden">
              {/* Pillar header */}
              <div className={`px-8 py-6 border-b ${p.accent === "pink" ? "border-pink-900/30" : p.accent === "yellow" ? "border-yellow-900/30" : "border-cyan-900/30"}`}>
                <div className={`text-xs font-mono uppercase tracking-widest mb-3 ${p.accent === "pink" ? "text-pink-400" : p.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>
                  // PILLAR_{p.id} — {p.label}
                </div>
                <div className="flex items-start gap-4">
                  <p.icon className={`w-8 h-8 shrink-0 mt-1 ${p.accent === "pink" ? "text-pink-400" : p.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`} />
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-white leading-tight">{p.title}</h2>
                </div>
              </div>

              {/* Pillar body */}
              <div className="px-8 py-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <p className="text-slate-300 text-sm leading-relaxed">{p.intro}</p>

                  {p.packIncludes && (
                    <div>
                      <div className={`text-xs font-mono uppercase tracking-widest mb-3 ${p.accent === "pink" ? "text-pink-400" : "text-cyan-400"}`}>{p.packIncludes.heading}</div>
                      <ul className="space-y-2">
                        {p.packIncludes.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className={`font-mono font-bold mt-0.5 ${p.accent === "pink" ? "text-pink-400" : "text-cyan-400"}`}>→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <div className={`text-xs font-mono uppercase tracking-widest mb-3 ${p.accent === "pink" ? "text-pink-400" : p.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>{p.canDo.heading}</div>
                    <ul className="space-y-2">
                      {p.canDo.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className={`font-mono font-bold mt-0.5 ${p.accent === "pink" ? "text-pink-400" : p.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>→</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={`rounded-lg p-6 flex flex-col justify-center ${p.accent === "pink" ? "bg-pink-950/20 border border-pink-900/30" : p.accent === "yellow" ? "bg-yellow-950/20 border border-yellow-900/30" : "bg-cyan-950/20 border border-cyan-900/30"}`}>
                  <div className={`text-xs font-mono uppercase tracking-widest mb-3 ${p.accent === "pink" ? "text-pink-400" : p.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>// WHY IT MATTERS</div>
                  <p className="text-slate-300 text-sm leading-relaxed">{p.why}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Closing */}
        <div className="mt-20 bg-[#060d1f] border border-cyan-900/40 rounded-lg p-10 text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// ONE SYSTEM. FOUR PILLARS. ONE REPEATABLE GROWTH LOOP.</div>
          <GlitchText text="NOT ANOTHER GENERIC CREATOR DASHBOARD." className="text-3xl sm:text-4xl font-black uppercase text-white block mb-4" tag="h2" />
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed mb-10">
            AltCtrl is a focused system built specifically for TikTok LIVE gaming creators who want to grow with more structure, better promo, and clearer feedback every week.
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
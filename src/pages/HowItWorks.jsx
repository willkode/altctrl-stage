import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Sparkles, Brain, TrendingUp, Monitor } from "lucide-react";
import GlitchText from "../components/GlitchText";

const pillars = [
  {
    num: "01",
    icon: Calendar,
    label: "PROGRAMMING",
    title: "Plan your week strategically",
    accent: "cyan",
    body: "Build a real weekly stream schedule. ALT Ctrl analyzes your past performance and recommends the best games, times, and stream types for growth. Get AI-powered plans that are built on YOUR data, not generic advice.",
    tagline: "Stop guessing what to stream next.",
  },
  {
    num: "02",
    icon: Sparkles,
    label: "PROMOTION",
    title: "Generate promo in seconds",
    accent: "pink",
    body: "Before every stream, ALT Ctrl generates a complete promo kit — hooks, captions, hashtags, and title options. No more staring at a blank screen trying to figure out what to post.",
    tagline: "Post smarter promo, get more viewers.",
  },
  {
    num: "03",
    icon: Brain,
    label: "COACHING",
    title: "Get real-time guidance while streaming",
    accent: "yellow",
    body: "The desktop app watches your stream metrics and sends you live prompts. When chat slows down, when support picks up, when viewers are about to leave — you get alerts telling you exactly what to do.",
    tagline: "Never feel lost while you\'re live again.",
  },
  {
    num: "04",
    icon: TrendingUp,
    label: "ANALYTICS",
    title: "Understand what actually works",
    accent: "cyan",
    body: "Every session is logged and analyzed. See which games, times, and tactics drive your growth. Track viewers, engagement, conversions, and retention — and get coaching on how to improve next time.",
    tagline: "Data-driven decisions beat guessing every time.",
  },
];

const accentColors = {
  cyan: { border: "border-cyan-500/30", text: "text-cyan-400", bg: "bg-cyan-500/10", glow: "rgba(0,245,255,0.08)" },
  pink: { border: "border-pink-500/30", text: "text-pink-400", bg: "bg-pink-500/10", glow: "rgba(255,0,128,0.08)" },
  yellow: { border: "border-yellow-400/30", text: "text-yellow-400", bg: "bg-yellow-400/10", glow: "rgba(234,179,8,0.08)" },
};

export default function HowItWorks() {
  return (
    <div className="min-h-screen">

      {/* ═══ HERO ═══ */}
      <section className="pt-20 pb-16 px-4 text-center" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// HOW IT WORKS</div>
          <GlitchText
            text="BEFORE, DURING, AND AFTER EVERY STREAM."
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white block leading-tight"
            tag="h1"
          />
          <p className="text-slate-400 text-base mt-6 max-w-2xl mx-auto leading-relaxed">
            ALT Ctrl is built to help you before, during, and after every stream. Instead of making you bounce between random tools, it brings everything together so your setup, your stream, and your growth all work as one system.
          </p>
        </div>
      </section>

      {/* ═══ THE THREE TOOLS ═══ */}
      <section className="py-16 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// THE ECOSYSTEM</div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white">Web App + Desktop App + Chrome Extension</h2>
            <p className="text-slate-400 text-sm mt-4 max-w-2xl mx-auto">Three tools working together to cover every part of your streaming journey.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Web App */}
            <div className="bg-[#060d1f] border border-cyan-500/30 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4">
                <span className="text-cyan-400 font-black">🌐</span>
              </div>
              <h3 className="text-lg font-black uppercase text-cyan-400 mb-3">Web App</h3>
              <p className="text-sm text-slate-400 mb-3">Plan, promote, and analyze — all in your browser.</p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>✓ Weekly stream planning</li>
                <li>✓ AI promo generation</li>
                <li>✓ Performance analytics</li>
                <li>✓ Coaching insights</li>
              </ul>
            </div>

            {/* Desktop App */}
            <div className="bg-[#060d1f] border border-pink-500/30 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                <span className="text-pink-400 font-black">🖥️</span>
              </div>
              <h3 className="text-lg font-black uppercase text-pink-400 mb-3">Desktop App</h3>
              <p className="text-sm text-slate-400 mb-3">Real-time coaching while you stream.</p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>✓ Live metrics dashboard</li>
                <li>✓ Smart coaching alerts</li>
                <li>✓ Chat & viewer tracking</li>
                <li>✓ Stream control center</li>
              </ul>
            </div>

            {/* Chrome Extension */}
            <div className="bg-[#060d1f] border border-yellow-500/30 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4">
                <span className="text-yellow-400 font-black">⚙️</span>
              </div>
              <h3 className="text-lg font-black uppercase text-yellow-400 mb-3">Chrome Extension</h3>
              <p className="text-sm text-slate-400 mb-3">Automatically capture complete session data.</p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>✓ Auto session logging</li>
                <li>✓ Viewer metrics capture</li>
                <li>✓ Engagement tracking</li>
                <li>✓ Data sync to dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOUR PILLARS ═══ */}
      <section className="py-16 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-4xl mx-auto space-y-6">
          {pillars.map((p) => {
            const c = accentColors[p.accent];
            const Icon = p.icon;
            return (
              <div key={p.num} className={`rounded-xl border ${c.border} bg-[#060d1f] overflow-hidden`}>
                <div className="flex flex-col md:flex-row">
                  {/* Left accent strip */}
                  <div className={`flex flex-row md:flex-col items-center justify-center gap-3 px-6 py-5 md:py-8 ${c.bg}`}>
                    <span className={`text-3xl font-black ${c.text} opacity-30`}>{p.num}</span>
                    <Icon className={`w-6 h-6 ${c.text}`} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8">
                    <div className={`text-[10px] font-mono uppercase tracking-widest ${c.text} mb-2`}>// {p.label}</div>
                    <h2 className="text-xl md:text-2xl font-black uppercase text-white mb-3">{p.title}</h2>
                    <p className="text-sm text-slate-400 font-mono leading-relaxed mb-3">{p.body}</p>
                    <p className={`text-sm font-bold ${c.text}`}>{p.tagline}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ IN SIMPLE TERMS ═══ */}
      <section className="py-16 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// IN SIMPLE TERMS</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              { text: "Programming: Plan your week", accent: "cyan" },
              { text: "Promotion: Generate promo kits", accent: "pink" },
              { text: "Coaching: Get live guidance", accent: "yellow" },
              { text: "Analytics: Learn from every stream", accent: "cyan" },
            ].map((item, i) => (
              <div key={i} className={`rounded-xl border ${accentColors[item.accent].border} bg-[#060d1f] p-4 flex flex-col items-center text-center gap-2`}>
                <span className={`text-lg font-black ${accentColors[item.accent].text}`}>0{i + 1}</span>
                <span className="text-xs text-slate-300 font-mono leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-8">
            <h3 className="text-lg font-black uppercase text-white mb-5">THAT IS THE WHOLE IDEA</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Go live with a plan.",
                "Get help while you stream.",
                "Learn from every session.",
                "Come back stronger next time.",
              ].map((line, i) => (
                <div key={i} className="flex items-center gap-3 bg-cyan-500/5 border border-cyan-900/30 rounded-lg px-4 py-3">
                  <span className="text-cyan-400 font-mono font-bold text-sm shrink-0">→</span>
                  <span className="text-sm text-slate-300 font-mono">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,0,128,0.15) 0%, rgba(20,10,60,0.8) 40%, rgba(0,40,100,0.8) 100%)", backgroundColor: "#05070f" }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <GlitchText text="RUN YOUR STREAMS" className="text-3xl sm:text-4xl font-black uppercase text-white block mb-1" tag="h2" />
          <GlitchText text="LIKE YOU MEAN IT." className="text-3xl sm:text-4xl font-black uppercase text-pink-400 block mb-6" tag="h2" />
          <p className="text-slate-400 max-w-xl mx-auto text-sm mb-8">Join the early creators building with ALT Ctrl.</p>
          <Link to="/waitlist"
            className="inline-flex items-center gap-2 font-black uppercase tracking-widest px-10 py-5 rounded text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 40px rgba(0,245,255,0.7)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(0,245,255,0.4)"}>
            GET EARLY ACCESS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
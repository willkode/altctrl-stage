import { Link } from "react-router-dom";
import { ArrowRight, Zap, Target, Radio, TrendingUp, Brain } from "lucide-react";
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";

const features = [
  { icon: Target, label: "PLAN", title: "Tactical Week Planning", desc: "Map your streams like missions. Set goals, assign themes, build consistency.", accent: "cyan" },
  { icon: Radio, label: "PROMOTE", title: "AI Promo Generation", desc: "Auto-generate captions, hooks, and thumbnails before every stream.", accent: "pink" },
  { icon: Zap, label: "GO LIVE", title: "Pre-Stream Command Check", desc: "System-check your setup, goals, and promo before you hit go live.", accent: "cyan" },
  { icon: TrendingUp, label: "LEARN", title: "Performance Intelligence", desc: "Track what actually works. Real analytics, not vanity numbers.", accent: "pink" },
  { icon: Brain, label: "COACH", title: "AI Coaching Engine", desc: "Personalized strategy based on your real performance data.", accent: "yellow" },
];

const stats = [
  { value: "10K+", label: "CREATORS WAITLISTED" },
  { value: "4X", label: "AVG GROWTH BOOST" },
  { value: "< 5MIN", label: "DAILY TIME INVESTMENT" },
  { value: "#1", label: "TIKTOK LIVE GAMING OS" },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[80px]" />
          {/* Decorative particles */}
          <div className="absolute top-20 left-12 w-1 h-8 bg-cyan-400/20" />
          <div className="absolute top-32 left-20 w-8 h-1 bg-cyan-400/20" />
          <div className="absolute bottom-40 right-16 w-2 h-2 border border-pink-500/30 rotate-45" />
          <div className="absolute top-60 right-32 w-1 h-1 bg-yellow-400/40 rounded-full" />
          <div className="absolute bottom-60 left-32 w-3 h-3 border border-cyan-500/20" />
          {/* Glitch bars */}
          <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
          <div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/5 rounded px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">// TRANSMISSION ACTIVE — BETA RECRUITING NOW</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tight mb-6">
            <GlitchText text="THE AI OS" className="text-white block" tag="span" />
            <span className="block text-cyan-400 mt-1">FOR TIKTOK LIVE</span>
            <span className="block text-white mt-1">GAMING CREATORS</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-4 leading-relaxed">
            Plan your week. Generate promo before every stream. Track what actually works. Get coaching based on your real performance — not generic advice.
          </p>

          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            {["PLAN", "→", "PROMOTE", "→", "GO LIVE", "→", "LEARN"].map((step, i) => (
              <span key={i} className={`text-sm font-mono font-bold uppercase ${step === "→" ? "text-slate-700" : "text-white"}`}>{step}</span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/waitlist" className="inline-flex items-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest px-8 py-4 rounded text-sm hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(0,245,255,0.5)] transition-all">
              JOIN THE WAITLIST <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/founding-creators" className="inline-flex items-center gap-2 border border-pink-500/60 text-pink-400 font-black uppercase tracking-widest px-8 py-4 rounded text-sm hover:border-pink-400 hover:shadow-[0_0_20px_rgba(255,0,128,0.2)] transition-all">
              FOUNDING CREATOR DEAL
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-cyan-900/40 bg-[#060d1f] py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 tabular-nums">{s.value}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// SYSTEM MODULES</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white">
              EVERY TOOL A GAMING<br /><span className="text-cyan-400">CREATOR NEEDS</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <NeonCard key={i} accent={f.accent} className="group">
                <div className={`text-xs font-mono uppercase tracking-widest mb-3 ${f.accent === "pink" ? "text-pink-400" : f.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>
                  // MODULE_{String(i + 1).padStart(2, "0")} — {f.label}
                </div>
                <f.icon className={`w-6 h-6 mb-3 ${f.accent === "pink" ? "text-pink-400" : f.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`} />
                <h3 className="text-white font-black uppercase text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </NeonCard>
            ))}
            <NeonCard accent="pink" className="md:col-span-2 lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// SIGNAL LOCKED</div>
                <h3 className="text-white font-black uppercase text-2xl mb-3">READY TO<br />LEVEL UP?</h3>
                <p className="text-slate-400 text-sm">Stop streaming blind. Start operating like a pro.</p>
              </div>
              <Link to="/waitlist" className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-pink-400 hover:text-pink-300 transition-colors">
                GET EARLY ACCESS <ArrowRight className="w-4 h-4" />
              </Link>
            </NeonCard>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/3 to-transparent" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// LIMITED SLOTS — FOUNDING CREATORS</div>
          <GlitchText text="CLAIM YOUR SPOT" className="text-4xl sm:text-6xl font-black uppercase text-white block mb-4" tag="h2" />
          <p className="text-slate-400 mb-8">Founding Creator pricing locks in forever. No upsells. No bait-and-switch. Just tools that work.</p>
          <Link to="/founding-creators" className="inline-flex items-center gap-2 bg-pink-500 text-white font-black uppercase tracking-widest px-10 py-4 rounded text-sm hover:bg-pink-400 hover:shadow-[0_0_40px_rgba(255,0,128,0.4)] transition-all">
            VIEW FOUNDING CREATOR DEAL <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
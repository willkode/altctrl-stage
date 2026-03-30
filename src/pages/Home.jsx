import { Link } from "react-router-dom";
import { ArrowRight, Zap, Target, Radio, TrendingUp, Brain } from "lucide-react";
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";
import SpeedLines from "../components/SpeedLines";
import GeometricParticles from "../components/GeometricParticles";

const features = [
  { icon: Target, label: "PLAN", title: "Tactical Week Planning", desc: "Map your streams like missions. Set goals, assign themes, build consistency.", accent: "cyan", img: "https://media.base44.com/images/public/69ca96fae50d535312ca1505/d8baad480_generated_image.png" },
  { icon: Radio, label: "PROMOTE", title: "AI Promo Generation", desc: "Auto-generate captions, hooks, and thumbnails before every stream.", accent: "pink", img: "https://media.base44.com/images/public/69ca96fae50d535312ca1505/31f00f203_generated_image.png" },
  { icon: Zap, label: "GO LIVE", title: "Pre-Stream Command Check", desc: "System-check your setup, goals, and promo before you hit go live.", accent: "cyan", img: "https://media.base44.com/images/public/69ca96fae50d535312ca1505/35e612bf0_generated_image.png" },
  { icon: TrendingUp, label: "LEARN", title: "Performance Intelligence", desc: "Track what actually works. Real analytics, not vanity numbers.", accent: "pink", img: "https://media.base44.com/images/public/69ca96fae50d535312ca1505/77d1f47ba_generated_image.png" },
  { icon: Brain, label: "COACH", title: "AI Coaching Engine", desc: "Personalized strategy based on your real performance data.", accent: "yellow", img: "https://media.base44.com/images/public/69ca96fae50d535312ca1505/2e0b7cdf3_generated_image.png" },
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
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, #0a1628 0%, #020408 100%)" }}>

        {/* Animated speed lines background */}
        <SpeedLines />

        {/* Geometric floating particles */}
        <GeometricParticles />

        {/* Vignette edges */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, #020408 100%)"
        }} />

        {/* Left magenta bloom */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-96 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at left, rgba(255,0,128,0.12) 0%, transparent 70%)" }} />
        {/* Right cyan bloom */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-96 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at right, rgba(0,245,255,0.08) 0%, transparent 70%)" }} />

        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(0,245,255,0.04) 0%, transparent 70%)" }} />

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 py-12 rounded-xl" style={{ background: "rgba(2,4,8,0.65)", backdropFilter: "blur(8px)" }}>
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 border border-cyan-500/40 bg-[#020408]/70 rounded px-4 py-2 mb-10 backdrop-blur-sm">
            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ boxShadow: "0 0 8px #ff0080" }} />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">// TRANSMISSION ACTIVE — BETA RECRUITING NOW</span>
          </div>

          {/* Hero headline */}
          <div className="mb-2">
            <span className="block text-xs font-mono uppercase tracking-[0.3em] text-pink-400 mb-4">YOUR AI-POWERED OPERATING SYSTEM</span>
          </div>

          <h1 className="font-black uppercase leading-none tracking-tight mb-6">
            <GlitchText
              text="THE AI OS"
              className="block text-white"
              tag="span"
              style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
            />
            <span
              className="block mt-1"
              style={{
                fontSize: "clamp(3rem, 10vw, 7rem)",
                color: "#00f5ff",
                textShadow: "0 0 30px rgba(0,245,255,0.6), 0 0 60px rgba(0,245,255,0.3)",
              }}
            >
              FOR TIKTOK LIVE
            </span>
            <span
              className="block mt-1 text-white"
              style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
            >
              GAMING CREATORS
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-5 leading-relaxed">
            Plan your week. Generate promo before every stream. Track what actually works. Get coaching based on your real performance — not generic advice.
          </p>

          {/* Flow steps */}
          <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
            {["PLAN", "→", "PROMOTE", "→", "GO LIVE", "→", "LEARN"].map((step, i) => (
              <span
                key={i}
                className="text-sm font-mono font-bold uppercase"
                style={step !== "→" ? { color: "#fff", textShadow: "0 0 10px rgba(0,245,255,0.4)" } : { color: "#1a3040" }}
              >
                {step}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/waitlist"
              className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)",
                color: "#020408",
                boxShadow: "0 0 20px rgba(0,245,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 40px rgba(0,245,255,0.7), inset 0 1px 0 rgba(255,255,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(0,245,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"}
            >
              JOIN THE WAITLIST <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/founding-creators"
              className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all border"
              style={{
                borderColor: "rgba(255,0,128,0.6)",
                color: "#ff0080",
                background: "rgba(255,0,128,0.05)",
                boxShadow: "0 0 15px rgba(255,0,128,0.1)",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 25px rgba(255,0,128,0.3)"; e.currentTarget.style.borderColor = "#ff0080"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 15px rgba(255,0,128,0.1)"; e.currentTarget.style.borderColor = "rgba(255,0,128,0.6)"; }}
            >
              FOUNDING CREATOR DEAL
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #020408)" }} />
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section className="relative border-y overflow-hidden" style={{ height: 150, borderColor: "rgba(0,245,255,0.15)", background: "linear-gradient(90deg, rgba(255,0,128,0.05) 0%, rgba(0,245,255,0.05) 50%, rgba(255,0,128,0.05) 100%)", backgroundColor: "#050b18" }}>
        {/* Horizontal accent line top */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #ff0080, #00f5ff, #ff0080, transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #00f5ff, #ff0080, #00f5ff, transparent)" }} />

        <div className="max-w-5xl mx-auto px-4 h-full flex items-center"><div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div
                className="text-3xl sm:text-4xl font-black tabular-nums"
                style={{ color: i % 2 === 0 ? "#00f5ff" : "#ff0080", textShadow: i % 2 === 0 ? "0 0 20px rgba(0,245,255,0.5)" : "0 0 20px rgba(255,0,128,0.5)" }}
              >
                {s.value}
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div></div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="py-24 px-4 relative" style={{ backgroundColor: "#020408" }}>
        {/* Subtle horizontal streaks behind section */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          {[15, 35, 55, 75].map((top, i) => (
            <div key={i} className="absolute h-px" style={{
              top: `${top}%`, left: "5%", right: "5%",
              background: i % 2 === 0 ? "linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)" : "linear-gradient(90deg, transparent, rgba(255,0,128,0.3), transparent)"
            }} />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "#00f5ff" }}>// SYSTEM MODULES</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white">
              EVERY TOOL A GAMING<br />
              <span style={{ color: "#00f5ff", textShadow: "0 0 20px rgba(0,245,255,0.4)" }}>CREATOR NEEDS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <NeonCard key={i} accent={f.accent} className="group overflow-hidden !p-0">
                {/* Card image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={f.img}
                    alt={f.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Glitch overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 60%)", mixBlendMode: "normal" }} />
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(180deg, transparent 40%, rgba(6,13,31,0.95) 100%)" }} />
                  {/* Module label on image */}
                  <div className={`absolute top-3 left-3 text-xs font-mono uppercase tracking-widest ${f.accent === "pink" ? "text-pink-400" : f.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>
                    // MODULE_{String(i + 1).padStart(2, "0")} — {f.label}
                  </div>
                </div>
                {/* Card content */}
                <div className="p-5">
                  <f.icon className={`w-5 h-5 mb-2 ${f.accent === "pink" ? "text-pink-400" : f.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`} />
                  <h3 className="text-white font-black uppercase text-base mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </NeonCard>
            ))}

            {/* CTA card with magenta gradient */}
            <div
              className="rounded-lg p-6 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,0,128,0.15) 0%, rgba(100,0,60,0.1) 100%)",
                border: "1px solid rgba(255,0,128,0.4)",
                boxShadow: "0 0 20px rgba(255,0,128,0.08)"
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(255,0,128,0.15) 0%, transparent 70%)" }} />
              <div>
                <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "#ff0080" }}>// SIGNAL LOCKED</div>
                <h3 className="text-white font-black uppercase text-2xl mb-3 leading-tight">READY TO<br />LEVEL UP?</h3>
                <p className="text-slate-400 text-sm">Stop streaming blind. Start operating like a pro.</p>
              </div>
              <Link
                to="/waitlist"
                className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-colors"
                style={{ color: "#ff0080" }}
              >
                GET EARLY ACCESS <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BANNER CTA ──────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Mesh/grid background like image 3 */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, rgba(255,0,128,0.2) 0%, rgba(20,10,60,0.8) 40%, rgba(0,40,100,0.8) 100%)",
          backgroundColor: "#05070f",
        }} />
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,0,128,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,128,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: "perspective(400px) rotateX(15deg)",
          transformOrigin: "center top",
        }} />
        {/* Glow overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 80% at 20% 50%, rgba(255,0,128,0.15) 0%, transparent 60%)"
        }} />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "#ff0080" }}>// LIMITED SLOTS — FOUNDING CREATORS</div>
            <GlitchText text="CLAIM YOUR SPOT" className="text-4xl sm:text-5xl font-black uppercase text-white block mb-4" tag="h2" />
            <p className="text-slate-300 max-w-md">Founding Creator pricing locks in forever. No upsells. No bait-and-switch. Just tools that work.</p>
          </div>
          <div className="shrink-0">
            <Link
              to="/founding-creators"
              className="inline-flex items-center gap-2 font-black uppercase tracking-widest px-8 py-5 rounded text-sm transition-all text-white border border-white/30"
              style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            >
              VIEW FOUNDING DEAL <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
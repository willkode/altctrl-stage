import { Link } from "react-router-dom";
import { ArrowRight, Zap, Sparkles, Brain, TrendingUp } from "lucide-react";
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";
import SeatCounter from "../components/SeatCounter";
import SpeedLines from "../components/SpeedLines";
import GeometricParticles from "../components/GeometricParticles";
import TopGamesGrid from "../components/TopGamesGrid";

const loopSteps = [
{
  label: "PLAN",
  title: "Build your weekly stream calendar with games, formats, and target times.",
  accent: "cyan"
},
{
  label: "PROMOTE",
  title: "Generate a full promo pack before every stream — hooks, captions, hashtags, and title ideas.",
  accent: "pink"
},
{
  label: "GO LIVE",
  title: "Show up with a plan instead of going live on a whim.",
  accent: "cyan"
},
{
  label: "LEARN",
  title: "Log the session, review the data, and get smarter recommendations for what to do next.",
  accent: "pink"
}];


const pillars = [
{ label: "Dashboard" },
{ label: "Schedule" },
{ label: "Promo" },
{ label: "Analytics" },
{ label: "Coach" }];


export default function Home() {
  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, #0a1628 0%, #020408 100%)" }}>
        <SpeedLines />
        <GeometricParticles />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, #020408 100%)" }} />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-96 pointer-events-none" style={{ background: "radial-gradient(ellipse at left, rgba(255,0,128,0.12) 0%, transparent 70%)" }} />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-96 pointer-events-none" style={{ background: "radial-gradient(ellipse at right, rgba(0,245,255,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(0,245,255,0.04) 0%, transparent 70%)" }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-cyan-500/40 bg-[#020408]/70 rounded px-4 py-2 mb-10 backdrop-blur-sm">
            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ boxShadow: "0 0 8px #ff0080" }} />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">// TRANSMISSION ACTIVE — BETA RECRUITING NOW</span>
          </div>

          <h1 className="font-black uppercase leading-none tracking-tight mb-6">
            <GlitchText
              text="STOP GUESSING."
              className="block text-white"
              tag="span"
              style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }} />
            
            <span className="block mt-1" style={{ fontSize: "clamp(3rem, 10vw, 7rem)", color: "#00f5ff", textShadow: "0 0 30px rgba(0,245,255,0.6), 0 0 60px rgba(0,245,255,0.3)" }}>
              START GROWING.
            </span>
          </h1>

          <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-4 leading-relaxed font-semibold">
            AltCtrl is the AI-powered operating system for TikTok LIVE gaming creators.
          </p>
          <p className="text-slate-400 text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Plan your week. Generate promo before every stream. Track what actually works. Get coaching based on your real performance — not generic creator advice.
          </p>

          <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
            {["PLAN", "→", "PROMOTE", "→", "GO LIVE", "→", "LEARN"].map((step, i) =>
            <span key={i} className="text-sm font-mono font-bold uppercase"
            style={step === "→" ? { color: "#ff0080", textShadow: "0 0 10px rgba(255,0,128,0.5)" } : { color: "#fff", textShadow: "0 0 10px rgba(0,245,255,0.4)" }}>
                {step}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/waitlist"
            className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
              GET EARLY ACCESS <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/how-it-works"
            className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all active:scale-95 border"
            style={{ borderColor: "rgba(255,0,128,0.6)", color: "#ff0080", background: "rgba(255,0,128,0.05)", boxShadow: "0 0 15px rgba(255,0,128,0.1)" }}>
              SEE HOW IT WORKS
            </Link>
          </div>

          {/* Subheadline */}
          

          
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #020408)" }} />
      </section>

      {/* ── LIVE STATS PREVIEW ────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// SEE YOUR DATA IN REAL TIME</div>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">Track everything that matters — viewers, engagement, conversions, and more. Every session is analyzed so you can learn what actually works.</p>
          </div>
          <div className="rounded-xl overflow-hidden border border-cyan-900/30 shadow-2xl" style={{ boxShadow: "0 0 40px rgba(0,245,255,0.15)" }}>
            <img 
              src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/4fd0ea8e8_Screenshot2026-04-06124632.png" 
              alt="Live stream stats dashboard" 
              loading="lazy" 
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// WHAT WE BUILT FOR YOU</div>
            <GlitchText text="EVERYTHING YOU NEED TO GROW" className="text-4xl sm:text-5xl font-black uppercase text-white block" tag="h2" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Programming */}
            <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-900/10 border border-cyan-500/30 rounded-xl p-8 hover:border-cyan-400/50 transition-all">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-xl font-black uppercase text-cyan-400 mb-3">Programming</h3>
              <p className="text-sm text-slate-400 mb-4">Strategic stream planning built on your data.</p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>✓ Weekly AI-generated plans</li>
                <li>✓ Game & timing recommendations</li>
                <li>✓ Growth bottleneck analysis</li>
              </ul>
            </div>

            {/* Promotion */}
            <div className="bg-gradient-to-br from-pink-900/30 to-pink-900/10 border border-pink-500/30 rounded-xl p-8 hover:border-pink-400/50 transition-all">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="text-xl font-black uppercase text-pink-400 mb-3">Promotion</h3>
              <p className="text-sm text-slate-400 mb-4">AI-generated promo kits ready to post.</p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>✓ Auto-generated hooks & captions</li>
                <li>✓ Hashtag suggestions</li>
                <li>✓ Multiple title options</li>
              </ul>
            </div>

            {/* Coaching */}
            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 border border-yellow-500/30 rounded-xl p-8 hover:border-yellow-400/50 transition-all">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4">
                <Brain className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-xl font-black uppercase text-yellow-400 mb-3">Coaching</h3>
              <p className="text-sm text-slate-400 mb-4">Real-time AI guidance during your streams.</p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>✓ Live performance alerts</li>
                <li>✓ Proactive action suggestions</li>
                <li>✓ Daily coaching focus cards</li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-500/30 rounded-xl p-8 hover:border-purple-400/50 transition-all">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-black uppercase text-purple-400 mb-3">Analytics</h3>
              <p className="text-sm text-slate-400 mb-4">Deep insights into your streaming patterns.</p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>✓ Session breakdowns & trends</li>
                <li>✓ Viewer retention metrics</li>
                <li>✓ Best & worst moment analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE LOOP ──────────────────────────────────────────── */}
      <section className="py-24 px-4 relative" style={{ backgroundColor: "#050b18" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          {[15, 35, 55, 75].map((top, i) =>
          <div key={i} className="absolute h-px" style={{
            top: `${top}%`, left: "5%", right: "5%",
            background: i % 2 === 0 ? "linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)" : "linear-gradient(90deg, transparent, rgba(255,0,128,0.3), transparent)"
          }} />
          )}
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// THE LOOP THAT DRIVES GROWTH</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4">THE BEST CREATORS DON'T RELY ON<br /><span style={{ color: "#00f5ff" }}>RANDOM MOMENTUM.</span></h2>
            <p className="text-slate-400">They follow a repeatable system.</p>
          </div>

          <div className="mb-10 rounded-lg overflow-hidden border border-pink-900/40">
            <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/66b12d939_generated_image.png" alt="Cyberpunk stream schedule" loading="lazy" className="w-full object-cover" style={{ maxHeight: '340px' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {loopSteps.map((step, i) =>
            <NeonCard key={i} accent={step.accent}>
                <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${step.accent === "pink" ? "text-pink-400" : "text-cyan-400"}`}>// {step.label}</div>
                <p className="text-slate-300 text-sm leading-relaxed">{step.title}</p>
              </NeonCard>
            )}
          </div>

          <div className="text-center">
            <p className="text-slate-500 font-mono text-sm">Then repeat it next week — better than the last.</p>
          </div>
        </div>
      </section>

      {/* ── WHAT ALTCTRL HELPS YOU DO ─────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// WHAT ALTCTRL HELPS YOU DO</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white">TURN RANDOM EFFORT INTO<br /><span style={{ color: "#00f5ff" }}>REPEATABLE GROWTH.</span></h2>
          </div>

          <div className="mb-10 rounded-lg overflow-hidden border border-cyan-900/40">
            <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/5636d4034_generated_image.png" alt="AI promo generator" loading="lazy" className="w-full object-cover" style={{ maxHeight: '340px' }} />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <NeonCard accent="pink">
              <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// MOST CREATORS</div>
              <div className="space-y-3">
                {[
                "Stream inconsistently",
                "Forget to post promo",
                "Choose games based on instinct",
                "Review analytics too late or not at all",
                "Set goals without a real system to hit them"].
                map((item, i) =>
                <div key={i} className="flex items-start gap-3">
                    <span className="text-red-500/60 font-mono font-bold text-sm mt-0.5">✕</span>
                    <span className="text-slate-500 text-sm">{item}</span>
                  </div>
                )}
              </div>
            </NeonCard>

            <NeonCard accent="cyan">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// ALTCTRL GIVES YOU</div>
              <div className="space-y-3">
                {[
                "A weekly schedule",
                "A pre-stream promo workflow",
                "Session logging and performance tracking",
                "Daily coaching",
                "Weekly planning and recap tools"].
                map((item, i) =>
                <div key={i} className="flex items-start gap-3">
                    <span className="text-cyan-400 font-mono font-bold text-sm mt-0.5">✓</span>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                )}
              </div>
            </NeonCard>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm max-w-xl mx-auto">It is the difference between hoping a stream does well and understanding why it does.</p>
          </div>
        </div>
      </section>

      {/* ── CONTROL CENTER ────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// YOUR CREATOR CONTROL CENTER</div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4">ALTCTRL IS ORGANIZED AROUND<br /><span style={{ color: "#00f5ff" }}>FIVE CORE AREAS.</span></h2>
          <p className="text-slate-400 mb-10 text-sm">Everything is designed to move you through the same growth loop every week, with less friction and more clarity.</p>
          <div className="mb-10 rounded-lg overflow-hidden border border-cyan-900/40">
            <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/513ee106b_generated_image.png" alt="AltCtrl control center" loading="lazy" className="w-full object-cover" style={{ maxHeight: '340px' }} />
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {pillars.map((p, i) =>
            <div key={i} className="bg-[#060d1f] border border-cyan-900/40 rounded-lg px-6 py-4 text-white font-black uppercase tracking-widest text-sm hover:border-cyan-500/60 hover:text-cyan-400 transition-all">
                {p.label}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── DESKTOP APP ───────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// MEET THE ALTCTRL DESKTOP APP</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-3">
              YOUR LIVE<br /><span style={{ color: "#ff0080" }}>CONTROL CENTER.</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Real-time coaching alerts, live metrics, chat integration, and performance tracking — everything you need to stream smarter.
            </p>
          </div>

          {/* Three-panel layout */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {/* Left: Coaching Alerts */}
            <div className="rounded-xl overflow-hidden border border-pink-900/30" style={{ boxShadow: "0 0 30px rgba(255,0,128,0.1)" }}>
              <img
                src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/b002991e6_Screenshot2026-04-03163007.png"
                alt="Live coaching alerts"
                loading="lazy"
                className="w-full object-cover"
              />
            </div>

            {/* Center: Main Dashboard */}
            <div className="rounded-xl overflow-hidden border border-cyan-900/30" style={{ boxShadow: "0 0 30px rgba(0,245,255,0.1)" }}>
              <img
                src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/3c23be18b_Screenshot2026-04-04155001.png"
                alt="Live dashboard"
                loading="lazy"
                className="w-full object-cover"
              />
            </div>

            {/* Right: Metrics Grid */}
            <div className="rounded-xl overflow-hidden border border-purple-900/30" style={{ boxShadow: "0 0 30px rgba(168,85,247,0.1)" }}>
              <img
                src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/b747aff2f_Screenshot2026-04-05142629.png"
                alt="Live metrics"
                loading="lazy"
                className="w-full object-cover"
              />
            </div>
          </div>

          {/* Description below */}
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-2">// COACHING</div>
              <p className="text-sm text-slate-400">Smart alerts tell you exactly when and what to do — chat pace, viewer retention, engagement opportunities.</p>
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">// LIVE CONTROL</div>
              <p className="text-sm text-slate-400">Run your stream, monitor chat, track gifts and follows in real-time. One dashboard, everything you need.</p>
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-2">// METRICS</div>
              <p className="text-sm text-slate-400">View every important stat at a glance — viewers, engagement, conversions, retention. Know your numbers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERIOUS CREATORS ──────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// BUILT FOR SERIOUS TIKTOK LIVE GAMING CREATORS</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4">FOR CREATORS WHO TREAT STREAMING<br /><span style={{ color: "#00f5ff" }}>LIKE SOMETHING THEY'RE BUILDING.</span></h2>
          </div>

          <div className="mb-10 rounded-lg overflow-hidden border border-pink-900/40">
            <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/a96fc884f_generated_image.png" alt="TikTok live gaming stream" loading="lazy" className="w-full object-cover" style={{ maxHeight: '340px' }} />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-slate-400 mb-6 text-sm leading-relaxed">Whether you are trying to:</p>
              <div className="space-y-3">
                {[
                "Grow your follower count",
                "Increase average viewers",
                "Improve consistency",
                "Build a stronger community",
                "Make streaming feel more like a real business"].
                map((item, i) =>
                <div key={i} className="flex items-start gap-3">
                    <span className="text-cyan-400 font-mono font-bold text-sm mt-0.5">→</span>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-[#060d1f] border border-pink-900/40 rounded-lg p-8">
              <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// THE SYSTEM BEHIND THE STREAM</div>
              <p className="text-slate-300 leading-relaxed text-sm">AltCtrl gives you the system behind the stream — not just for the creators who already have it figured out, but for the ones still building toward it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP GAMES ────────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-4">// POPULAR GAMES IN OUR LIBRARY</div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-3">What Are Creators<br /><span style={{ color: "#a855f7" }}>Streaming Right Now?</span></h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">See trending games and get AI insights on how they perform for creators like you.</p>
          </div>
          <TopGamesGrid />
          <div className="text-center mt-10">
            <Link to="/popular-tiktok-games"
              className="inline-flex items-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)", color: "white", boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}>
              VIEW FULL LIBRARY <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, rgba(255,0,128,0.2) 0%, rgba(20,10,60,0.8) 40%, rgba(0,40,100,0.8) 100%)",
          backgroundColor: "#05070f"
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,0,128,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,128,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: "perspective(400px) rotateX(15deg)",
          transformOrigin: "center top"
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 20% 50%, rgba(255,0,128,0.15) 0%, transparent 60%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <GlitchText text="YOUR STREAM DESERVES MORE" className="text-4xl sm:text-5xl font-black uppercase text-white block mb-2" tag="h2" />
          <GlitchText text="THAN GUESSWORK." className="text-4xl sm:text-5xl font-black uppercase text-pink-400 block mb-6" tag="h2" />
          <p className="text-slate-300 max-w-xl mx-auto mb-8">Join the early creators building with AltCtrl.</p>
          {/* Seat counter */}
          <div className="mb-10">
            <SeatCounter compact />
          </div>
          <Link to="/waitlist"
          className="inline-flex items-center gap-2 font-black uppercase tracking-widest px-10 py-5 rounded text-sm transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}>
            GET EARLY ACCESS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>);

}
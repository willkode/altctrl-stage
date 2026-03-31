import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";
import SpeedLines from "../components/SpeedLines";
import GeometricParticles from "../components/GeometricParticles";

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
            style={step !== "→" ? { color: "#fff", textShadow: "0 0 10px rgba(0,245,255,0.4)" } : { color: "#1a3040" }}>
                {step}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/waitlist"
            className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 40px rgba(0,245,255,0.7), inset 0 1px 0 rgba(255,255,255,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 0 20px rgba(0,245,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"}>
              GET EARLY ACCESS <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/how-it-works"
            className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all border"
            style={{ borderColor: "rgba(255,0,128,0.6)", color: "#ff0080", background: "rgba(255,0,128,0.05)", boxShadow: "0 0 15px rgba(255,0,128,0.1)" }}
            onMouseEnter={(e) => {e.currentTarget.style.boxShadow = "0 0 25px rgba(255,0,128,0.3)";e.currentTarget.style.borderColor = "#ff0080";}}
            onMouseLeave={(e) => {e.currentTarget.style.boxShadow = "0 0 15px rgba(255,0,128,0.1)";e.currentTarget.style.borderColor = "rgba(255,0,128,0.6)";}}>
              SEE HOW IT WORKS
            </Link>
          </div>

          {/* Subheadline */}
          

          
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #020408)" }} />
      </section>

      {/* ── BUILT FOR THE CREATOR ─────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// BUILT FOR THE CREATOR BEHIND THE STREAM</div>
            <GlitchText text="YOU ALREADY KNOW HOW TO GO LIVE." className="text-4xl sm:text-5xl font-black uppercase text-white block mb-3" tag="h2" />
            <p className="text-2xl font-black uppercase text-cyan-400">WHAT YOU NEED IS A BETTER SYSTEM AROUND IT.</p>
          </div>

          <div className="mb-10 rounded-lg overflow-hidden border border-cyan-900/40">
            <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/03c7c7659_generated_image.png" alt="Cyberpunk gaming setup" className="w-full object-cover" style={{ maxHeight: '380px' }} />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              {[
              "Build a real weekly stream schedule",
              "Generate pre-stream promo in seconds",
              "Log performance after every session",
              "See which games, times, and habits actually grow your account",
              "Get coaching that tells you what to do next"].
              map((item, i) =>
              <div key={i} className="flex items-start gap-3">
                  <span className="text-cyan-400 font-mono font-bold text-sm mt-0.5">→</span>
                  <span className="text-slate-300 text-base">{item}</span>
                </div>
              )}
            </div>
            <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8">
              <p className="text-slate-400 leading-relaxed text-sm">
                No team. No manager. No guessing. Just a smarter way to run your stream.
              </p>
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
            <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/66b12d939_generated_image.png" alt="Cyberpunk stream schedule" className="w-full object-cover" style={{ maxHeight: '340px' }} />
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
            <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/5636d4034_generated_image.png" alt="AI promo generator" className="w-full object-cover" style={{ maxHeight: '340px' }} />
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
            <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/513ee106b_generated_image.png" alt="AltCtrl control center" className="w-full object-cover" style={{ maxHeight: '340px' }} />
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

      {/* ── SERIOUS CREATORS ──────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// BUILT FOR SERIOUS TIKTOK LIVE GAMING CREATORS</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4">FOR CREATORS WHO TREAT STREAMING<br /><span style={{ color: "#00f5ff" }}>LIKE SOMETHING THEY'RE BUILDING.</span></h2>
          </div>

          <div className="mb-10 rounded-lg overflow-hidden border border-pink-900/40">
            <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/a96fc884f_generated_image.png" alt="TikTok live gaming stream" className="w-full object-cover" style={{ maxHeight: '340px' }} />
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
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-pink-400 mb-6">THAN GUESSWORK.</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-10">Join the early creators building with AltCtrl.</p>
          <Link to="/waitlist"
          className="inline-flex items-center gap-2 font-black uppercase tracking-widest px-10 py-5 rounded text-sm transition-all"
          style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 40px rgba(0,245,255,0.7)"}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 0 20px rgba(0,245,255,0.4)"}>
            GET EARLY ACCESS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>);

}
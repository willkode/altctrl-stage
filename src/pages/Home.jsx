import { Link } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlitchText from "../components/GlitchText";
import SpeedLines from "../components/SpeedLines";
import GeometricParticles from "../components/GeometricParticles";

const PLATFORMS = ["TikTok Live", "Twitch", "YouTube Live"];

const PROBLEMS = [
  "when viewers are about to drop off",
  "when it is the right time to re-engage the audience",
  "what actually caused growth in a stream",
  "why one stream performed better than another",
  "how to turn more viewers into followers, supporters, and repeat fans",
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Plan your stream",
    accent: "cyan",
    body: "Use the web app to schedule upcoming streams, choose your game, set the stream type, duration, and challenge mode, and generate AI-powered stream titles. You can also build a full weekly plan with AI recommendations based on your goals, schedule, and past performance.",
    bullets: ["Stream scheduling with game & format", "AI-generated stream titles", "Weekly AI growth plans"],
  },
  {
    num: "02",
    title: "Get coached live",
    accent: "pink",
    body: "During your stream, the desktop coach tracks your session in real time and watches for important changes.",
    bullets: ["Viewer spikes and drops", "Chat slowing down", "Supporter momentum", "Monetization opportunities", "Early retention problems", "Engagement trends"],
  },
  {
    num: "03",
    title: "Improve after every stream",
    accent: "yellow",
    body: "When your stream ends, your session data is synced and analyzed by our AI systems.",
    bullets: ["Deep performance breakdowns", "Audience behavior insights", "Promo impact analysis", "Game and content comparisons", "Personalized next-stream recommendations"],
  },
];

const DESKTOP_METRICS = [
  "Current and peak viewers",
  "Viewer trends and drop-off signals",
  "Audience retention",
  "Chat activity and silence periods",
  "Unique chatters",
  "Follows, shares, likes, and gifts",
  "Supporter momentum",
  "Engagement score",
  "Stream state changes",
  "Stream health — bitrate, frames, latency",
];

const WEB_FEATURES = [
  { label: "Scheduling", desc: "Plan streams with game, time, type, duration, recurring support, challenge mode, and pre-stream checklists.", accent: "cyan" },
  { label: "Analytics", desc: "Track total sessions, average and peak viewers, trend charts, game performance, session history, audience growth, conversion data, and best times to stream.", accent: "cyan" },
  { label: "Strategy", desc: "Get AI-generated weekly plans, per-stream playbooks, bottleneck diagnosis, experiments tracking, and challenge ideas tailored to your content.", accent: "pink" },
  { label: "Promo", desc: "Generate promo kits for every stream with hooks, captions, hashtags, and title options optimized for your platform and tone.", accent: "pink" },
  { label: "Coaching", desc: "See daily coaching cards, weekly recaps, goals, alert feedback, and live coach performance.", accent: "yellow" },
  { label: "Post-Stream Review", desc: "Review session notes, replay notes, and AI-generated debriefs that explain what happened and what to do next.", accent: "yellow" },
  { label: "Game Intel", desc: "Use a searchable game library with genres, stream styles, challenge potential, and game context.", accent: "cyan" },
  { label: "Audience & Monetization", desc: "Understand return viewers, follower conversion, share rates, gift behavior, and supporter concentration so you know what is actually driving growth.", accent: "pink" },
];

const RESULTS = [
  "Keep viewers engaged longer",
  "Reduce drop-off early in the stream",
  "Increase follower conversion",
  "Improve audience loyalty",
  "Spot monetization windows",
  "Understand what games and stream types perform best",
  "Turn every stream into better strategy for the next one",
];

const WHY_BULLETS = [
  "When your stream is heating up",
  "When your audience is drifting away",
  "What content holds attention",
  "What drives follows, shares, and gifts",
  "What to improve next time",
];

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

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-pink-500/40 bg-[#020408]/70 rounded px-4 py-2 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ boxShadow: "0 0 8px #ff0080" }} />
            <span className="text-xs font-mono uppercase tracking-widest text-pink-400">// NOW LIVE — $25/MO</span>
          </div>

          <h1 className="font-black uppercase leading-none tracking-tight mb-6">
            <span className="block text-white" style={{ fontSize: "clamp(2.2rem, 7vw, 5rem)" }}>Your AI Coach for</span>
            <GlitchText
              text="Live Streaming"
              className="block"
              tag="span"
              style={{ fontSize: "clamp(2.8rem, 9vw, 6.5rem)", color: "#00f5ff", textShadow: "0 0 30px rgba(0,245,255,0.6), 0 0 60px rgba(0,245,255,0.3)" }}
            />
          </h1>

          <p className="text-slate-200 text-xl max-w-2xl mx-auto mb-4 leading-relaxed font-semibold">
            Grow your audience, keep viewers engaged, and stream with more confidence.
          </p>
          <p className="text-slate-400 text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            ALT Ctrl is an AI-powered live stream coach built for creators on TikTok, Twitch, and YouTube Live. It learns your streaming style, your gaming style, and how your audience responds in real time, then gives you smart alerts during your stream to help you stay engaging, build momentum, and monetize better.
          </p>

          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400/70 mb-8">
            Stream smarter. Grow faster. Stay in control.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <button
              onClick={() => base44.auth.redirectToLogin("/app/dashboard")}
              className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}>
              Start Free <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/how-it-works"
              className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all active:scale-95 border"
              style={{ borderColor: "rgba(255,0,128,0.6)", color: "#ff0080", background: "rgba(255,0,128,0.05)", boxShadow: "0 0 15px rgba(255,0,128,0.1)" }}>
              See How It Works
            </Link>
          </div>

          {/* Trusted Platforms */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-4">Built for the platforms creators actually use</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {PLATFORMS.map(p => (
                <div key={p} className="px-5 py-2.5 bg-[#060d1f] border border-cyan-900/40 rounded-lg text-sm font-black uppercase tracking-widest text-slate-300">
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #020408)" }} />
      </section>

      {/* ── PROBLEM ───────────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// THE PROBLEM</div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-6">
            Most streamers are guessing<br /><span style={{ color: "#ff0080" }}>while they are live</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            You are trying to entertain, read chat, react to the game, keep energy high, and grow your channel all at the same time. That is a lot to manage in the moment.
          </p>
          <p className="text-slate-500 text-sm font-mono uppercase tracking-widest mb-6">Most creators do not know:</p>
          <div className="space-y-3 text-left max-w-lg mx-auto mb-10">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-500/60 shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">{p}</span>
              </div>
            ))}
          </div>
          <div className="inline-block bg-gradient-to-r from-cyan-950/40 to-[#060d1f] border border-cyan-500/30 rounded-xl px-8 py-4">
            <p className="text-cyan-400 font-black uppercase tracking-widest text-sm">ALT Ctrl changes that.</p>
          </div>
        </div>
      </section>

      {/* ── MAIN VALUE ────────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// THE SOLUTION</div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-6">
            ALT Ctrl gives you an AI coach<br /><span style={{ color: "#00f5ff" }}>during your stream</span><br />and a strategy engine after it ends
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mt-10 text-left">
            <div className="bg-[#060d1f] border border-cyan-500/20 rounded-xl p-7">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// During your stream</div>
              <p className="text-slate-300 text-sm leading-relaxed">
                ALT Ctrl watches for live audience changes, engagement shifts, and momentum spikes. It sends personalized alerts to help you react at the right moment.
              </p>
            </div>
            <div className="bg-[#060d1f] border border-pink-500/20 rounded-xl p-7">
              <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// After your stream ends</div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Your data is synced to our web platform where our AI analyzes performance, finds patterns, surfaces what worked, and gives you personalized recommendations for your next stream.
              </p>
            </div>
          </div>
          <p className="text-slate-500 font-mono text-sm mt-8">The more you stream, the smarter ALT Ctrl gets.</p>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// HOW IT WORKS</div>
            <GlitchText text="THREE STEPS." className="text-4xl sm:text-5xl font-black uppercase text-white block mb-2" tag="h2" />
            <p className="text-slate-500 text-sm">Plan, get coached, improve. Every stream.</p>
          </div>
          <div className="space-y-6">
            {HOW_STEPS.map((step, i) => {
              const accentColor = step.accent === "cyan" ? "#00f5ff" : step.accent === "pink" ? "#ff0080" : "#facc15";
              const borderColor = step.accent === "cyan" ? "border-cyan-500/20" : step.accent === "pink" ? "border-pink-500/20" : "border-yellow-500/20";
              const labelColor = step.accent === "cyan" ? "text-cyan-400" : step.accent === "pink" ? "text-pink-400" : "text-yellow-400";
              return (
                <div key={i} className={`bg-[#060d1f] border ${borderColor} rounded-xl p-8`}>
                  <div className="flex items-start gap-6">
                    <div className="shrink-0 text-5xl font-black" style={{ color: accentColor, opacity: 0.3, lineHeight: 1 }}>{step.num}</div>
                    <div className="flex-1">
                      <div className={`text-xs font-mono uppercase tracking-widest ${labelColor} mb-2`}>// STEP {step.num}</div>
                      <h3 className="text-xl font-black uppercase text-white mb-3">{step.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">{step.body}</p>
                      <div className="grid sm:grid-cols-2 gap-1.5">
                        {step.bullets.map((b, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <Check className={`w-3.5 h-3.5 shrink-0 ${labelColor}`} />
                            <span className="text-slate-400 text-xs">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DESKTOP APP ───────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// DESKTOP APP</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4">
              A live coach that reacts<br /><span style={{ color: "#ff0080" }}>as your stream changes</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              ALT Ctrl is not just another dashboard. It is an active coaching system built for live creators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <div className="rounded-xl overflow-hidden border border-pink-900/30" style={{ boxShadow: "0 0 30px rgba(255,0,128,0.1)" }}>
              <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/b002991e6_Screenshot2026-04-03163007.png" alt="Live coaching alerts" loading="lazy" className="w-full object-cover" />
            </div>

            <div className="rounded-xl overflow-hidden border border-purple-900/30" style={{ boxShadow: "0 0 30px rgba(168,85,247,0.1)" }}>
              <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/b747aff2f_Screenshot2026-04-05142629.png" alt="Live metrics" loading="lazy" className="w-full object-cover" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">The desktop coach tracks what is happening during your stream in real time, including:</p>
              <div className="grid grid-cols-1 gap-2">
                {DESKTOP_METRICS.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span className="text-slate-300 text-sm">{m}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#060d1f] border border-pink-500/20 rounded-xl p-8">
              <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// Why this matters</div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                This lets ALT Ctrl detect the moments that matter while you are still live, not after the stream is already over.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Instead of making you guess, it helps you respond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WEB APP ───────────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// WEB PLATFORM</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4">
              Everything feeds into a<br /><span style={{ color: "#00f5ff" }}>powerful web platform</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">After each stream session, ALT Ctrl turns your live data into clear strategy.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WEB_FEATURES.map((f, i) => {
              const labelColor = f.accent === "cyan" ? "text-cyan-400" : f.accent === "pink" ? "text-pink-400" : "text-yellow-400";
              const borderColor = f.accent === "cyan" ? "border-cyan-900/30" : f.accent === "pink" ? "border-pink-900/30" : "border-yellow-900/30";
              return (
                <div key={i} className={`bg-[#060d1f] border ${borderColor} rounded-xl p-5`}>
                  <div className={`text-[10px] font-mono uppercase tracking-widest ${labelColor} mb-2`}>// {f.label}</div>
                  <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 rounded-xl overflow-hidden border border-cyan-900/30 shadow-2xl" style={{ boxShadow: "0 0 40px rgba(0,245,255,0.08)" }}>
            <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/4fd0ea8e8_Screenshot2026-04-06124632.png" alt="AltCtrl web dashboard" loading="lazy" className="w-full object-cover" />
          </div>
        </div>
      </section>

      {/* ── RESULTS ───────────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-4">// RESULTS</div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4">
            Built to help creators get better<br /><span style={{ color: "#facc15" }}>at the numbers that matter</span>
          </h2>
          <p className="text-slate-400 text-sm mb-10">ALT Ctrl is designed to help you:</p>
          <div className="space-y-3 text-left max-w-lg mx-auto mb-10">
            {RESULTS.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm">{r}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#060d1f] border border-yellow-500/20 rounded-xl p-6">
            <p className="text-slate-300 text-sm mb-1 font-semibold">This is not generic advice.</p>
            <p className="text-yellow-400 font-black uppercase tracking-widest text-sm">This is coaching built from your real stream data.</p>
          </div>
        </div>
      </section>

      {/* ── PERSONALIZATION ───────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// PERSONALIZATION</div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-6">
            AI that learns<br /><span style={{ color: "#ff0080" }}>your style</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">No two streamers are the same.</p>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            ALT Ctrl learns how you stream, how your audience responds, what games you play, what content creates momentum, and where your sessions tend to lose energy.
          </p>
          <div className="bg-[#060d1f] border border-pink-500/20 rounded-xl p-7 text-left">
            <p className="text-slate-300 text-sm mb-2">That means your coaching is not one-size-fits-all.</p>
            <p className="text-pink-400 font-black uppercase tracking-widest text-sm">It becomes more personalized with every stream.</p>
          </div>
        </div>
      </section>

      {/* ── WHY ALT CTRL ──────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// WHY CREATORS USE ALT CTRL</div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4">
            Because going live should not<br /><span style={{ color: "#00f5ff" }}>feel like guessing</span>
          </h2>
          <p className="text-slate-400 text-sm mb-10">ALT Ctrl helps you understand:</p>
          <div className="space-y-3 text-left max-w-lg mx-auto mb-10">
            {WHY_BULLETS.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-cyan-400 font-mono font-bold text-sm mt-0.5">→</span>
                <span className="text-slate-300 text-sm">{b}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-sm">It gives you the kind of feedback most streamers never get until it is too late.</p>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="relative py-28 px-4 overflow-hidden">
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
          <GlitchText text="STOP GUESSING." className="text-4xl sm:text-5xl font-black uppercase text-white block mb-2" tag="h2" />
          <h2 className="text-4xl sm:text-5xl font-black uppercase mb-6" style={{ color: "#00f5ff" }}>Start streaming with an AI coach.</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-4 text-sm leading-relaxed">
            ALT Ctrl helps creators on TikTok, Twitch, and YouTube Live stay engaging, grow faster, and monetize smarter with real-time coaching and AI-powered post-stream insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button onClick={() => base44.auth.redirectToLogin("/app/dashboard")}
              className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-10 py-5 rounded text-sm transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}>
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/how-it-works"
              className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-10 py-5 rounded text-sm transition-all active:scale-95 border"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff", background: "rgba(255,255,255,0.05)" }}>
              See the Platform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
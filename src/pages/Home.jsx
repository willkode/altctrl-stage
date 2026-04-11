import { useState } from "react";
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
    title: "Sign up & download the desktop app",
    accent: "cyan",
    body: "Create your free account on the web platform, then download and install the ALT Ctrl Desktop App for your PC or Mac. The desktop app is what monitors your live stream in real time — it's the engine that powers the coaching.",
    bullets: ["Free account — no credit card to start", "Desktop app for PC & Mac", "Quick 2-minute setup", "Connects to TikTok, Twitch, or YouTube Live"],
  },
  {
    num: "02",
    title: "Plan your stream",
    accent: "pink",
    body: "Use the web app to schedule upcoming streams, choose your game, set the stream type, duration, and challenge mode, and generate AI-powered stream titles. You can also build a full weekly plan with AI recommendations based on your goals, schedule, and past performance.",
    bullets: ["Stream scheduling with game & format", "AI-generated stream titles", "Weekly AI growth plans", "Pre-stream checklists"],
  },
  {
    num: "03",
    title: "Get coached live",
    accent: "yellow",
    body: "During your stream, the desktop coach tracks your session in real time and watches for important changes — then sends you smart, personalized alerts so you can react while you're still live.",
    bullets: ["Viewer spikes and drops", "Chat slowing down", "Supporter momentum", "Monetization opportunities", "Early retention problems", "Engagement trends"],
  },
  {
    num: "04",
    title: "Improve after every stream",
    accent: "cyan",
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

const DASH_TABS = ["Overview", "Analytics", "Sessions", "Audience", "Game Intel"];

const TAB_CONTENT = {
  Overview: (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Avg Viewers", value: "267", accent: "text-cyan-400", sub: "+12% vs last week" },
          { label: "Peak Viewers", value: "412", accent: "text-pink-400", sub: "Warzone stream" },
          { label: "Followers Gained", value: "+341", accent: "text-green-400", sub: "This month" },
          { label: "Streams", value: "14", accent: "text-yellow-400", sub: "Last 30 days" },
        ].map((s, i) => (
          <div key={i} className="bg-[#060d1f] border border-white/[0.04] rounded-xl p-4">
            <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">{s.label}</div>
            <div className={`text-2xl font-black ${s.accent}`}>{s.value}</div>
            <div className="text-[10px] text-slate-600 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#060d1f] border border-cyan-900/20 rounded-xl p-4">
        <div className="text-[10px] font-mono uppercase text-cyan-400 mb-3">// Viewer Trend — Last 14 Streams</div>
        <div className="flex items-end gap-1.5 h-16">
          {[140,180,220,190,267,300,280,310,267,350,290,380,340,412].map((v, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${(v / 412) * 100}%`, background: i === 13 ? "#00f5ff" : "rgba(0,245,255,0.25)" }} />
          ))}
        </div>
      </div>
      <div className="bg-[#060d1f] border border-yellow-500/20 rounded-xl p-4">
        <div className="text-[10px] font-mono uppercase text-yellow-400 mb-2">// Today's Stream</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">Warzone — Challenge Mode</div>
            <div className="text-[10px] font-mono text-slate-500">Tonight 7:00 PM · 90 min</div>
          </div>
          <div className="flex gap-2">
            <span className="text-[9px] font-mono uppercase px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">Checklist</span>
            <span className="text-[9px] font-mono uppercase px-2 py-1 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400">Promo</span>
          </div>
        </div>
      </div>
    </div>
  ),
  Analytics: (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Best Day", value: "Tuesday", accent: "text-cyan-400" },
          { label: "Best Time", value: "7–9 PM", accent: "text-pink-400" },
          { label: "Best Game", value: "Warzone", accent: "text-yellow-400" },
        ].map((s, i) => (
          <div key={i} className="bg-[#060d1f] border border-white/[0.04] rounded-xl p-4 text-center">
            <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">{s.label}</div>
            <div className={`text-sm font-black ${s.accent}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#060d1f] border border-cyan-900/20 rounded-xl p-4">
        <div className="text-[10px] font-mono uppercase text-cyan-400 mb-3">// Game Performance</div>
        <div className="space-y-2">
          {[
            { game: "Warzone", avg: 312, pct: 100 },
            { game: "Apex Legends", avg: 267, pct: 86 },
            { game: "Fortnite", avg: 198, pct: 63 },
            { game: "Valorant", avg: 154, pct: 49 },
          ].map((g, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{g.game}</span>
                <span className="text-cyan-400 font-bold">{g.avg} avg</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full"><div className="h-full bg-cyan-400 rounded-full" style={{ width: `${g.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#060d1f] border border-pink-900/20 rounded-xl p-4">
        <div className="text-[10px] font-mono uppercase text-pink-400 mb-2">// Promo Impact</div>
        <div className="flex gap-6">
          <div><div className="text-[9px] font-mono text-slate-600">With Promo</div><div className="text-lg font-black text-pink-400">+38%</div><div className="text-[9px] text-slate-600">avg viewers</div></div>
          <div><div className="text-[9px] font-mono text-slate-600">Without Promo</div><div className="text-lg font-black text-slate-400">baseline</div><div className="text-[9px] text-slate-600">avg viewers</div></div>
        </div>
      </div>
    </div>
  ),
  Sessions: (
    <div className="p-5 space-y-3">
      <div className="text-[10px] font-mono uppercase text-cyan-400 mb-2">// Recent Sessions</div>
      {[
        { game: "Warzone", date: "Apr 9", viewers: 412, follows: 124, duration: "90m", accent: "cyan" },
        { game: "Apex Legends", date: "Apr 7", viewers: 280, follows: 67, duration: "75m", accent: "pink" },
        { game: "Warzone", date: "Apr 5", viewers: 310, follows: 88, duration: "60m", accent: "cyan" },
        { game: "Fortnite", date: "Apr 3", viewers: 198, follows: 34, duration: "45m", accent: "yellow" },
      ].map((s, i) => (
        <div key={i} className="bg-[#060d1f] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white">{s.game}</div>
            <div className="text-[10px] font-mono text-slate-500">{s.date} · {s.duration}</div>
          </div>
          <div className="flex gap-4 text-center">
            <div><div className="text-sm font-black text-cyan-400">{s.viewers}</div><div className="text-[9px] font-mono text-slate-600">peak</div></div>
            <div><div className="text-sm font-black text-pink-400">+{s.follows}</div><div className="text-[9px] font-mono text-slate-600">follows</div></div>
          </div>
        </div>
      ))}
    </div>
  ),
  Audience: (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Follow Rate", value: "8.4%", accent: "text-pink-400" },
          { label: "Return Viewers", value: "34%", accent: "text-cyan-400" },
          { label: "Gift Rate", value: "2.1%", accent: "text-yellow-400" },
          { label: "Share Rate", value: "5.7%", accent: "text-green-400" },
        ].map((s, i) => (
          <div key={i} className="bg-[#060d1f] border border-white/[0.04] rounded-xl p-4">
            <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">{s.label}</div>
            <div className={`text-2xl font-black ${s.accent}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#060d1f] border border-cyan-900/20 rounded-xl p-4">
        <div className="text-[10px] font-mono uppercase text-cyan-400 mb-3">// Viewer Retention by Minute</div>
        <div className="flex items-end gap-1 h-12">
          {[100,94,88,82,79,74,72,70,68,65,62,58,54,50,47,43,40,38,36,35].map((v, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${v}%`, background: `rgba(0,245,255,${0.15 + (v/100)*0.6})` }} />
          ))}
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1"><span>0 min</span><span>10 min</span><span>20 min</span></div>
      </div>
    </div>
  ),
  "Game Intel": (
    <div className="p-5 space-y-3">
      <div className="text-[10px] font-mono uppercase text-yellow-400 mb-2">// Game Library</div>
      {[
        { game: "Warzone", genre: "Battle Royale", score: 94, challenge: "High", style: "Competitive" },
        { game: "Apex Legends", genre: "Battle Royale", score: 88, challenge: "High", style: "Competitive" },
        { game: "Fortnite", genre: "Battle Royale", score: 82, challenge: "Medium", style: "Variety" },
        { game: "Valorant", genre: "FPS", score: 79, challenge: "High", style: "Competitive" },
      ].map((g, i) => (
        <div key={i} className="bg-[#060d1f] border border-white/[0.04] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-bold text-white">{g.game}</div>
              <div className="text-[10px] font-mono text-slate-500">{g.genre}</div>
            </div>
            <div className="text-lg font-black text-yellow-400">{g.score}</div>
          </div>
          <div className="flex gap-2">
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400">Challenge: {g.challenge}</span>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">{g.style}</span>
          </div>
        </div>
      ))}
    </div>
  ),
};

function DashboardMockup() {
  const [activeTab, setActiveTab] = useState("Overview");
  return (
    <div className="mt-10 rounded-2xl overflow-hidden border border-cyan-900/30" style={{ boxShadow: "0 0 40px rgba(0,245,255,0.08)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#060d1f] border-b border-white/[0.04]">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">// AltCtrl Dashboard</span>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
      </div>
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.04] bg-[#02040f] overflow-x-auto">
        {DASH_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-[10px] font-mono uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab ? "border-cyan-400 text-cyan-400" : "border-transparent text-slate-600 hover:text-slate-400"
            }`}>
            {tab}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="bg-[#02040f] min-h-[320px]">
        {TAB_CONTENT[activeTab]}
      </div>
    </div>
  );
}

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
            <GlitchText text="FOUR STEPS." className="text-4xl sm:text-5xl font-black uppercase text-white block mb-2" tag="h2" />
            <p className="text-slate-500 text-sm">Sign up, plan, get coached, improve. Every stream.</p>
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


          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">Tracks in real time and alerts you when key events happen so that you can engage with your top viewers and keep the chat active.</p>
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
            <div className="rounded-xl overflow-hidden border border-pink-900/30" style={{ boxShadow: "0 0 30px rgba(255,0,128,0.1)" }}>
              <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/36ca61455_image.png" alt="AltCtrl Desktop App" loading="lazy" className="w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROMO ────────────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// PROMO KITS</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4">
              Promote every stream<br /><span style={{ color: "#ff0080" }}>without the creative block</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Before you go live, ALT Ctrl generates a ready-to-post promo kit tailored to your game, tone, and platform. No copy-pasting from templates. No guessing what to write. Just one click and you have everything you need to drive viewers to your stream before it even starts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Left: mockup */}
            <div className="bg-[#02040f] border border-pink-900/30 rounded-2xl overflow-hidden" style={{ boxShadow: "0 0 40px rgba(255,0,128,0.08)" }}>
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3 bg-[#060d1f] border-b border-white/[0.04]">
                <span className="text-xs font-mono uppercase tracking-widest text-pink-400">// Promo Kit Generator</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <div className="p-5 space-y-4">
                {/* Stream info bar */}
                <div className="flex items-center justify-between bg-[#060d1f] border border-white/[0.04] rounded-xl px-4 py-3">
                  <div>
                    <div className="text-xs font-bold text-white">Warzone — Challenge Mode</div>
                    <div className="text-xs font-mono text-slate-500">Tonight 7:00 PM · 90 min</div>
                  </div>
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">Generate Kit</span>
                </div>

                {/* Hook */}
                <div className="bg-[#060d1f] border border-pink-500/20 rounded-xl p-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-2">// Hook</div>
                  <p className="text-white text-sm font-semibold leading-relaxed">"Going live in 30 min — Warzone no-fill challenge. Can I hit 10 kills solo? Come watch me fail or feast 🔥"</p>
                </div>

                {/* Caption */}
                <div className="bg-[#060d1f] border border-cyan-500/20 rounded-xl p-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">// Caption</div>
                  <p className="text-slate-300 text-sm leading-relaxed">No squad. No mercy. Tonight I'm running solo no-fill on Warzone and setting myself a challenge — 10 kills or I switch games live. Drop in at 7PM and hold me accountable 👀</p>
                </div>

                {/* Hashtags */}
                <div className="bg-[#060d1f] border border-yellow-500/20 rounded-xl p-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-2">// Hashtags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["#warzone","#warzonelivechallenge","#fps","#gamerlive","#tiktoklive","#challenge","#codwarzone","#battleroyal"].map(h => (
                      <span key={h} className="text-xs font-mono px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">{h}</span>
                    ))}
                  </div>
                </div>

                {/* Title options */}
                <div className="bg-[#060d1f] border border-white/[0.04] rounded-xl p-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">// Stream Title Options</div>
                  <div className="space-y-2">
                    {[
                      "Solo No-Fill Challenge — 10 Kill Goal 🎯",
                      "Warzone Solo Only — Can I Carry? 🔥",
                      "No Squad No Problem — Warzone Challenge Mode",
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-slate-300 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                        <span className="text-xs font-mono text-slate-600">{i + 1}.</span> {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: why it matters */}
            <div className="space-y-6">
              <div className="bg-[#060d1f] border border-pink-500/20 rounded-xl p-7">
                <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// Why it matters</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  Streams with promo posted beforehand consistently outperform those that go live cold. But most creators skip it because writing promo content takes time and mental energy they don't have before a stream.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  ALT Ctrl removes that friction. The kit is built from your game, your stream type, your tone settings, and your schedule — so it always sounds like you, not a generic template.
                </p>
              </div>

              <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-7 space-y-4">
                <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// What's in every kit</div>
                {[
                  { label: "Hook", desc: "A short punchy line built for TikTok, Twitter, or Discord — designed to stop scrollers.", accent: "pink" },
                  { label: "Caption", desc: "A full post caption with context, your challenge or goal, and a CTA.", accent: "cyan" },
                  { label: "Hashtags", desc: "Optimized tag set for discoverability based on your game and stream type.", accent: "yellow" },
                  { label: "Title Options", desc: "3 stream title variations you can use directly in your live setup.", accent: "pink" },
                ].map((f, i) => {
                  const labelColor = f.accent === "cyan" ? "text-cyan-400" : f.accent === "pink" ? "text-pink-400" : "text-yellow-400";
                  return (
                    <div key={i} className="flex gap-3">
                      <span className={`text-xs font-mono uppercase shrink-0 w-20 ${labelColor} mt-0.5`}>{f.label}</span>
                      <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  );
                })}
              </div>
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
          <DashboardMockup />
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

      {/* ── COACH MOCKUP ──────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// AI COACHING IN ACTION</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4">
              AI that learns<br /><span style={{ color: "#ff0080" }}>your style</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">No two streamers are the same. Your coaching gets more personalized with every stream.</p>
          </div>

          {/* Mockup */}
          <div className="bg-[#02040f] border border-cyan-900/30 rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: "0 0 60px rgba(0,245,255,0.08)" }}>
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-[#060d1f]">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: "0 0 6px #4ade80" }} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-green-400">Live — 47 min</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs font-black text-cyan-400">312</div>
                  <div className="text-[9px] font-mono text-slate-600">viewers</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-black text-yellow-400">↑18%</div>
                  <div className="text-[9px] font-mono text-slate-600">momentum</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-black text-pink-400">84</div>
                  <div className="text-[9px] font-mono text-slate-600">score</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-0 divide-x divide-white/[0.04]">
              {/* Left: Coaching Alerts */}
              <div className="p-5 space-y-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-pink-400 mb-3">// Coaching Alerts</div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400">Engagement Drop</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">Chat has been quiet for 3 min. Try asking viewers a question or call out a username in chat.</p>
                  <p className="text-[10px] font-mono text-slate-600 mt-2">47:12 into stream</p>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Momentum Rising</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">Viewers up 22% in the last 5 min. This is your window — push engagement and thank new followers.</p>
                  <p className="text-[10px] font-mono text-slate-600 mt-2">42:05 into stream</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-green-400">Reintroduce Stream</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">You're at 30 min — new viewers don't know what you're doing. Give a quick intro and shoutout your goal.</p>
                  <p className="text-[10px] font-mono text-slate-600 mt-2">30:00 into stream</p>
                </div>
              </div>

              {/* Center: Daily Coaching Card + Goals */}
              <div className="p-5 space-y-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">// Today's Focus</div>
                <div className="bg-gradient-to-br from-cyan-950/40 to-[#060d1f] border border-cyan-500/20 rounded-xl p-5">
                  <div className="text-xs font-black uppercase text-white mb-2">Push Follow Conversion</div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">Your last 3 streams averaged 12 viewers who watched 10+ min but didn't follow. Try a direct follow CTA at the 20 and 40 min marks.</p>
                  <div className="flex gap-2">
                    <span className="text-[9px] font-mono uppercase px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">Conversion</span>
                    <span className="text-[9px] font-mono uppercase px-2 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">High Priority</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 mb-2">// Active Goals</div>
                <div className="space-y-2">
                  {[
                    { label: "Stream 4x this week", current: 2, target: 4, color: "cyan" },
                    { label: "Avg 280+ viewers", current: 312, target: 280, color: "green" },
                    { label: "Gain 500 followers", current: 341, target: 500, color: "pink" },
                  ].map((g, i) => {
                    const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                    const barColor = g.color === "cyan" ? "bg-cyan-400" : g.color === "green" ? "bg-green-400" : "bg-pink-400";
                    const textColor = g.color === "cyan" ? "text-cyan-400" : g.color === "green" ? "text-green-400" : "text-pink-400";
                    return (
                      <div key={i} className="bg-[#060d1f] border border-white/[0.04] rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-slate-300">{g.label}</span>
                          <span className={`text-xs font-black ${textColor}`}>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Weekly Recap */}
              <div className="p-5">
                <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 mb-3">// Weekly Recap</div>
                <div className="bg-[#060d1f] border border-yellow-500/20 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-[9px] font-mono text-slate-600">Streams</div>
                      <div className="text-lg font-black text-white">3<span className="text-xs text-slate-600">/4</span></div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-600">Avg Viewers</div>
                      <div className="text-lg font-black text-cyan-400">267</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-600">Followers</div>
                      <div className="text-lg font-black text-pink-400">+341</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-600">Top Game</div>
                      <div className="text-sm font-black text-yellow-400">Warzone</div>
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <div className="text-[9px] font-mono text-slate-600 mb-1">AI Summary</div>
                    <p className="text-xs text-slate-400 leading-relaxed">Strong week. Your Warzone challenge stream outperformed your chill streams by 38%. Viewer retention improved by 12% vs last week.</p>
                  </div>
                </div>

                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-2">// Best Performing Stream</div>
                <div className="bg-[#060d1f] border border-white/[0.04] rounded-lg p-3 text-xs">
                  <div className="font-bold text-white mb-1">Warzone — Challenge Mode</div>
                  <div className="text-slate-500 font-mono">Tue · 7:00 PM · 90 min</div>
                  <div className="mt-2 flex gap-3">
                    <span className="text-cyan-400">412 peak</span>
                    <span className="text-pink-400">+124 followers</span>
                  </div>
                </div>
              </div>
            </div>
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
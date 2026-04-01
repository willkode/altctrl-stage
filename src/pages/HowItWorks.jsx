import { Link } from "react-router-dom";
import { ArrowRight, Monitor, AppWindow, Chrome, RefreshCw } from "lucide-react";
import GlitchText from "../components/GlitchText";

const pillars = [
  {
    num: "01",
    icon: AppWindow,
    label: "THE WEB APP",
    title: "Helps you get ready",
    accent: "cyan",
    body: "Before you go live, the ALT Ctrl web app helps you build a better plan. It looks at your past streams, your goals, and what has been working for your content. Then it helps shape a smarter strategy for your next live, so you are not going in blind.",
    tagline: "This is where your stream game plan lives.",
  },
  {
    num: "02",
    icon: Monitor,
    label: "THE DESKTOP APP",
    title: "Helps you while you stream",
    accent: "pink",
    body: "When it is time to go live, the ALT Ctrl Desktop App becomes your control center. This is where you run your stream, manage your setup, and get live prompts while you are streaming. It helps you stay on top of what is happening in the moment — like when chat slows down, when support starts picking up, or when it is time to pull viewers back in.",
    tagline: "So instead of guessing what to do next, you get help while you are live.",
  },
  {
    num: "03",
    icon: Chrome,
    label: "THE CHROME EXTENSION",
    title: "Captures extra stream data",
    accent: "yellow",
    body: "Some platforms do not show creators everything they need. The ALT Ctrl Chrome extension captures extra stream data and fills in important gaps, so you get a more complete picture of what really happened during your live.",
    tagline: "Better insights, better tracking, and better feedback after the stream ends.",
  },
  {
    num: "04",
    icon: RefreshCw,
    label: "THE LOOP",
    title: "Everything flows back together",
    accent: "cyan",
    body: "After your stream is over, your session data flows back into ALT Ctrl. The system looks at what happened, what worked, what did not, and what you should do differently next time. Then it uses that to improve your next strategy.",
    tagline: "So every stream helps make the next one better.",
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

      {/* ═══ SYSTEM DIAGRAM ═══ */}
      <section className="px-4 pb-16" style={{ backgroundColor: "#020408" }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl overflow-hidden border border-cyan-900/40 mb-4" style={{ boxShadow: "0 0 40px rgba(0,245,255,0.06)" }}>
            <img
              src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/395f77fb3_generated_image.png"
              alt="ALT Ctrl System Overview"
              className="w-full object-cover"
              style={{ maxHeight: "380px" }}
            />
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
              { text: "The web app helps you plan", accent: "cyan" },
              { text: "The desktop app helps you while you stream", accent: "pink" },
              { text: "The Chrome extension captures extra data", accent: "yellow" },
              { text: "ALT Ctrl brings it all together", accent: "cyan" },
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
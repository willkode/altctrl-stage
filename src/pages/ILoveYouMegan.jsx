import { Link } from "react-router-dom";
import GlitchText from "../components/GlitchText";

const Section = ({ tag, children, className = "" }) => (
  <section className={`relative py-16 md:py-24 ${className}`}>
    {tag && (
      <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400 mb-4">// {tag}</div>
    )}
    {children}
  </section>
);

const Prompt = ({ text }) => (
  <div className="flex items-start gap-3 py-3 px-4 rounded-lg bg-cyan-500/5 border border-cyan-900/40 hover:border-cyan-500/30 transition-all group">
    <span className="text-cyan-400 text-sm mt-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">▸</span>
    <p className="text-sm md:text-base text-slate-300 font-mono leading-relaxed italic">"{text}"</p>
  </div>
);

const Phase = ({ label, accent, title, body }) => {
  const colors = {
    cyan: "border-cyan-500/30 bg-cyan-500/5",
    pink: "border-pink-500/30 bg-pink-500/5",
    yellow: "border-yellow-400/30 bg-yellow-400/5",
  };
  const textColors = { cyan: "text-cyan-400", pink: "text-pink-400", yellow: "text-yellow-400" };
  return (
    <div className={`rounded-xl border ${colors[accent]} p-6 md:p-8`}>
      <div className={`text-[10px] font-mono uppercase tracking-[0.3em] ${textColors[accent]} mb-3`}>{label}</div>
      <h3 className="text-lg md:text-xl font-black uppercase text-white mb-3">{title}</h3>
      <p className="text-sm text-slate-400 font-mono leading-relaxed">{body}</p>
    </div>
  );
};

const PainPoint = ({ text }) => (
  <p className="text-sm md:text-base text-slate-400 font-mono leading-relaxed pl-4 border-l-2 border-pink-500/30">{text}</p>
);

export default function ILoveYouMegan() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">

        {/* ═══ HERO ═══ */}
        <section className="pt-24 md:pt-36 pb-16 md:pb-24 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
          <GlitchText
            text="STREAM SMARTER. GROW FASTER. STOP GOING LIVE ALONE."
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white leading-tight block max-w-3xl mx-auto"
            tag="h1"
          />
          <p className="mt-6 text-base md:text-lg text-slate-400 font-mono leading-relaxed max-w-2xl mx-auto">
            ALT Ctrl is the all-in-one system built to help streamers know what to do before, during, and after every live.
          </p>
          <p className="mt-4 text-sm text-slate-500 font-mono max-w-xl mx-auto">
            It helps you plan your stream, guides you while you are live, and shows you what actually worked when the stream ends.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/waitlist"
              className="px-8 py-4 rounded-lg bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest text-sm hover:bg-cyan-300 transition-all">
              Join the Waitlist
            </Link>
            <Link to="/founding-creators"
              className="px-8 py-4 rounded-lg border border-cyan-500/30 text-cyan-400 font-mono uppercase tracking-widest text-sm hover:bg-cyan-500/10 transition-all">
              Become a Founding Creator
            </Link>
          </div>
        </section>

        {/* ═══ SUBHEADLINE ═══ */}
        <Section tag="THE IDEA">
          <h2 className="text-xl md:text-2xl font-black uppercase text-white mb-6">
            Your stream setup, your live coach, and your growth system — all working together.
          </h2>
          <p className="text-sm text-slate-400 font-mono leading-relaxed max-w-2xl">
            Most streamers are trying to do everything at once: talk to chat, keep energy up, thank supporters, hit goals, stay entertaining, and somehow figure out what is working.
          </p>
          <p className="text-sm text-cyan-400/80 font-mono mt-4">ALT Ctrl is built to help with that.</p>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-900/40 to-transparent" />

        {/* ═══ THE PROBLEM ═══ */}
        <Section tag="THE PROBLEM">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-3">
            Going live is easy.
          </h2>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-pink-400 mb-8">
            Knowing what to do next is hard.
          </h2>
          <div className="space-y-2 mb-8">
            <p className="text-sm text-slate-400 font-mono">A lot of streamers are talented.</p>
            <p className="text-sm text-slate-400 font-mono">A lot of streamers are consistent.</p>
            <p className="text-sm text-slate-400 font-mono">A lot of streamers are putting in the hours.</p>
          </div>
          <p className="text-sm text-slate-500 font-mono mb-6">But most are still left guessing.</p>
          <div className="space-y-3 mb-8">
            <PainPoint text="When should I push chat harder?" />
            <PainPoint text="When should I thank gifters?" />
            <PainPoint text="When should I ask for shares or follows?" />
            <PainPoint text="Why did this stream do better than the last one?" />
            <PainPoint text="What should I do differently next time?" />
          </div>
          <div className="bg-pink-500/5 border border-pink-900/30 rounded-xl p-6">
            <p className="text-sm text-slate-400 font-mono leading-relaxed">
              Most tools only help you stream. They do not help you <span className="text-pink-400">improve</span>.
            </p>
            <p className="text-sm text-slate-500 font-mono mt-2">That is the problem ALT Ctrl is built to solve.</p>
          </div>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-pink-900/40 to-transparent" />

        {/* ═══ THE SOLUTION ═══ */}
        <Section tag="THE SOLUTION">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-10">
            ALT Ctrl helps you before, during, and after every stream.
          </h2>
          <div className="grid gap-4 md:gap-6">
            <Phase
              accent="cyan"
              label="Before you go live"
              title="Prepare with a clear game plan"
              body="ALT Ctrl helps you prepare based on your content, your style, and what has worked for you before."
            />
            <Phase
              accent="pink"
              label="While you are live"
              title="Real-time smart prompts"
              body="ALT Ctrl helps guide you in real time with smart on-screen prompts that tell you when to react, when to push engagement, and when to switch things up."
            />
            <Phase
              accent="yellow"
              label="After the stream ends"
              title="Know what worked and what didn't"
              body="ALT Ctrl breaks down what happened, what worked, what fell flat, and how to improve next time."
            />
          </div>
          <p className="text-sm text-cyan-400/80 font-mono mt-8 text-center">
            This is not just another dashboard. It is a system built to help streamers grow.
          </p>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-900/40 to-transparent" />

        {/* ═══ HOW IT WORKS ═══ */}
        <Section tag="HOW IT WORKS">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-3">
            One connected system
          </h2>
          <p className="text-sm text-slate-500 font-mono mb-10">that keeps getting smarter with every stream.</p>

          <div className="space-y-6">
            <HowStep number="01" title="The web app helps you plan" accent="cyan">
              This is where your stream strategy lives. It learns from your past streams and helps you figure out what works best for your content, your audience, and your goals.
            </HowStep>
            <HowStep number="02" title="The desktop app helps you while you are live" accent="pink">
              This is your live control center. It helps run the stream and gives you live prompts during the session — like when chat is slowing down, when viewers are spiking, or when it is the right time to push engagement.
            </HowStep>
            <HowStep number="03" title="The analytics side helps fill in the gaps" accent="yellow">
              Some platforms do not show creators everything they need. ALT Ctrl captures extra session data so you get a better picture of what really happened during your stream.
            </HowStep>
            <HowStep number="04" title="Then it all comes together" accent="cyan">
              After the stream, your session data flows back into ALT Ctrl so your next stream strategy is even better.
            </HowStep>
          </div>

          <p className="text-sm text-cyan-400 font-mono mt-8 text-center font-bold">
            The more you use it, the smarter it gets.
          </p>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-pink-900/40 to-transparent" />

        {/* ═══ REAL LIFE ═══ */}
        <Section tag="WHAT THIS LOOKS LIKE">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-3">
            Imagine going live and having a system that helps you in the moment.
          </h2>
          <p className="text-sm text-slate-500 font-mono mb-8">Instead of guessing, ALT Ctrl can help you with prompts like:</p>
          <div className="space-y-3">
            <Prompt text="Chat is slowing down. Ask a quick question." />
            <Prompt text="New viewers are coming in. Reintroduce what you are doing." />
            <Prompt text="Gifts are picking up. Thank them and build momentum." />
            <Prompt text="You have been talking for a while. Pull chat back in." />
            <Prompt text="This part of the stream is getting the best reaction. Stay on it." />
          </div>
          <div className="mt-8 bg-[#060d1f] border border-cyan-900/30 rounded-xl p-6 text-center">
            <p className="text-sm text-slate-400 font-mono leading-relaxed">
              It is like having a <span className="text-cyan-400 font-bold">coach built into your stream setup</span>.
            </p>
            <p className="text-xs text-slate-600 font-mono mt-2">Not to take over. Not to be annoying. Just to help you make better moves while you are live.</p>
          </div>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-900/40 to-transparent" />

        {/* ═══ WHY STREAMERS NEED THIS ═══ */}
        <Section tag="WHY THIS MATTERS">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-3">
            Because talent is not the only thing that matters.
          </h2>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {["Timing", "Energy", "Audience connection", "Momentum", "Consistency", "Knowing when to push"].map(w => (
              <div key={w} className="bg-[#060d1f] border border-cyan-900/30 rounded-lg px-4 py-3 text-center">
                <span className="text-sm font-black uppercase text-white">{w}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 font-mono mt-8">That is a lot to manage in real time.</p>
          <p className="text-sm text-cyan-400/80 font-mono mt-2">ALT Ctrl is built to make that easier.</p>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-pink-900/40 to-transparent" />

        {/* ═══ WHY WE ARE BUILDING THIS ═══ */}
        <Section tag="OUR WHY">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-6">
            We believe streamers deserve better tools.
          </h2>
          <p className="text-sm text-slate-400 font-mono leading-relaxed mb-6">
            Right now, streamers are piecing together setups from different apps, different dashboards, and disconnected data.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              "One tool helps you go live.",
              "Another shows analytics.",
              "Another helps with clipping.",
              "Another helps with ideas.",
            ].map((t, i) => (
              <div key={i} className="bg-pink-500/5 border border-pink-900/30 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-500 font-mono">{t}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400 font-mono leading-relaxed">
            But nothing ties it all together in a way that actually helps you get better every time you stream.
          </p>
          <p className="text-sm text-pink-400 font-mono mt-4">
            That is what we want ALT Ctrl to become: <span className="text-white font-bold">a real growth system for live creators.</span>
          </p>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-900/40 to-transparent" />

        {/* ═══ THE BIG VISION ═══ */}
        <Section tag="THE VISION" className="pb-24 md:pb-36">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-3">
            ALT Ctrl is not just here to help you go live.
          </h2>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-cyan-400 mb-8">
            It is here to help you become a better streamer.
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {["Prepare better", "Stream better", "Learn faster", "Grow smarter"].map(v => (
              <div key={v} className="bg-cyan-500/5 border border-cyan-500/30 rounded-lg px-4 py-5 text-center">
                <span className="text-sm font-black uppercase text-cyan-400">{v}</span>
              </div>
            ))}
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-400 font-mono">Every stream should teach you something.</p>
            <p className="text-sm text-slate-400 font-mono">Every session should make the next one better.</p>
            <p className="text-sm text-cyan-400 font-mono mt-4 font-bold">That is the future we are building.</p>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/waitlist"
              className="px-8 py-4 rounded-lg bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest text-sm hover:bg-cyan-300 transition-all text-center">
              Join the Waitlist
            </Link>
            <Link to="/founding-creators"
              className="px-8 py-4 rounded-lg border border-pink-500/30 text-pink-400 font-mono uppercase tracking-widest text-sm hover:bg-pink-500/10 transition-all text-center">
              Apply as Founding Creator
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}

function HowStep({ number, title, accent, children }) {
  const colors = { cyan: "border-cyan-500/30 text-cyan-400", pink: "border-pink-500/30 text-pink-400", yellow: "border-yellow-400/30 text-yellow-400" };
  const numColors = { cyan: "text-cyan-400/20", pink: "text-pink-400/20", yellow: "text-yellow-400/20" };
  return (
    <div className={`relative border ${colors[accent].split(" ")[0]} rounded-xl p-6 md:p-8 overflow-hidden`}>
      <span className={`absolute top-3 right-4 text-5xl font-black ${numColors[accent]} select-none`}>{number}</span>
      <h3 className={`text-lg font-black uppercase ${colors[accent].split(" ")[1]} mb-2 relative z-10`}>{title}</h3>
      <p className="text-sm text-slate-400 font-mono leading-relaxed relative z-10">{children}</p>
    </div>
  );
}
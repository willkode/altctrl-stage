import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";

const pains = [
  { before: "Streaming with no plan or structure", after: "Weekly mission board — purpose in every session" },
  { before: "Blank caption box before every stream", after: "Full promo pack generated in one click" },
  { before: "No idea why some streams hit, others flop", after: "Real data patterns — your best days, games, content" },
  { before: "Generic YouTube tips that don't apply to you", after: "Coaching brief built from your actual performance" },
  { before: "Burning out from grinding with no results", after: "Consistent system — less effort, more growth" },
];

const creatorTypes = [
  {
    type: "THE GRINDER",
    desc: "You stream 5x a week but your growth is flat. You're putting in the hours but not the system. AltCtrl turns raw effort into structured progress.",
    accent: "cyan",
  },
  {
    type: "THE INCONSISTENT",
    desc: "You go hard for two weeks then disappear. No structure means no momentum. AltCtrl's planning module keeps you locked in and consistent.",
    accent: "pink",
  },
  {
    type: "THE RISING STAR",
    desc: "You're growing but you don't know why. You need to understand what's working before you accidentally stop doing it. AltCtrl shows you the pattern.",
    accent: "yellow",
  },
  {
    type: "THE PROMO AVOIDER",
    desc: "You hate promoting. It feels cringe or takes too long. AltCtrl makes promo automatic — so you show up consistently without the mental overhead.",
    accent: "cyan",
  },
];

export default function ForCreators() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// TARGET PROFILE — IDENTIFYING OPERATOR</div>
          <GlitchText text="BUILT FOR YOU." className="text-5xl sm:text-6xl font-black uppercase text-white block" tag="h1" />
          <h1 className="text-4xl sm:text-5xl font-black uppercase text-cyan-400 mt-2">IF YOU'RE A TIKTOK LIVE<br />GAMING CREATOR.</h1>
          <p className="text-slate-400 mt-6 max-w-xl mx-auto">AltCtrl was designed from the ground up for one specific person — TikTok LIVE gaming creators who want to grow with intent.</p>
        </div>

        {/* Before / After */}
        <div className="mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6 text-center">// BEFORE ALTCTRL vs. AFTER ALTCTRL</div>
          <div className="space-y-3">
            {pains.map((p, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#060d1f] border border-red-900/30 rounded-lg px-5 py-4 flex items-start gap-3">
                  <span className="text-red-500/60 font-mono font-bold text-sm mt-0.5">✕</span>
                  <span className="text-slate-500 text-sm">{p.before}</span>
                </div>
                <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg px-5 py-4 flex items-start gap-3">
                  <span className="text-cyan-400 font-mono font-bold text-sm mt-0.5">✓</span>
                  <span className="text-slate-300 text-sm">{p.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creator profiles */}
        <div className="mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6 text-center">// WHICH TYPE ARE YOU?</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creatorTypes.map((c, i) => (
              <NeonCard key={i} accent={c.accent}>
                <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${c.accent === "pink" ? "text-pink-400" : c.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>
                  // PROFILE_{String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-white font-black uppercase text-lg mb-3">{c.type}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
              </NeonCard>
            ))}
          </div>
        </div>

        <div className="text-center">
          <GlitchText text="SOUND LIKE YOU?" className="text-3xl sm:text-4xl font-black uppercase text-white block mb-4" tag="h2" />
          <p className="text-slate-400 mb-8">AltCtrl was built for exactly this. Get on the waitlist now before beta closes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/waitlist" className="inline-flex items-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest px-8 py-4 rounded text-sm hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(0,245,255,0.5)] transition-all">
              JOIN WAITLIST <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/founding-creators" className="inline-flex items-center gap-2 border border-pink-500/60 text-pink-400 font-black uppercase tracking-widest px-8 py-4 rounded text-sm hover:border-pink-400 hover:shadow-[0_0_20px_rgba(255,0,128,0.2)] transition-all">
              FOUNDING CREATOR DEAL
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
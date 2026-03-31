import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";

const gives = [
  { label: "A PLAN", desc: "A weekly streaming calendar with real structure.", accent: "cyan" },
  { label: "BETTER PROMO", desc: "AI-generated pre-stream promo without the writing headache.", accent: "pink" },
  { label: "BETTER DECISIONS", desc: "Analytics that show what is actually helping you grow.", accent: "cyan" },
  { label: "BETTER FOCUS", desc: "Coaching that tells you what matters today and this week.", accent: "pink" },
  { label: "BETTER CONSISTENCY", desc: "A system you can follow over and over instead of reinventing your workflow every time you stream.", accent: "yellow" },
];

export default function ForCreators() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-20">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// TARGET PROFILE</div>
          <GlitchText text="BUILT FOR TIKTOK LIVE GAMING CREATORS" className="text-4xl sm:text-5xl font-black uppercase text-white block" tag="h1" />
          <GlitchText text="WHO WANT MORE THAN RANDOM GROWTH." className="text-3xl sm:text-4xl font-black uppercase text-cyan-400 block mt-2" tag="h1" />
          <p className="text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed text-sm">
            AltCtrl is for creators who are serious about streaming, but do not have a manager, agency, or full team behind them. It gives you the support system top creators rely on — without the overhead.
          </p>
        </div>

        {/* Who AltCtrl is for */}
        <div className="mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">// WHO ALTCTRL IS FOR</div>
          <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8">
            <p className="text-slate-400 text-sm mb-6">AltCtrl is designed for creators who:</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                "Stream regularly or want to",
                "Care about growth",
                "Want better consistency",
                "Want to understand their performance",
                "Are tired of vague creator advice",
                "Need a system they can actually use every week",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-cyan-400 font-mono font-bold mt-0.5">→</span>
                  {item}
                </div>
              ))}
            </div>
            <p className="text-cyan-400 text-sm font-mono border-t border-cyan-900/30 pt-6">
              // If that sounds like you, this is exactly what AltCtrl was built for.
            </p>
          </div>
        </div>

        {/* The problem */}
        <div className="mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">// THE PROBLEM</div>
          <div className="bg-[#060d1f] border border-pink-900/40 rounded-lg p-8">
            <GlitchText text="MOST CREATORS DON'T FAIL BECAUSE" className="text-2xl font-black uppercase text-white block mb-1" tag="h2" />
            <GlitchText text="THEY LACK TALENT." className="text-2xl font-black uppercase text-pink-400 block mb-6" tag="h2" />
            <p className="text-slate-400 text-sm mb-6">They stall because their workflow is broken. Maybe that looks like:</p>
            <div className="space-y-2 mb-8">
              {[
                "Streaming on random days",
                "Skipping promo",
                "Picking games off instinct",
                "Forgetting to review results",
                "Setting goals without tracking them",
                "Having good streams with no idea why they worked",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="text-red-500/60 font-mono font-bold mt-0.5">✕</span>
                  {item}
                </div>
              ))}
            </div>
            <p className="text-slate-300 text-sm border-t border-pink-900/20 pt-6">
              AltCtrl helps fix that by giving you structure <span className="text-pink-400">before</span> the stream, support <span className="text-pink-400">around</span> the stream, and insight <span className="text-pink-400">after</span> the stream.
            </p>
          </div>
        </div>

        {/* What AltCtrl gives you */}
        <div className="mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">// WHAT ALTCTRL GIVES YOU</div>
          <div className="grid sm:grid-cols-2 gap-4">
            {gives.map((g, i) => (
              <NeonCard key={i} accent={g.accent}>
                <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${g.accent === "pink" ? "text-pink-400" : g.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>
                  // {g.label}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{g.desc}</p>
              </NeonCard>
            ))}
          </div>
        </div>

        {/* What AltCtrl is not */}
        <div className="mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">// WHAT ALTCTRL IS NOT</div>
          <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8">
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                "An agency",
                "A social platform",
                "A creator marketplace",
                "A battle scheduling app",
                "A generic productivity tool",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="text-red-500/60 font-mono font-bold mt-0.5">✕</span>
                  {item}
                </div>
              ))}
            </div>
            <p className="text-slate-300 text-sm border-t border-cyan-900/20 pt-6">
              It is a personal operating system for your TikTok LIVE gaming workflow. Focused, practical, and built for repeatable growth.
            </p>
          </div>
        </div>

        {/* Serious growth */}
        <div className="mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">// IF YOU ARE TRYING TO GROW SERIOUSLY</div>
          <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8">
            <p className="text-slate-400 text-sm mb-6">AltCtrl is a fit if you want to:</p>
            <div className="space-y-3 mb-8">
              {[
                "Treat streaming like a serious growth channel",
                "Build better habits around going live",
                "Understand your numbers",
                "Stop relying on luck",
                "Create more momentum week after week",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-cyan-400 font-mono font-bold mt-0.5">→</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="border-t border-cyan-900/20 pt-6 space-y-1">
              <p className="text-white font-black uppercase text-sm">You do not need a team.</p>
              <p className="text-cyan-400 font-black uppercase text-sm">You need a better system.</p>
            </div>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="text-center bg-[#060d1f] border border-cyan-900/40 rounded-lg p-10">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// BUILT FOR THE CREATOR BEHIND THE STREAM</div>
          <GlitchText text="GET THE TOOLS, STRUCTURE, AND FEEDBACK" className="text-3xl sm:text-4xl font-black uppercase text-white block mb-2" tag="h2" />
          <GlitchText text="TO GROW WITH MORE INTENTION." className="text-3xl sm:text-4xl font-black uppercase text-cyan-400 block mb-8" tag="h2" />
          <Link to="/waitlist"
            className="inline-flex items-center gap-2 font-black uppercase tracking-widest px-10 py-5 rounded text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 40px rgba(0,245,255,0.7)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(0,245,255,0.4)"}>
            GET EARLY ACCESS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
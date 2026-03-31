import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";

const values = [
  { label: "CREATOR-FIRST", desc: "Every decision runs through one filter: does this help TikTok LIVE gaming creators grow? If not, we don't build it.", accent: "cyan" },
  { label: "REAL DATA ONLY", desc: "No generic tips. No recycled advice. AltCtrl works on your numbers — your streams, your audience, your growth.", accent: "pink" },
  { label: "SYSTEMS > HUSTLE", desc: "Grinding harder isn't the answer. Building better systems is. AltCtrl replaces random effort with structured progress.", accent: "yellow" },
  { label: "TRANSPARENT AF", desc: "We tell you what we're building, how much it costs, and what it does. No tricks, no dark patterns, no bait-and-switch.", accent: "cyan" },
];

export default function About() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// MISSION BRIEF</div>
          <GlitchText text="WHY ALTCTRL" className="text-6xl sm:text-8xl font-black uppercase text-white block" tag="h1" />
          <GlitchText text="EXISTS." className="text-4xl sm:text-5xl font-black uppercase text-cyan-400 block" tag="h1" />
        </div>

        <div className="prose-custom space-y-8 mb-16">
          <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// THE PROBLEM</div>
            <p className="text-slate-300 leading-relaxed mb-4">
              TikTok LIVE gaming creators are grinding blind. They stream without structure, promote inconsistently, and have no real idea what's working or why. The tools that exist were built for big studios or general creators — not for someone live-gaming on TikTok trying to grow a real audience.
            </p>
            <p className="text-slate-300 leading-relaxed">
              The result: massive effort, unpredictable results, constant burnout.
            </p>
          </div>

          <div className="bg-[#060d1f] border border-pink-900/40 rounded-lg p-8">
            <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// THE SOLUTION</div>
            <p className="text-slate-300 leading-relaxed mb-4">
              AltCtrl is the AI-powered operating system built specifically for TikTok LIVE gaming creators. Not a general creator tool. Not adapted from something else. Built from scratch for this specific person and this specific platform.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Plan → Promote → Go Live → Learn. The loop that turns inconsistent streamers into growing, structured creators.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6 text-center">// OPERATING VALUES</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <NeonCard key={i} accent={v.accent}>
                <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${v.accent === "pink" ? "text-pink-400" : v.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>
                  // {v.label}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{v.desc}</p>
              </NeonCard>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/waitlist" className="inline-flex items-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest px-8 py-4 rounded text-sm hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(0,245,255,0.5)] transition-all">
            JOIN THE MISSION <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
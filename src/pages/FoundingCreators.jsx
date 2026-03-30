import GlitchText from "../components/GlitchText";
import WaitlistForm from "../components/WaitlistForm";
import NeonCard from "../components/NeonCard";

const betaFeatures = [
  "Full onboarding",
  "Weekly stream scheduling",
  "Recurring stream slots",
  "Consistency tracking",
  "Promo pack generation",
  "Promo library",
  "Posted tracking",
  "Pre-stream reminders",
  "Session logging",
  "30-day performance chart",
  "Session history",
  "Daily coaching card",
  "Goals tracking",
  "Performance alerts",
  "Profile and settings controls",
];

const laterFeatures = [
  "Game breakdowns",
  "Time slot heatmaps",
  "Promo impact comparisons",
  "Weekly game plans",
  "Weekly recaps",
  "Smarter schedule recommendations",
  "Expanded notification controls",
];

export default function FoundingCreators() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-pink-500/40 bg-pink-500/5 rounded px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-pink-400">// BETA RECRUITMENT — ACTIVE</span>
          </div>
          <GlitchText text="JOIN THE FIRST WAVE OF" className="text-5xl sm:text-6xl font-black uppercase text-white block" tag="h1" />
          <h1 className="text-4xl sm:text-5xl font-black uppercase text-pink-400 mt-2">ALTCTRL CREATORS.</h1>
          <p className="text-slate-400 mt-6 max-w-2xl mx-auto text-sm leading-relaxed">
            Become a founding creator and help shape the system built for TikTok LIVE gaming growth. Get early access to AltCtrl's core features, help guide what comes next, and start building better habits before the public launch.
          </p>
        </div>

        {/* What you get in beta */}
        <div className="mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">// WHAT YOU GET IN BETA</div>
          <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8">
            <p className="text-slate-400 text-sm mb-6">Founding creators get access to AltCtrl's core foundation, including:</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {betaFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-cyan-400 font-mono font-bold mt-0.5">→</span>
                  {f}
                </div>
              ))}
            </div>
            <p className="text-xs font-mono text-slate-600 mt-6 border-t border-cyan-900/20 pt-4">// These are the must-ship features planned for the first live version of the product.</p>
          </div>
        </div>

        {/* Why join early */}
        <div className="mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">// WHY JOIN EARLY</div>
          <div className="bg-[#060d1f] border border-pink-900/40 rounded-lg p-8">
            <p className="text-white font-black uppercase text-sm mb-1">As a founding creator, you are not just getting access.</p>
            <p className="text-pink-400 font-black uppercase text-sm mb-6">You are getting in while the product is still being shaped.</p>
            <div className="space-y-3">
              {[
                "Earlier access to the system",
                "Direct influence on feedback and feature direction",
                "A chance to build your process before the broader market catches on",
                "Closer access to the team behind the product",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-pink-400 font-mono font-bold mt-0.5">→</span>
                  {item}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm mt-6 border-t border-pink-900/20 pt-6">If you want to grow with a real system, this is the best time to get in.</p>
          </div>
        </div>

        {/* Who beta is for + What is not */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <NeonCard accent="cyan">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// WHO BETA IS FOR</div>
            <p className="text-slate-400 text-sm mb-4">A strong fit for creators who:</p>
            <div className="space-y-3">
              {[
                "Stream consistently or are ready to",
                "Want a repeatable workflow",
                "Are willing to log sessions and use the system",
                "Care about growth, not just aesthetics",
                "Want to help shape a serious creator product from the beginning",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-cyan-400 font-mono font-bold mt-0.5">→</span>
                  {item}
                </div>
              ))}
            </div>
          </NeonCard>

          <NeonCard accent="pink">
            <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// WHAT COMES AFTER BETA</div>
            <p className="text-slate-400 text-sm mb-4">Phase 1 is the foundation. Later phases add deeper intelligence, including:</p>
            <div className="space-y-3">
              {laterFeatures.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-pink-400 font-mono font-bold mt-0.5">→</span>
                  {item}
                </div>
              ))}
            </div>
            <p className="text-xs font-mono text-slate-600 mt-4">// Founding creators get in at the beginning of that journey.</p>
          </NeonCard>
        </div>

        {/* Help shape */}
        <div className="mb-12 bg-[#060d1f] border border-yellow-400/20 rounded-lg p-8 text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-4">// HELP SHAPE THE CREATOR OPERATING SYSTEM</div>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed mb-2">AltCtrl is being built around a simple idea:</p>
          <p className="text-white font-black uppercase text-lg mb-4">Creators grow faster when they have a repeatable system around their streams.</p>
          <p className="text-slate-400 text-sm">If you believe that too, beta is for you.</p>
        </div>

        {/* Form */}
        <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">// APPLY FOR BETA ACCESS</div>
          <h2 className="text-2xl font-black uppercase text-white mb-6">CLAIM YOUR FOUNDING CREATOR SPOT</h2>
          <WaitlistForm source="founding-creators" founding={true} />
        </div>

        <p className="text-center text-xs font-mono text-slate-600 mt-6">
          // This is not built for agencies or multi-creator teams. It is built for individual creators managing their own growth.
        </p>
      </div>
    </div>
  );
}
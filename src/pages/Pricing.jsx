import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Lock } from "lucide-react";
import GlitchText from "../components/GlitchText";

const foundingFeatures = [
  "Full access to all 5 core modules",
  "Unlimited AI promo generation",
  "Weekly AI coaching briefs",
  "Real performance analytics dashboard",
  "Priority feature access (beta)",
  "Founding Creator badge + community",
  "Price locked forever — never increases",
  "Direct feedback channel to product team",
];

const regularFeatures = [
  "Full access to all 5 core modules",
  "AI promo generation",
  "Weekly AI coaching briefs",
  "Performance analytics dashboard",
];

export default function Pricing() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// PRICING PROTOCOL</div>
          <GlitchText text="ONE DEAL." className="text-5xl sm:text-6xl font-black uppercase text-white block" tag="h1" />
          <h1 className="text-5xl sm:text-6xl font-black uppercase text-cyan-400">ONE TIME ONLY.</h1>
          <p className="text-slate-400 mt-6 max-w-xl mx-auto">We're not hiding anything. Right now, we're recruiting Founding Creators at a special rate. After that, pricing goes up — and doesn't come back down.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Founding Creator */}
          <div className="relative bg-[#060d1f] border border-pink-500/60 rounded-lg p-8 hover:shadow-[0_0_30px_rgba(255,0,128,0.15)] transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-pink-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full">FOUNDING CREATOR</span>
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4 mt-2">// LIMITED SLOTS</div>
            <div className="mb-6">
              <span className="text-5xl font-black text-white">$9</span>
              <span className="text-slate-400 text-sm font-mono">/mo</span>
              <div className="text-xs font-mono text-slate-500 mt-1">Locked forever. No increases.</div>
            </div>
            <div className="space-y-3 mb-8">
              {foundingFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
            <Link to="/founding-creators" className="block w-full text-center bg-pink-500 text-white font-black uppercase tracking-widest py-4 rounded text-sm hover:bg-pink-400 hover:shadow-[0_0_30px_rgba(255,0,128,0.4)] transition-all">
              CLAIM THIS DEAL
            </Link>
          </div>

          {/* Regular */}
          <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8 flex flex-col">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// STANDARD ACCESS</div>
            <div className="mb-6">
              <span className="text-5xl font-black text-white">$29</span>
              <span className="text-slate-400 text-sm font-mono">/mo</span>
              <div className="text-xs font-mono text-slate-500 mt-1">After beta period ends</div>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              {regularFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 mb-4 justify-center">
                <Lock className="w-3 h-3" />
                <span>LOCKED UNTIL BETA ENDS</span>
              </div>
              <Link to="/waitlist" className="block w-full text-center border border-cyan-900 text-slate-400 font-black uppercase tracking-widest py-4 rounded text-sm hover:border-cyan-700 hover:text-slate-300 transition-all">
                JOIN WAITLIST
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 bg-[#060d1f] border border-yellow-400/30 rounded-lg px-6 py-4">
            <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest">// NOTE</span>
            <span className="text-slate-400 text-sm">Founding Creator slots are limited. When they're gone, standard pricing applies.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
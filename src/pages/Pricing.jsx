import { ArrowRight, CheckCircle } from "lucide-react";
import GlitchText from "../components/GlitchText";
import { base44 } from "@/api/base44Client";

const proFeatures = [
  "Full access to all 5 core modules",
  "Unlimited AI promo generation",
  "Weekly AI coaching briefs",
  "Real performance analytics dashboard",
  "AI-powered stream strategy",
  "Live coaching via desktop app",
  "Game intel & challenges",
  "Priority support",
];

export default function Pricing() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// PRICING</div>
          <GlitchText text="ONE PLAN." className="text-5xl sm:text-6xl font-black uppercase text-white block" tag="h1" />
          <GlitchText text="EVERYTHING INCLUDED." className="text-5xl sm:text-6xl font-black uppercase text-cyan-400 block" tag="h1" />
          <p className="text-slate-400 mt-6 max-w-xl mx-auto">No tiers. No hidden features. One monthly membership that gives you every tool in AltCtrl.</p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative bg-[#060d1f] border border-cyan-500/40 rounded-lg p-8 hover:shadow-[0_0_30px_rgba(0,245,255,0.15)] transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-cyan-400 text-[#02040f] text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full">PRO</span>
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 mt-2">// FULL ACCESS</div>
            <div className="mb-6">
              <span className="text-5xl font-black text-white">$25</span>
              <span className="text-slate-400 text-sm font-mono">/mo</span>
              <div className="text-xs font-mono text-slate-500 mt-1">Cancel anytime. No contracts.</div>
            </div>
            <div className="space-y-3 mb-8">
              {proFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => base44.auth.redirectToLogin("/app/dashboard")}
              className="block w-full text-center font-black uppercase tracking-widest py-4 rounded text-sm transition-all hover:shadow-[0_0_30px_rgba(0,245,255,0.4)]"
              style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408" }}>
              GET STARTED
            </button>
          </div>
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 bg-[#060d1f] border border-yellow-400/30 rounded-lg px-6 py-4">
            <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest">// HAVE A COUPON?</span>
            <span className="text-slate-400 text-sm">You can apply coupon codes during checkout.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
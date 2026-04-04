import { TrendingUp, Zap, Users, DollarSign } from "lucide-react";
import GlitchText from "../GlitchText";

const STATS = [
  { value: "$500B", label: "Creator Economy by 2027", icon: DollarSign, source: "Goldman Sachs" },
  { value: "50M", label: "Global Creators", icon: Users, source: "Goldman Sachs" },
  { value: "$37B", label: "U.S. Creator Ad Spend 2025", icon: TrendingUp, source: "IAB" },
  { value: "10B+", label: "TikTok Live Watch Hours Q4 2025", icon: Zap, source: "Streams Charts" },
];

export default function InvestorHero() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/10 via-[#02040f] to-[#02040f]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]" />

      <div className="relative max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/5 rounded px-3 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">// INVESTOR OVERVIEW</span>
        </div>

        <GlitchText text="THE ENTIRE STREAMING" className="text-4xl md:text-6xl font-black uppercase text-white block mb-1" tag="h1" />
        <GlitchText text="CAREER ECOSYSTEM" className="text-4xl md:text-6xl font-black uppercase text-cyan-400 block mb-4" tag="h2" />
        <p className="text-lg text-slate-400 font-mono max-w-3xl mx-auto mb-6 leading-relaxed">
          ALT CTRL is building the AI-powered platform that replaces every tool a streaming creator needs — from broadcasting to promotion to monetization to merch.
        </p>
        <p className="text-sm text-slate-500 font-mono max-w-2xl mx-auto mb-12 leading-relaxed">
          Starting with TikTok LIVE gaming. Expanding to YouTube, Twitch, Kick, and every major platform. Then becoming the platform itself.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label, icon: Icon, source }) => (
            <div key={label} className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5 text-center hover:border-cyan-500/20 transition-all group">
              <Icon className="w-5 h-5 text-cyan-400/60 mx-auto mb-2 group-hover:text-cyan-400 transition-colors" />
              <p className="text-2xl md:text-3xl font-black text-white mb-1">{value}</p>
              <p className="text-[10px] font-mono uppercase text-slate-500 mb-2">{label}</p>
              <p className="text-[9px] font-mono text-cyan-400/40">Source: {source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
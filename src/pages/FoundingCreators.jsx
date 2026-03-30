import GlitchText from "../components/GlitchText";
import WaitlistForm from "../components/WaitlistForm";
import NeonCard from "../components/NeonCard";
import { CheckCircle, Star, Users, Zap } from "lucide-react";

const perks = [
  { icon: Star, label: "LOCKED FOREVER", desc: "$9/mo price that never, ever increases. Not a trial. Not a promo." },
  { icon: Zap, label: "BETA-FIRST ACCESS", desc: "Every new feature ships to you before anyone else. You help shape the product." },
  { icon: Users, label: "FOUNDER COMMUNITY", desc: "Private channel with the team + other founding creators. Direct line to development." },
  { icon: CheckCircle, label: "FOUNDING BADGE", desc: "Permanent Founding Creator badge on your profile. Earns you credibility in the community." },
];

export default function FoundingCreators() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-pink-500/40 bg-pink-500/5 rounded px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-pink-400">// FOUNDING CREATOR RECRUITMENT — ACTIVE</span>
          </div>
          <GlitchText text="FOUND THIS EARLY?" className="text-5xl sm:text-6xl font-black uppercase text-white block" tag="h1" />
          <h1 className="text-4xl sm:text-5xl font-black uppercase text-pink-400 mt-2">THIS DEAL IS FOR YOU.</h1>
          <p className="text-slate-400 mt-6 max-w-xl mx-auto">
            We're recruiting a small group of founding creators who get early access and a locked-in price forever. This isn't a discount. It's a founding membership.
          </p>
        </div>

        {/* Price callout */}
        <div className="bg-[#060d1f] border border-pink-500/60 rounded-lg p-8 text-center mb-8 shadow-[0_0_40px_rgba(255,0,128,0.08)]">
          <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// FOUNDING CREATOR ACCESS — 100 SEATS ONLY</div>
          <div className="text-8xl font-black text-white mb-2">FREE<span className="text-3xl text-slate-400 font-mono"> forever</span></div>
          <p className="text-slate-400 text-sm mb-2">After beta, standard pricing is <span className="text-white font-bold">$29/mo</span></p>
          <p className="text-pink-400 text-xs font-mono uppercase tracking-widest">LIFETIME ACCESS. NO CREDIT CARD. 100 SEATS ONLY.</p>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {perks.map((p, i) => (
            <NeonCard key={i} accent="pink">
              <p.icon className="w-6 h-6 text-pink-400 mb-3" />
              <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-2">// {p.label}</div>
              <p className="text-slate-300 text-sm leading-relaxed">{p.desc}</p>
            </NeonCard>
          ))}
        </div>

        {/* Form */}
        <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">// CLAIM YOUR SPOT</div>
          <h2 className="text-2xl font-black uppercase text-white mb-6">LOCK IN FOUNDING CREATOR ACCESS</h2>
          <WaitlistForm source="founding-creators" founding={true} />
        </div>

        <p className="text-center text-xs font-mono text-slate-600 mt-6">
          Founding Creator slots are strictly limited. We'll confirm your access by email with payment instructions once beta opens.
        </p>
      </div>
    </div>
  );
}
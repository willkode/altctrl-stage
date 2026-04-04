import { SectionHeader } from "./MarketOpportunity";
import { Check, X, Minus } from "lucide-react";

const COMPETITORS = [
  {
    name: "OBS",
    price: "Free",
    type: "Open Source",
    features: { broadcasting: true, overlays: true, multistream: false, ai_coaching: false, scheduling: false, analytics: false, promo: false, monetization: false, challenge_engine: false, marketing: false, merch: false, multi_platform: false },
    note: "Free broadcasting. No growth tools.",
  },
  {
    name: "Streamlabs",
    price: "$27/mo",
    type: "Creator Suite",
    features: { broadcasting: true, overlays: true, multistream: true, ai_coaching: false, scheduling: false, analytics: "partial", promo: false, monetization: "partial", challenge_engine: false, marketing: false, merch: "partial", multi_platform: true },
    note: "Production tools + tips. No coaching, no AI.",
  },
  {
    name: "StreamYard",
    price: "$45-89/mo",
    type: "Studio",
    features: { broadcasting: true, overlays: true, multistream: true, ai_coaching: false, scheduling: false, analytics: false, promo: false, monetization: false, challenge_engine: false, marketing: false, merch: false, multi_platform: true },
    note: "Browser studio. No creator growth.",
  },
  {
    name: "Restream",
    price: "Free-Paid",
    type: "Multistream",
    features: { broadcasting: true, overlays: false, multistream: true, ai_coaching: false, scheduling: false, analytics: "partial", promo: false, monetization: false, challenge_engine: false, marketing: false, merch: false, multi_platform: true },
    note: "Multistream routing only.",
  },
  {
    name: "Twitch/TikTok/Kick",
    price: "Free",
    type: "Distribution",
    features: { broadcasting: false, overlays: false, multistream: false, ai_coaching: false, scheduling: false, analytics: "partial", promo: false, monetization: true, challenge_engine: false, marketing: false, merch: false, multi_platform: false },
    note: "Distribution only. Rent your audience.",
  },
  {
    name: "ALT CTRL",
    price: "$19-149/mo",
    type: "Full-Stack Creator Platform",
    features: { broadcasting: "roadmap", overlays: "roadmap", multistream: "roadmap", ai_coaching: true, scheduling: true, analytics: true, promo: true, monetization: true, challenge_engine: true, marketing: true, merch: "roadmap", multi_platform: true },
    note: "AI-powered full-stack: coaching → broadcasting → platform → commerce.",
    highlight: true,
  },
];

const FEATURES = [
  { key: "broadcasting", label: "Broadcasting" },
  { key: "overlays", label: "Overlays/Scenes" },
  { key: "multistream", label: "Multistream" },
  { key: "multi_platform", label: "Multi-Platform" },
  { key: "ai_coaching", label: "AI Coaching" },
  { key: "scheduling", label: "Smart Scheduling" },
  { key: "analytics", label: "Deep Analytics" },
  { key: "promo", label: "Promo Generator" },
  { key: "monetization", label: "Monetization Tools" },
  { key: "challenge_engine", label: "Challenge Engine" },
  { key: "marketing", label: "Marketing Suite" },
  { key: "merch", label: "Merch / Commerce" },
];

function FeatureIcon({ value }) {
  if (value === true) return <Check className="w-3.5 h-3.5 text-green-400" />;
  if (value === "partial") return <Minus className="w-3.5 h-3.5 text-yellow-400" />;
  if (value === "roadmap") return <span className="text-[8px] font-mono text-cyan-400/60 uppercase">Soon</span>;
  return <X className="w-3.5 h-3.5 text-slate-700" />;
}

export default function CompetitiveLandscape() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="E" title="Competitive Landscape" subtitle="Everyone else sells one slice. ALT CTRL owns the entire stack." />

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-cyan-900/20">
                <th className="text-left py-3 px-3 text-[10px] font-mono uppercase text-slate-600 w-[140px]">Feature</th>
                {COMPETITORS.map(c => (
                  <th key={c.name} className={`text-center py-3 px-2 text-[10px] font-mono uppercase ${c.highlight ? "text-cyan-400" : "text-slate-500"}`}>
                    <div>{c.name}</div>
                    <div className={`text-[9px] ${c.highlight ? "text-cyan-400/60" : "text-slate-700"}`}>{c.price}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map(f => (
                <tr key={f.key} className="border-b border-white/[0.02]">
                  <td className="py-2.5 px-3 text-xs text-slate-400">{f.label}</td>
                  {COMPETITORS.map(c => (
                    <td key={c.name} className={`py-2.5 px-2 text-center ${c.highlight ? "bg-cyan-500/[0.02]" : ""}`}>
                      <div className="flex justify-center"><FeatureIcon value={c.features[f.key]} /></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-gradient-to-r from-cyan-950/20 to-[#060d1f] border border-cyan-500/15 rounded-xl p-6">
          <h3 className="text-sm font-black uppercase text-cyan-400 mb-2">Why Full-Stack Wins</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Today a creator needs 5-7 separate tools: OBS for broadcasting, Streamlabs for overlays, Restream for multistream, TikTok/Twitch for distribution, Fourthwall for merch, and spreadsheets for everything else. <span className="text-white font-bold">ALT CTRL collapses this entire stack into one AI-powered platform.</span>
          </p>
          <p className="text-xs text-slate-500 mt-3">
            Phase 1 (now): win on coaching + growth intelligence. Phase 2: add broadcasting to replace OBS/Streamlabs. Phase 3: become the distribution platform and own the viewer relationship entirely.
          </p>
        </div>
      </div>
    </section>
  );
}
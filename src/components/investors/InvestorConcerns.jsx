import { SectionHeader } from "./MarketOpportunity";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const POSITIVES = [
  "Creator economy scale is already large and still growing — $500B by 2027.",
  "Gaming is a $188.8B category with 3.6B players — not a niche bet.",
  "Livestream consumption hit 29.7B hours in Q1 2025 — mass behavior.",
  "TikTok Live is now #2 by watch hours with 10B+ hours in Q4 2025.",
  "TikTok already has built-in live monetization through Gifts and Diamonds.",
  "Existing creator tools prove $27–$45/mo willingness to pay for infrastructure.",
];

const CONCERNS = [
  {
    title: "TikTok Platform Dependence",
    detail: "Despite the Jan 2026 joint venture (80.1% American-owned), legal challenges remain. Platform risk is reduced but not eliminated.",
    mitigation: "ALT CTRL's data layer, coaching engine, and scheduling system are platform-agnostic. Multi-platform expansion is on the roadmap.",
  },
  {
    title: "OBS is Free",
    detail: "ALT CTRL cannot win by selling 'cheaper broadcasting' — OBS covers that for free.",
    mitigation: "ALT CTRL doesn't compete on broadcasting. It sells growth outcomes: better revenue, better retention, better schedule discipline, and AI-driven live decisions.",
  },
  {
    title: "Product Thesis vs. Market Fact",
    detail: "The strongest case for ALT CTRL is better outcomes, not cheaper tools. This is product thesis that needs to be proven with data.",
    mitigation: "Early creator cohorts are already tracking retention, viewer growth, and monetization improvements. Product-market fit signals inform every sprint.",
  },
];

export default function InvestorConcerns() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="H" title="Investor Framework" subtitle="What the market supports — and what we still need to prove." />

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Positive signals */}
          <div className="bg-[#060d1f]/80 border border-green-900/20 rounded-xl p-6">
            <h3 className="text-sm font-black uppercase text-green-400 mb-4">Positive Signals</h3>
            <div className="space-y-3">
              {POSITIVES.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Concerns */}
          <div className="bg-[#060d1f]/80 border border-yellow-900/20 rounded-xl p-6">
            <h3 className="text-sm font-black uppercase text-yellow-400 mb-4">Key Concerns & Mitigations</h3>
            <div className="space-y-5">
              {CONCERNS.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <p className="text-xs font-bold text-white">{c.title}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed ml-5.5 mb-1">{c.detail}</p>
                  <p className="text-[11px] text-cyan-400/70 leading-relaxed ml-5.5">→ {c.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
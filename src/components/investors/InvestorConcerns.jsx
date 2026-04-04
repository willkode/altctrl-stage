import { SectionHeader } from "./MarketOpportunity";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const POSITIVES = [
  "Creator economy scale is already large and still growing — $500B by 2027.",
  "Gaming is a $188.8B category with 3.6B players — not a niche bet.",
  "Livestream consumption hit 29.7B hours in Q1 2025 — mass behavior.",
  "TikTok Live is now #2 by watch hours with 10B+ hours in Q4 2025.",
  "TikTok already has built-in live monetization through Gifts and Diamonds.",
  "Existing creator tools prove $27–$45/mo willingness to pay for infrastructure.",
  "Multi-platform expansion (YouTube, Twitch, Kick) dramatically increases TAM.",
  "Full-stack vision (broadcast + distribute + monetize + commerce) creates massive switching costs.",
  "Platform-agnostic data layer means creator intelligence compounds across every platform.",
];

const CONCERNS = [
  {
    title: "TikTok Platform Dependence (Phase 1)",
    detail: "Phase 1 launches on TikTok. Despite the Jan 2026 joint venture (80.1% American-owned), legal challenges remain.",
    mitigation: "TikTok is the beachhead, not the destination. Multi-platform expansion to YouTube, Twitch, and Kick begins in Year 2. The data layer and coaching engine are already platform-agnostic.",
  },
  {
    title: "Broadcasting is a Crowded Market",
    detail: "OBS is free. Streamlabs has millions of users. Entering broadcasting in Phase 2 means competing with entrenched players.",
    mitigation: "ALT CTRL won't win on broadcasting alone — it wins by being the only tool where broadcasting, coaching, analytics, promo, and monetization are unified. The AI layer makes the broadcaster smarter, not just prettier.",
  },
  {
    title: "Platform Ambition (Phase 3) is Massive",
    detail: "Replacing Twitch/TikTok/Kick as a streaming destination is an enormous undertaking requiring significant capital and network effects.",
    mitigation: "Phase 3 only activates after owning the creator workflow. If 100K+ creators broadcast, schedule, promote, and monetize through ALT CTRL, viewer traffic follows. The platform emerges from the tool, not the other way around.",
  },
  {
    title: "Execution Risk Across Multiple Product Lines",
    detail: "Broadcasting + AI coaching + commerce + platform = high engineering complexity.",
    mitigation: "Phased rollout de-risks execution. Each phase is independently valuable. Phase 1 SaaS is profitable on its own. Each expansion layer compounds rather than replaces.",
  },
];

export default function InvestorConcerns() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="I" title="Investor Framework" subtitle="What the market supports, what we still need to prove, and how we de-risk the 5-year bet." />

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
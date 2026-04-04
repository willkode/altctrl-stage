import { SectionHeader } from "./MarketOpportunity";

const NUMBERS = [
  { category: "Creator Economy", items: [
    { label: "Creator economy", value: "$500B by 2027", source: "Goldman Sachs" },
    { label: "Global creators", value: "50M", source: "Goldman Sachs" },
    { label: "Professional creators", value: "~2M (4%)", source: "Goldman Sachs" },
    { label: "U.S. creator ad spend 2025", value: "$37B", source: "IAB" },
  ]},
  { category: "Gaming & Livestream", items: [
    { label: "Global games market 2025", value: "$188.8B", source: "Newzoo" },
    { label: "Global players 2025", value: "3.6B", source: "Newzoo" },
    { label: "Q1 2025 livestream watch hours", value: "29.7B", source: "Streams Charts" },
    { label: "TikTok Live Q4 2025", value: "10B+ hours", source: "Streams Charts" },
  ]},
  { category: "TikTok Platform", items: [
    { label: "TikTok ad reach Jan 2025", value: "1.59B", source: "DataReportal" },
    { label: "U.S. TikTok ad reach", value: "136M", source: "DataReportal" },
    { label: "TikTok Live gaming Q3 2025", value: "1.29B hours", source: "Streams Charts" },
  ]},
  { category: "Competitors", items: [
    { label: "Streamlabs Ultra", value: "$27/mo", source: "Streamlabs" },
    { label: "StreamYard Core", value: "$44.99/mo", source: "StreamYard" },
    { label: "OBS", value: "Free", source: "OBS Project" },
  ]},
  { category: "ALT CTRL Model", items: [
    { label: "Phase 1 ARPU", value: "$33/mo", source: "Model assumption" },
    { label: "Phase 2+ ARPU", value: "$65-100/mo", source: "Model assumption" },
    { label: "LTV/CAC ratio", value: "6.2×", source: "Model assumption" },
    { label: "10K users ARR", value: "~$4.0M", source: "Phase 1" },
    { label: "100K users ARR", value: "~$102M", source: "Phase 2-3" },
    { label: "Gross margin target", value: "78-84%", source: "Model assumption" },
  ]},
  { category: "5-Year Vision", items: [
    { label: "Phase 1", value: "AI Creator OS", source: "TikTok beachhead" },
    { label: "Phase 2", value: "Replace OBS/Streamlabs", source: "Multi-platform broadcasting" },
    { label: "Phase 3", value: "Own the platform", source: "Replace Twitch/TikTok/Kick" },
    { label: "Expanded TAM", value: "$50B+", source: "SaaS + Broadcasting + Commerce" },
  ]},
];

export default function KeyNumbers() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="J" title="Quick Reference Numbers" subtitle="The strongest sourced and modeled numbers in one place." />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {NUMBERS.map(group => (
            <div key={group.category} className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-3 pb-2 border-b border-white/[0.03]">{group.category}</h3>
              <div className="space-y-3">
                {group.items.map(item => (
                  <div key={item.label}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-slate-400">{item.label}</span>
                      <span className="text-sm font-black text-white whitespace-nowrap">{item.value}</span>
                    </div>
                    <p className="text-[9px] font-mono text-slate-700">{item.source}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { SectionHeader } from "./MarketOpportunity";

const TAM_DATA = [
  { label: "TAM", value: "$12.0B", desc: "50M creators × $20/mo × 12 (SaaS only)", color: "cyan", width: "100%" },
  { label: "Expanded TAM", value: "$50B+", desc: "SaaS + Broadcasting + Commerce GMV + Platform Fees", color: "cyan", width: "100%" },
  { label: "SAM", value: "$840M", desc: "2M professional creators × $35/mo × 12", color: "pink", width: "7%" },
  { label: "SOM (10K)", value: "$4.0M", desc: "10,000 creators × $33/mo × 12", color: "yellow", width: "0.3%" },
];

const SOM_SCENARIOS = [
  { creators: "10K", arpu: "$33", arr: "$3.96M", phase: "Phase 1" },
  { creators: "25K", arpu: "$45", arr: "$13.5M", phase: "Phase 1-2" },
  { creators: "50K", arpu: "$65", arr: "$39.0M", phase: "Phase 2" },
  { creators: "100K", arpu: "$85", arr: "$102M", phase: "Phase 2-3" },
  { creators: "250K", arpu: "$100", arr: "$300M", phase: "Phase 3" },
];

export default function TAMModel() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="G" title="TAM / SAM / SOM" subtitle="SaaS-only TAM today. Full-stack platform TAM by Year 5 is multiples larger." />

        <div className="mt-12 space-y-4">
          {TAM_DATA.map(t => (
            <div key={t.label} className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 opacity-[0.04]" style={{
                width: t.width,
                background: t.color === "cyan" ? "#00f5ff" : t.color === "pink" ? "#ff0080" : "#fbbf24",
              }} />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black uppercase px-2.5 py-1 rounded ${
                      t.color === "cyan" ? "bg-cyan-500/10 text-cyan-400" :
                      t.color === "pink" ? "bg-pink-500/10 text-pink-400" :
                      "bg-yellow-400/10 text-yellow-400"
                    }`}>{t.label}</span>
                    <p className="text-xs font-mono text-slate-500">{t.desc}</p>
                  </div>
                </div>
                <p className={`text-2xl md:text-3xl font-black ${
                  t.color === "cyan" ? "text-cyan-400" :
                  t.color === "pink" ? "text-pink-400" :
                  "text-yellow-400"
                }`}>{t.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SOM ladder */}
        <div className="mt-10 bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-6">
          <h3 className="text-sm font-black uppercase text-white mb-4">SOM Growth Ladder</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SOM_SCENARIOS.map(s => (
              <div key={s.creators} className="bg-[#02040f] rounded-lg p-4 text-center border border-cyan-900/10 hover:border-cyan-500/20 transition-all">
                <p className="text-[9px] font-mono text-cyan-400/40 mb-1">{s.phase}</p>
                <p className="text-xs font-mono text-slate-600 mb-1">{s.creators} creators</p>
                <p className="text-lg font-black text-white">{s.arr}</p>
                <p className="text-[10px] font-mono text-cyan-400/40">@ {s.arpu}/mo</p>
              </div>
            ))}
          </div>
          <p className="text-[9px] font-mono text-slate-700 mt-4">These are operating assumptions, not sourced market reports. Source data: Goldman Sachs (50M creators, 4% professional rate).</p>
        </div>
      </div>
    </section>
  );
}
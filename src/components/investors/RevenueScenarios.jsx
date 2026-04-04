import { SectionHeader } from "./MarketOpportunity";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SCENARIOS = [
  { name: "Conservative", creators: 2500, arpu: 28, arr: 840000, margin: 80, profit: 672000, color: "rgba(0,245,255,0.3)" },
  { name: "Base", creators: 10000, arpu: 35, arr: 4200000, margin: 82, profit: 3440000, color: "rgba(0,245,255,0.6)" },
  { name: "Upside", creators: 30000, arpu: 42, arr: 15120000, margin: 84, profit: 12700000, color: "#00f5ff" },
];

const CHART_DATA = SCENARIOS.map(s => ({ name: s.name, arr: s.arr / 1000000 }));

const fmt = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;

export default function RevenueScenarios() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="G" title="Revenue Scenarios" subtitle="Model assumptions — not sourced facts. Three scenarios based on unit economics." />

        <div className="grid md:grid-cols-[1fr_320px] gap-8 mt-12">
          {/* Scenario cards */}
          <div className="space-y-4">
            {SCENARIOS.map(s => (
              <div key={s.name} className={`bg-[#060d1f]/80 border rounded-xl p-5 ${
                s.name === "Base" ? "border-cyan-500/30 ring-1 ring-cyan-500/10" : "border-cyan-900/20"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black uppercase text-white">{s.name}</h3>
                    {s.name === "Base" && (
                      <span className="text-[8px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">Primary Model</span>
                    )}
                  </div>
                  <p className="text-xl font-black text-cyan-400">{fmt(s.arr)}<span className="text-xs text-slate-500 ml-1">ARR</span></p>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-[9px] font-mono uppercase text-slate-700">Paid Creators</p>
                    <p className="text-sm font-black text-white">{s.creators.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase text-slate-700">ARPU</p>
                    <p className="text-sm font-black text-white">${s.arpu}/mo</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase text-slate-700">Gross Margin</p>
                    <p className="text-sm font-black text-white">{s.margin}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase text-slate-700">Gross Profit</p>
                    <p className="text-sm font-black text-green-400">{fmt(s.profit)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5">
            <h3 className="text-sm font-black uppercase text-white mb-4">ARR by Scenario</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA} barSize={50} layout="vertical">
                  <XAxis type="number" tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="bg-[#060d1f] border border-cyan-500/30 rounded-lg px-3 py-2 text-xs font-mono">
                      <span className="text-cyan-400 font-bold">${payload[0].value.toFixed(1)}M ARR</span>
                    </div>
                  ) : null} cursor={false} />
                  <Bar dataKey="arr" radius={[0, 6, 6, 0]}>
                    {CHART_DATA.map((_, i) => (
                      <Cell key={i} fill={SCENARIOS[i].color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
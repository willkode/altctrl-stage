import { SectionHeader } from "./MarketOpportunity";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell } from "recharts";

const PRICING_MIX = [
  { tier: "Starter $19", pct: 70, revenue: 13.30, color: "rgba(0,245,255,0.3)" },
  { tier: "Pro $49", pct: 25, revenue: 12.25, color: "rgba(0,245,255,0.6)" },
  { tier: "Team $149", pct: 5, revenue: 7.45, color: "#00f5ff" },
];

const COGS = [
  { name: "AI Inference", value: 8, color: "#00f5ff" },
  { name: "Hosting/Storage", value: 5, color: "#06b6d4" },
  { name: "Support/Processing", value: 5, color: "#0891b2" },
  { name: "Gross Profit", value: 82, color: "#064e3b" },
];

const MARGIN_TARGETS = [
  { year: "Year 1", margin: 78 },
  { year: "Year 2", margin: 80 },
  { year: "Year 3+", margin: 83 },
];

export default function UnitEconomics() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="E" title="Unit Economics" subtitle="SaaS-native model with strong LTV/CAC fundamentals." />

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {/* Pricing stack */}
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-6">
            <h3 className="text-sm font-black uppercase text-white mb-4">Pricing Mix</h3>
            <div className="space-y-3 mb-4">
              {PRICING_MIX.map(t => (
                <div key={t.tier}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-slate-400">{t.tier}</span>
                    <span className="font-bold text-white">{t.pct}%</span>
                  </div>
                  <div className="h-2 bg-[#02040f] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${t.pct}%`, backgroundColor: t.color }} />
                  </div>
                  <p className="text-[9px] font-mono text-slate-700 mt-0.5">${t.revenue.toFixed(2)} contribution</p>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-white/[0.03]">
              <p className="text-xs font-mono text-slate-500">Blended ARPU</p>
              <p className="text-3xl font-black text-cyan-400">$33<span className="text-lg text-slate-500">/mo</span></p>
            </div>
          </div>

          {/* COGS breakdown */}
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-6">
            <h3 className="text-sm font-black uppercase text-white mb-1">Gross Margin Target</h3>
            <p className="text-[10px] font-mono text-slate-600 mb-4">COGS: 16-22% of revenue</p>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={COGS} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {COGS.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-2">
              {COGS.map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-[10px] font-mono text-slate-400 flex-1">{c.name}</span>
                  <span className="text-[10px] font-mono text-white font-bold">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* LTV/CAC */}
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-6">
            <h3 className="text-sm font-black uppercase text-white mb-4">LTV / CAC Model</h3>
            <div className="space-y-4">
              <div className="bg-[#02040f] rounded-lg p-3">
                <p className="text-[9px] font-mono uppercase text-slate-700 mb-1">Monthly Churn (base case)</p>
                <p className="text-xl font-black text-white">5%</p>
                <p className="text-[10px] font-mono text-slate-600">→ 20 month avg lifetime</p>
              </div>
              <div className="bg-[#02040f] rounded-lg p-3">
                <p className="text-[9px] font-mono uppercase text-slate-700 mb-1">Gross-Profit LTV</p>
                <p className="text-xl font-black text-green-400">$528</p>
                <p className="text-[10px] font-mono text-slate-600">$33 × 80% margin × 20mo</p>
              </div>
              <div className="bg-[#02040f] rounded-lg p-3">
                <p className="text-[9px] font-mono uppercase text-slate-700 mb-1">CAC (base case)</p>
                <p className="text-xl font-black text-white">$85</p>
                <p className="text-[10px] font-mono text-slate-600">Balanced creator-led growth</p>
              </div>
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-mono uppercase text-cyan-400/60">LTV / CAC</p>
                    <p className="text-2xl font-black text-cyan-400">6.2×</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase text-cyan-400/60">CAC Payback</p>
                    <p className="text-2xl font-black text-cyan-400">3.2mo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
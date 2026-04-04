import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CREATOR_AD_SPEND = [
  { year: "2021", value: 13.9 },
  { year: "2022", value: 18.5 },
  { year: "2023", value: 23.5 },
  { year: "2024", value: 29.5 },
  { year: "2025", value: 37.0 },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#060d1f] border border-cyan-500/30 rounded-lg px-3 py-2 text-xs font-mono">
      <span className="text-cyan-400 font-bold">${payload[0].value}B</span>
      <span className="text-slate-500 ml-1">({payload[0].payload.year})</span>
    </div>
  );
};

export default function MarketOpportunity() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="A" title="Market Opportunity" subtitle="The creator economy is massive, real, and accelerating." />

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Creator Economy */}
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-6">
            <h3 className="text-sm font-black uppercase text-white mb-4">Creator Economy Size</h3>
            <div className="space-y-4">
              <Stat value="$500B" label="projected creator economy by 2027" source="Goldman Sachs" />
              <Stat value="50M" label="global creators, growing 10-20% CAGR" source="Goldman Sachs" />
              <Stat value="~2M" label="professional creators (4% earning >$100K/yr)" source="Goldman Sachs, derived" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Only 4% of creators are "professionals" — meaning the vast majority lack the tools and systems to professionalize. That's the gap ALT CTRL fills.
              </p>
            </div>
          </div>

          {/* U.S. Creator Ad Spend chart */}
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-6">
            <h3 className="text-sm font-black uppercase text-white mb-1">U.S. Creator Ad Spend</h3>
            <p className="text-[10px] font-mono text-cyan-400/60 mb-4">Growing ~4× faster than broader media industry • Source: IAB</p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CREATOR_AD_SPEND} barSize={40}>
                  <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}B`} domain={[0, 42]} />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {CREATOR_AD_SPEND.map((entry, i) => (
                      <Cell key={i} fill={i === CREATOR_AD_SPEND.length - 1 ? "#00f5ff" : "rgba(0,245,255,0.2)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-2xl font-black text-cyan-400">+26%</span>
              <span className="text-xs font-mono text-slate-500">YoY growth in 2025</span>
            </div>
          </div>
        </div>

        {/* Gaming market */}
        <div className="mt-8 bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-6">
          <h3 className="text-sm font-black uppercase text-white mb-4">Gaming Market</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <Stat value="$188.8B" label="global games market 2025 (+3.4% YoY)" source="Newzoo" />
            <Stat value="3.6B" label="global players in 2025" source="Newzoo" />
            <Stat value="$103B" label="mobile gaming (~55% of total)" source="Newzoo" />
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">Gaming is not niche — it's the world's largest entertainment category by revenue, with nearly half the planet playing.</p>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ tag, title, subtitle }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 bg-cyan-500/5 border border-cyan-500/20 px-2 py-0.5 rounded">{tag}</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-2">{title}</h2>
      {subtitle && <p className="text-sm font-mono text-slate-500">{subtitle}</p>}
    </div>
  );
}

function Stat({ value, label, source }) {
  return (
    <div>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
      {source && <p className="text-[9px] font-mono text-cyan-400/40 mt-0.5">Source: {source}</p>}
    </div>
  );
}

export { SectionHeader, Stat };
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { SectionHeader, Stat } from "./MarketOpportunity";

const WATCH_HOURS = [
  { quarter: "Q1 '25", tiktok: 8.0, youtube: 13.5, twitch: 5.5, other: 2.7 },
  { quarter: "Q2 '25", tiktok: 8.6, youtube: 13.8, twitch: 5.3, other: 2.5 },
  { quarter: "Q3 '25", tiktok: 9.2, youtube: 14.0, twitch: 5.1, other: 2.4 },
  { quarter: "Q4 '25", tiktok: 10.0, youtube: 14.2, twitch: 4.9, other: 2.3 },
];

const PLATFORM_SHARE = [
  { name: "YouTube Live", value: 45, color: "#ff0000" },
  { name: "TikTok Live", value: 27, color: "#00f5ff" },
  { name: "Twitch", value: 21, color: "#9146ff" },
  { name: "Other", value: 7, color: "#334155" },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#060d1f] border border-cyan-500/30 rounded-lg px-3 py-2 text-xs font-mono">
      <p className="text-white font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}B hrs</p>
      ))}
    </div>
  );
};

export default function LivestreamExplosion() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="B" title="The Livestream Explosion" subtitle="29.7 billion watch hours in Q1 2025 alone. Livestreaming is a mass behavior." />

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Stacked area chart */}
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-6">
            <h3 className="text-sm font-black uppercase text-white mb-1">Platform Watch Hours (Billions)</h3>
            <p className="text-[10px] font-mono text-slate-600 mb-4">Q1–Q4 2025 • Source: Streams Charts</p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WATCH_HOURS}>
                  <defs>
                    <linearGradient id="tiktokGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f5ff" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00f5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="quarter" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}B`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="youtube" name="YouTube Live" stackId="1" stroke="#ff0000" fill="rgba(255,0,0,0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="tiktok" name="TikTok Live" stackId="1" stroke="#00f5ff" fill="url(#tiktokGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="twitch" name="Twitch" stackId="1" stroke="#9146ff" fill="rgba(145,70,255,0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="other" name="Other" stackId="1" stroke="#334155" fill="rgba(51,65,85,0.1)" strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-6">
            <h3 className="text-sm font-black uppercase text-white mb-1">Q1 2025 Market Share</h3>
            <p className="text-[10px] font-mono text-slate-600 mb-4">Top 3 platforms = 93% of all viewership • Source: Streams Charts</p>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PLATFORM_SHARE} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {PLATFORM_SHARE.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value, entry) => <span className="text-[10px] font-mono text-slate-400">{value} ({entry.payload.value}%)</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-3">
              <p className="text-xs text-cyan-400 font-bold">TikTok Live = #2 platform globally</p>
              <p className="text-[10px] font-mono text-slate-500">Passed 10B watch hours in Q4 2025 with 7.2M peak concurrent viewers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
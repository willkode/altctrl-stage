import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import EmptyState from "../EmptyState";

const METRICS = [
  { key: "avg_viewers", label: "Avg Viewers", color: "#00f5ff" },
  { key: "peak_viewers", label: "Peak Viewers", color: "#ff0080" },
  { key: "followers_gained", label: "Followers Gained", color: "#facc15" },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg px-3 py-2 shadow-xl">
      <div className="text-[10px] font-mono text-slate-500 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-bold">{p.value ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}

export default function PerformanceChart({ sessions }) {
  const [activeMetric, setActiveMetric] = useState("avg_viewers");

  // Last 30 days bucketed by date
  const cutoff = Date.now() - 30 * 86400000;
  const recent = sessions
    .filter(s => new Date(s.stream_date).getTime() >= cutoff)
    .sort((a, b) => a.stream_date.localeCompare(b.stream_date));

  const data = recent.map(s => ({
    date: new Date(s.stream_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    game: s.game,
    avg_viewers: s.avg_viewers || null,
    peak_viewers: s.peak_viewers || null,
    followers_gained: s.followers_gained || null,
  }));

  const metric = METRICS.find(m => m.key === activeMetric);

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">// 30-DAY PERFORMANCE</div>
        <div className="flex gap-1.5">
          {METRICS.map(m => (
            <button key={m.key} onClick={() => setActiveMetric(m.key)}
              className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded border transition-all ${
                activeMetric === m.key
                  ? "border-cyan-500/40 text-white bg-cyan-500/10"
                  : "border-cyan-900/30 text-slate-600 hover:text-slate-400"
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {data.length < 2 ? (
        <div className="py-8">
          <EmptyState
            title="Not enough data yet"
            message="Log at least 2 sessions in the last 30 days to see your performance chart."
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={metric.color}
              strokeWidth={2}
              fill="url(#areaGrad)"
              dot={{ fill: metric.color, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: metric.color, strokeWidth: 0 }}
              name={metric.label}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
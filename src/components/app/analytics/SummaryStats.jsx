import { Zap, TrendingUp, Users, Clock, Flame, Radio } from "lucide-react";

function StatBox({ label, value, sub, icon: IconComponent, accent = "cyan", glow = false }) {
  const colors = {
    cyan: { text: "text-cyan-400", border: "border-cyan-900/40", icon: "text-cyan-400/40" },
    pink: { text: "text-pink-400", border: "border-pink-900/30", icon: "text-pink-400/40" },
    yellow: { text: "text-yellow-400", border: "border-yellow-900/30", icon: "text-yellow-400/40" },
    green: { text: "text-green-400", border: "border-green-900/30", icon: "text-green-400/40" },
  };
  const c = colors[accent] || colors.cyan;
  return (
    <div className={`bg-[#060d1f] border ${c.border} rounded-xl p-4 relative overflow-hidden`}
      style={glow ? { boxShadow: `0 0 20px rgba(0,245,255,0.05)` } : {}}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">{label}</div>
          <div className={`text-2xl font-black ${c.text}`}>{value}</div>
          {sub && <div className="text-[10px] font-mono text-slate-600 mt-1">{sub}</div>}
        </div>
        {IconComponent && <IconComponent className={`w-5 h-5 ${c.icon} shrink-0 mt-1`} />}
      </div>
    </div>
  );
}

export default function SummaryStats({ sessions }) {
  const total = sessions.length;
  const last30 = sessions.filter(s => {
    const d = new Date(s.stream_date);
    return (Date.now() - d.getTime()) / 86400000 <= 30;
  });
  const withViewers = sessions.filter(s => s.avg_viewers != null && s.avg_viewers > 0);
  const avgViewers = withViewers.length > 0
    ? Math.round(withViewers.reduce((a, s) => a + s.avg_viewers, 0) / withViewers.length)
    : null;
  const peakViewers = sessions.reduce((m, s) => Math.max(m, s.peak_viewers || 0), 0);
  const totalMins = sessions.reduce((a, s) => a + (s.duration_minutes || 0), 0);
  const totalHours = totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`;
  const promoRate = total > 0
    ? Math.round((sessions.filter(s => s.promo_posted).length / total) * 100)
    : 0;
  const totalFollowers = sessions.reduce((a, s) => a + (s.followers_gained || 0), 0);

  return (
    <div>
      <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// OVERVIEW</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatBox label="Total Sessions" value={total} sub="all time" icon={Zap} accent="cyan" glow />
        <StatBox label="Last 30 Days" value={last30.length} sub="sessions" icon={Radio} accent="pink" />
        <StatBox label="Avg Viewers" value={avgViewers ?? "—"} sub="across sessions" icon={Users} accent="cyan" />
        <StatBox label="Peak Viewers" value={peakViewers || "—"} sub="single session" icon={TrendingUp} accent="yellow" />
        <StatBox label="Stream Time" value={total > 0 ? totalHours : "—"} sub="total logged" icon={Clock} accent="cyan" />
        <StatBox label="Promo Rate" value={`${promoRate}%`} sub="sessions w/ promo" icon={Flame} accent={promoRate >= 60 ? "green" : "pink"} />
      </div>
      {total > 0 && totalFollowers > 0 && (
        <div className="mt-3 bg-[#060d1f] border border-cyan-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600">Total Followers Gained</div>
          <div className="text-lg font-black text-cyan-400 ml-auto">+{totalFollowers.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
import { Zap, TrendingUp, Flame, Calendar } from "lucide-react";

function MiniStat({ label, value, sub, icon: Icon, color = "cyan" }) {
  const cls = {
    cyan: "border-cyan-900/30 text-cyan-400",
    pink: "border-pink-900/30 text-pink-400",
    yellow: "border-yellow-900/30 text-yellow-400",
  }[color] || "border-cyan-900/30 text-cyan-400";

  return (
    <div className={`bg-[#060d1f]/80 border ${cls.split(" ")[0]} rounded-xl p-4 flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{label}</span>
        <Icon className={`w-3.5 h-3.5 ${cls.split(" ")[1]} opacity-40`} />
      </div>
      <span className={`text-2xl font-black ${cls.split(" ")[1]}`}>{value}</span>
      {sub && <span className="text-[10px] font-mono text-slate-600">{sub}</span>}
    </div>
  );
}

export default function QuickStatsRow({ sessions, weekCompleted, weekTarget, streak }) {
  const withViewers = sessions.filter(s => s.avg_viewers > 0);
  const avgViewers = withViewers.length > 0
    ? Math.round(withViewers.reduce((s, r) => s + r.avg_viewers, 0) / withViewers.length)
    : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <MiniStat label="Sessions" value={sessions.length || "0"} sub="all time" icon={Zap} color="cyan" />
      <MiniStat label="Avg Viewers" value={avgViewers ?? "—"} sub="last 10" icon={TrendingUp} color="pink" />
      <MiniStat label="This Week" value={`${weekCompleted}/${weekTarget}`} sub="streams" icon={Calendar} color="cyan" />
      <MiniStat label="Streak" value={streak || "0"} sub="weeks" icon={Flame} color="yellow" />
    </div>
  );
}
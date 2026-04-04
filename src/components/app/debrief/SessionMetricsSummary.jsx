import { Users, TrendingUp, Heart, MessageSquare, Share2, Gift, Clock, Flame } from "lucide-react";

function Metric({ label, value, icon: Icon, accent = "cyan" }) {
  if (value == null || value === 0) return null;
  const cls = {
    cyan: "text-cyan-400", pink: "text-pink-400", yellow: "text-yellow-400", green: "text-green-400",
  }[accent] || "text-cyan-400";
  return (
    <div className="flex items-center gap-2.5 py-2">
      <Icon className={`w-3.5 h-3.5 ${cls} opacity-40 shrink-0`} />
      <span className="text-xs font-mono text-slate-500 flex-1">{label}</span>
      <span className={`text-sm font-black ${cls}`}>{typeof value === "number" ? value.toLocaleString() : value}</span>
    </div>
  );
}

export default function SessionMetricsSummary({ session }) {
  if (!session) return null;

  return (
    <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-4 divide-y divide-white/[0.03]">
      <Metric label="Avg Viewers" value={session.avg_viewers} icon={Users} accent="cyan" />
      <Metric label="Peak Viewers" value={session.peak_viewers} icon={TrendingUp} accent="pink" />
      <Metric label="Duration" value={session.duration_minutes ? `${session.duration_minutes}m` : null} icon={Clock} accent="cyan" />
      <Metric label="Followers +" value={session.followers_gained} icon={Heart} accent="pink" />
      <Metric label="Comments" value={session.comments} icon={MessageSquare} accent="cyan" />
      <Metric label="Shares" value={session.shares} icon={Share2} accent="cyan" />
      <Metric label="Gifters" value={session.gifters} icon={Gift} accent="yellow" />
      <Metric label="Diamonds" value={session.diamonds} icon={Gift} accent="yellow" />
      <Metric label="Energy" value={session.energy_level} icon={Flame} accent={session.energy_level === "high" ? "yellow" : session.energy_level === "low" ? "pink" : "cyan"} />
    </div>
  );
}
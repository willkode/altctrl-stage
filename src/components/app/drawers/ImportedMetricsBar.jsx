import { Users, Eye, Clock, Heart, MessageCircle, Share2, Gift, Diamond } from "lucide-react";
import SourceBadge from "../SourceBadge";

function Metric({ icon: Icon, label, value, accent = "cyan" }) {
  if (value === null || value === undefined || value === 0) return null;
  const colors = {
    cyan: "text-cyan-400",
    pink: "text-pink-400",
    yellow: "text-yellow-400",
  };
  return (
    <div className="flex items-center gap-2 bg-[#02040f] border border-cyan-900/20 rounded px-3 py-2">
      <Icon className={`w-3 h-3 ${colors[accent] || colors.cyan} shrink-0`} />
      <span className="text-[10px] font-mono text-slate-600 uppercase">{label}</span>
      <span className={`text-sm font-black ml-auto ${colors[accent] || colors.cyan}`}>{typeof value === "number" ? value.toLocaleString() : value}</span>
    </div>
  );
}

export default function ImportedMetricsBar({ session }) {
  if (!session || (session.source !== "extension_import" && session.source !== "hybrid")) return null;

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">// Imported from Extension</div>
        <SourceBadge source={session.source} size="sm" />
      </div>
      <p className="text-[10px] font-mono text-slate-600">These metrics were auto-captured. Add details below to help the system understand your stream better.</p>
      <div className="grid grid-cols-2 gap-2">
        <Metric icon={Users} label="Avg Viewers" value={session.avg_viewers} accent="cyan" />
        <Metric icon={Eye} label="Peak Viewers" value={session.peak_viewers} accent="pink" />
        <Metric icon={Clock} label="Duration" value={session.duration_minutes ? `${session.duration_minutes}m` : null} accent="cyan" />
        <Metric icon={Heart} label="Followers" value={session.followers_gained} accent="yellow" />
        <Metric icon={Heart} label="Likes" value={session.likes_received} accent="pink" />
        <Metric icon={MessageCircle} label="Comments" value={session.comments} accent="cyan" />
        <Metric icon={Share2} label="Shares" value={session.shares} accent="cyan" />
        <Metric icon={Gift} label="Gifters" value={session.gifters} accent="pink" />
        <Metric icon={Diamond} label="Diamonds" value={session.diamonds} accent="yellow" />
      </div>
    </div>
  );
}
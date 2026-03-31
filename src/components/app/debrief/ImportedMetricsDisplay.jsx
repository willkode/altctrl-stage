import SourceBadge from "../SourceBadge";

export default function ImportedMetricsDisplay({ session }) {
  if (!session || session.source === "manual") return null;

  const metrics = [
    { label: "Duration", value: session.duration_minutes ? `${session.duration_minutes}m` : "—", icon: "⏱" },
    { label: "Avg Viewers", value: session.avg_viewers ?? "—", icon: "👥" },
    { label: "Peak Viewers", value: session.peak_viewers ?? "—", icon: "📈" },
    { label: "Followers Gained", value: session.followers_gained ?? 0, icon: "✨" },
    { label: "Gifters", value: session.gifters ?? 0, icon: "🎁" },
    { label: "Diamonds", value: session.diamonds ?? 0, icon: "💎" },
    { label: "Comments", value: session.comments ?? 0, icon: "💬" },
    { label: "Shares", value: session.shares ?? 0, icon: "🔗" },
    { label: "Fan Club Joins", value: session.fan_club_joins ?? 0, icon: "⭐" },
  ];

  const active = metrics.filter(m => m.value !== "—" && m.value !== 0);

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">// Imported Metrics</div>
        <SourceBadge source={session.source} size="sm" />
      </div>
      <p className="text-xs font-mono text-slate-600">These metrics were auto-synced from your live session. Read-only.</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {active.map((m, i) => (
          <div key={i} className="bg-[#02040f] border border-cyan-900/20 rounded p-2.5">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-600 mb-1">{m.label}</div>
            <div className="text-lg font-black text-cyan-400">{m.icon} {m.value}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-cyan-900/20 pt-3 space-y-1 text-[10px] font-mono text-slate-700">
        <div>📅 {session.stream_date}</div>
        {session.start_time && <div>🕐 {session.start_time} — {session.end_time || "?"}</div>}
      </div>
    </div>
  );
}
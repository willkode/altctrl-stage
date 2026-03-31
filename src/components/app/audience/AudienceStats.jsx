import SourceBadge from "../SourceBadge";

export default function AudienceStats({ sessions }) {
  const stats = [
    {
      label: "Followers Gained",
      key: "followers_gained",
      icon: "✨",
      color: "cyan",
      calc: () => sessions.reduce((s, r) => s + (r.followers_gained || 0), 0),
    },
    {
      label: "Gifts Earned",
      key: "diamonds",
      icon: "💎",
      color: "pink",
      calc: () => sessions.reduce((s, r) => s + (r.diamonds || 0), 0),
    },
    {
      label: "Gifters",
      key: "gifters",
      icon: "🎁",
      color: "yellow",
      calc: () => sessions.reduce((s, r) => s + (r.gifters || 0), 0),
    },
    {
      label: "Comments",
      key: "comments",
      icon: "💬",
      color: "cyan",
      calc: () => sessions.reduce((s, r) => s + (r.comments || 0), 0),
    },
    {
      label: "Shares",
      key: "shares",
      icon: "🔗",
      color: "slate",
      calc: () => sessions.reduce((s, r) => s + (r.shares || 0), 0),
    },
    {
      label: "Fan Club Joins",
      key: "fan_club_joins",
      icon: "⭐",
      color: "yellow",
      calc: () => sessions.reduce((s, r) => s + (r.fan_club_joins || 0), 0),
    },
  ];

  const colors = {
    cyan: "border-cyan-900/30 bg-cyan-500/5 text-cyan-400",
    pink: "border-pink-900/30 bg-pink-500/5 text-pink-400",
    yellow: "border-yellow-900/30 bg-yellow-400/5 text-yellow-400",
    slate: "border-slate-900/30 bg-slate-500/5 text-slate-400",
  };

  const hasSources = sessions.some(s => s.source && s.source !== "manual");

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">// Audience Stats</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(stat => {
          const value = stat.calc();
          const empty = value === 0 || value === null;
          const c = colors[stat.color];

          return (
            <div key={stat.key} className={`border rounded-lg p-3.5 transition-all ${c}`}>
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">{stat.label}</div>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-black">{stat.icon}</div>
                <div className={`text-xl font-black ${empty ? "text-slate-600" : ""}`}>
                  {empty ? "—" : value.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasSources && (
        <div className="text-[10px] font-mono text-slate-600 pt-2">
          💡 These stats combine imported and manual data. Hover session history to see source per metric.
        </div>
      )}
    </div>
  );
}
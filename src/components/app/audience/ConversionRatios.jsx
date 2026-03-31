export default function ConversionRatios({ sessions }) {
  const activeCount = sessions.filter(s => s.avg_viewers).length;

  if (activeCount === 0) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">// Conversion Ratios</div>
        <p className="text-xs font-mono text-slate-600">Need at least 3 sessions with viewer data to calculate ratios.</p>
      </div>
    );
  }

  const calcs = [
    {
      label: "Followers Per Session",
      calc: () => {
        const total = sessions.reduce((s, r) => s + (r.followers_gained || 0), 0);
        return (total / sessions.length).toFixed(1);
      },
    },
    {
      label: "Gifts Per Session",
      calc: () => {
        const total = sessions.reduce((s, r) => s + (r.diamonds || 0), 0);
        return (total / sessions.length).toFixed(0);
      },
    },
    {
      label: "Gifters Per Session",
      calc: () => {
        const total = sessions.reduce((s, r) => s + (r.gifters || 0), 0);
        return (total / sessions.length).toFixed(1);
      },
    },
    {
      label: "Comments Per Session",
      calc: () => {
        const total = sessions.reduce((s, r) => s + (r.comments || 0), 0);
        return (total / sessions.length).toFixed(0);
      },
    },
    {
      label: "Shares Per Session",
      calc: () => {
        const total = sessions.reduce((s, r) => s + (r.shares || 0), 0);
        return (total / sessions.length).toFixed(1);
      },
    },
    {
      label: "Avg Followers Per Viewer",
      calc: () => {
        const totalFollowers = sessions.reduce((s, r) => s + (r.followers_gained || 0), 0);
        const totalViewers = sessions.reduce((s, r) => s + (r.avg_viewers || 0), 0);
        return totalViewers > 0 ? (totalFollowers / totalViewers).toFixed(3) : "—";
      },
    },
  ];

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5 space-y-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2">// Conversion Ratios</div>
      <p className="text-xs font-mono text-slate-600 mb-4">Averages across {sessions.length} sessions.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {calcs.map((c, i) => (
          <div key={i} className="border border-cyan-900/20 rounded p-3 bg-[#02040f]">
            <div className="text-[9px] font-mono uppercase text-slate-600 mb-2">{c.label}</div>
            <div className="text-lg font-black text-cyan-400">{c.calc()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
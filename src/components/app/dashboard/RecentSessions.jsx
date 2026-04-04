import SourceBadge from "../SourceBadge";

export default function RecentSessions({ sessions }) {
  if (!sessions?.length) return null;

  return (
    <div className="bg-[#060d1f]/80 border border-cyan-900/30 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.03]">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60">Recent Sessions</span>
      </div>
      <div className="divide-y divide-white/[0.03]">
        {sessions.slice(0, 5).map(s => (
          <div key={s.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.01] transition-colors">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-white truncate block">{s.game}</span>
              <span className="text-[10px] font-mono text-slate-600">{s.stream_date} · {s.stream_type?.replace("_", " ")}</span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {s.avg_viewers != null && (
                <div className="text-right">
                  <div className="text-sm font-black text-white">{s.avg_viewers}</div>
                  <div className="text-[9px] font-mono text-slate-700">avg</div>
                </div>
              )}
              {s.peak_viewers != null && (
                <div className="text-right">
                  <div className="text-sm font-black text-cyan-400">{s.peak_viewers}</div>
                  <div className="text-[9px] font-mono text-slate-700">peak</div>
                </div>
              )}
              <SourceBadge source={s.source} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
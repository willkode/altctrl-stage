import EmptyState from "../EmptyState";
import { buildHeatmapData, HEATMAP_HOURS, HEATMAP_DAYS } from "../../../utils/analyticsCalc";



export default function TimeHeatmap({ sessions }) {
  const { grid, hasEnoughData } = buildHeatmapData(sessions);
  if (!hasEnoughData) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// TIME SLOT HEATMAP</div>
        <EmptyState title="Need more data" message="Log at least 3 sessions with start times to see your streaming heatmap." />
      </div>
    );
  }

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">// TIME SLOT HEATMAP</div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-700">
          <span className="w-3 h-3 rounded-sm bg-cyan-900/30" /> Low
          <span className="w-3 h-3 rounded-sm bg-cyan-400" style={{ boxShadow: "0 0 4px rgba(0,245,255,0.6)" }} /> High
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          {/* Hour headers */}
          <div className="flex gap-1 mb-1 ml-10">
            {HEATMAP_HOURS.map(h => (
              <div key={h} className="flex-1 text-center text-[8px] font-mono text-slate-700">
                {h % 3 === 0 ? `${h > 12 ? h - 12 : h}${h >= 12 ? "p" : "a"}` : ""}
              </div>
            ))}
          </div>
          {/* Rows */}
          {HEATMAP_DAYS.map((day, d) => (
            <div key={day} className="flex items-center gap-1 mb-1">
              <div className="w-10 text-[10px] font-mono text-slate-600 shrink-0">{day}</div>
              {HEATMAP_HOURS.map((h, hi) => {
                const cell = grid[d][hi];
                const intensity = cell?.intensity || 0;
                const avg = cell?.avgViewers;
                return (
                  <div key={h}
                    title={cell?.count ? `${cell.count} session${cell.count > 1 ? "s" : ""}${avg ? ` · avg ${avg} viewers` : ""}` : ""}
                    className="flex-1 aspect-square rounded-sm transition-all cursor-default"
                    style={{
                      background: intensity > 0
                        ? `rgba(0, 245, 255, ${0.1 + intensity * 0.85})`
                        : "rgba(2,4,15,0.8)",
                      border: intensity > 0 ? "1px solid rgba(0,245,255,0.2)" : "1px solid rgba(255,255,255,0.03)",
                      boxShadow: intensity > 0.7 ? "0 0 6px rgba(0,245,255,0.3)" : "none",
                    }} />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
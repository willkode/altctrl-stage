import EmptyState from "../EmptyState";

const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6am–midnight
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayIndex(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return (d.getDay() + 6) % 7; // 0=Mon
}
function hourBucket(timeStr) {
  if (!timeStr) return null;
  const h = parseInt(timeStr.split(":")[0]);
  return isNaN(h) ? null : h;
}

export default function TimeHeatmap({ sessions }) {
  const withTime = sessions.filter(s => s.start_time && s.stream_date);
  if (withTime.length < 3) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// TIME SLOT HEATMAP</div>
        <EmptyState title="Need more data" message="Log at least 3 sessions with start times to see your streaming heatmap." />
      </div>
    );
  }

  // Build grid: grid[day][hour] = { count, avgViewers }
  const grid = Array.from({ length: 7 }, () => ({}));
  withTime.forEach(s => {
    const d = dayIndex(s.stream_date);
    const h = hourBucket(s.start_time);
    if (h === null) return;
    if (!grid[d][h]) grid[d][h] = { count: 0, totalViewers: 0 };
    grid[d][h].count++;
    grid[d][h].totalViewers += s.avg_viewers || 0;
  });

  const maxCount = Math.max(...DAYS.flatMap((_, d) => HOURS.map(h => grid[d][h]?.count || 0)));

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
            {HOURS.map(h => (
              <div key={h} className="flex-1 text-center text-[8px] font-mono text-slate-700">
                {h % 3 === 0 ? `${h > 12 ? h - 12 : h}${h >= 12 ? "p" : "a"}` : ""}
              </div>
            ))}
          </div>
          {/* Rows */}
          {DAYS.map((day, d) => (
            <div key={day} className="flex items-center gap-1 mb-1">
              <div className="w-10 text-[10px] font-mono text-slate-600 shrink-0">{day}</div>
              {HOURS.map(h => {
                const cell = grid[d][h];
                const intensity = cell ? cell.count / maxCount : 0;
                const avg = cell ? Math.round(cell.totalViewers / cell.count) : null;
                return (
                  <div key={h}
                    title={cell ? `${cell.count} session${cell.count > 1 ? "s" : ""}${avg ? ` · avg ${avg} viewers` : ""}` : ""}
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
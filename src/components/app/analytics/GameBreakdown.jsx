import EmptyState from "../EmptyState";
import { buildGameBreakdown } from "../../../utils/analyticsCalc";

export default function GameBreakdown({ sessions }) {
  const { rows, hasEnoughData } = buildGameBreakdown(sessions);
  const maxAvg = rows[0]?.avgViewers || 1;

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
      <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// GAME BREAKDOWN</div>
      {!hasEnoughData ? (
        <EmptyState title="No game data" message="Log sessions with viewer data to see game performance." />
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={r.game}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  {i === 0 && <span className="text-[9px] font-mono text-yellow-400 shrink-0">★</span>}
                  <span className="text-xs font-black uppercase text-white truncate">{r.game}</span>
                  <span className="text-[10px] font-mono text-slate-700 shrink-0">{r.sessions}×</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div>
                    <div className="text-xs font-black text-cyan-400">{r.avgViewers}</div>
                    <div className="text-[9px] font-mono text-slate-700">avg</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-pink-400">{r.peakViewers || "—"}</div>
                    <div className="text-[9px] font-mono text-slate-700">peak</div>
                  </div>
                  {r.followers > 0 && (
                    <div>
                      <div className="text-xs font-black text-yellow-400">+{r.followers}</div>
                      <div className="text-[9px] font-mono text-slate-700">follows</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-1 bg-[#02040f] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${r.barWidth}%`, boxShadow: i === 0 ? "0 0 6px rgba(0,245,255,0.6)" : "none" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
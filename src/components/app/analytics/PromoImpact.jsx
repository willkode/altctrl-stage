import { Zap } from "lucide-react";
import EmptyState from "../EmptyState";

export default function PromoImpact({ sessions }) {
  const withPromo = sessions.filter(s => s.promo_posted && s.avg_viewers != null);
  const withoutPromo = sessions.filter(s => !s.promo_posted && s.avg_viewers != null);

  const avg = (arr) => arr.length > 0
    ? Math.round(arr.reduce((a, s) => a + s.avg_viewers, 0) / arr.length)
    : null;

  const avgWith = avg(withPromo);
  const avgWithout = avg(withoutPromo);
  const hasBoth = avgWith !== null && avgWithout !== null;
  const diff = hasBoth ? avgWith - avgWithout : null;
  const pct = hasBoth && avgWithout > 0 ? Math.round(((avgWith - avgWithout) / avgWithout) * 100) : null;

  const promoRate = sessions.length > 0
    ? Math.round((withPromo.length / sessions.filter(s => s.avg_viewers != null).length) * 100) || 0
    : 0;

  return (
    <div className="bg-[#060d1f] border border-pink-900/20 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400">// PROMO IMPACT</div>
        <Zap className="w-3 h-3 text-pink-400/50" />
      </div>

      {!hasBoth ? (
        <EmptyState
          title="Not enough comparison data"
          message="Stream with and without promo to see how it affects your viewer numbers."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-[#02040f] border border-pink-900/30 rounded-lg p-4 text-center">
              <div className="text-[10px] font-mono uppercase text-pink-400 mb-2">With Promo</div>
              <div className="text-2xl font-black text-white">{avgWith}</div>
              <div className="text-[10px] font-mono text-slate-600 mt-1">{withPromo.length} sessions</div>
            </div>
            <div className="bg-[#02040f] border border-cyan-900/30 rounded-lg p-4 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-500 mb-2">Without Promo</div>
              <div className="text-2xl font-black text-white">{avgWithout}</div>
              <div className="text-[10px] font-mono text-slate-600 mt-1">{withoutPromo.length} sessions</div>
            </div>
          </div>

          {diff !== null && (
            <div className={`rounded-lg p-3 text-center border ${diff >= 0 ? "bg-green-500/5 border-green-900/30" : "bg-red-500/5 border-red-900/30"}`}>
              <span className={`text-sm font-black ${diff >= 0 ? "text-green-400" : "text-red-400"}`}>
                {diff >= 0 ? "+" : ""}{diff} avg viewers
              </span>
              {pct !== null && (
                <span className="text-xs font-mono text-slate-600 ml-2">
                  ({diff >= 0 ? "+" : ""}{pct}%)
                </span>
              )}
              <div className="text-[10px] font-mono text-slate-600 mt-1">when promo was posted</div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-600">
            <span>Promo rate</span>
            <span className={`font-bold ${promoRate >= 60 ? "text-green-400" : promoRate >= 30 ? "text-yellow-400" : "text-pink-400"}`}>{promoRate}%</span>
          </div>
          <div className="h-1.5 bg-[#02040f] rounded-full mt-1 overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${promoRate}%`,
                background: promoRate >= 60 ? "#4ade80" : promoRate >= 30 ? "#facc15" : "#ff0080",
              }} />
          </div>
        </>
      )}
    </div>
  );
}
import { Zap } from "lucide-react";
import EmptyState from "../EmptyState";
import { buildPromoImpact } from "../../../utils/analyticsCalc";

export default function PromoImpact({ sessions }) {
  const { hasEnoughData, withPromoCount, withoutPromoCount, avgViewersWith, avgViewersWithout, viewerDiff, viewerDiffPct, promoRate } = buildPromoImpact(sessions);

  return (
    <div className="bg-[#060d1f] border border-pink-900/20 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400">// PROMO IMPACT</div>
        <Zap className="w-3 h-3 text-pink-400/50" />
      </div>

      {!hasEnoughData ? (
        <EmptyState
          title="Not enough comparison data"
          message="Stream with and without promo to see how it affects your viewer numbers."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-[#02040f] border border-pink-900/30 rounded-lg p-4 text-center">
              <div className="text-[10px] font-mono uppercase text-pink-400 mb-2">With Promo</div>
              <div className="text-2xl font-black text-white">{avgViewersWith}</div>
              <div className="text-[10px] font-mono text-slate-600 mt-1">{withPromoCount} sessions</div>
            </div>
            <div className="bg-[#02040f] border border-cyan-900/30 rounded-lg p-4 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-500 mb-2">Without Promo</div>
              <div className="text-2xl font-black text-white">{avgViewersWithout}</div>
              <div className="text-[10px] font-mono text-slate-600 mt-1">{withoutPromoCount} sessions</div>
            </div>
          </div>

          {viewerDiff !== null && (
            <div className={`rounded-lg p-3 text-center border ${viewerDiff >= 0 ? "bg-green-500/5 border-green-900/30" : "bg-red-500/5 border-red-900/30"}`}>
              <span className={`text-sm font-black ${viewerDiff >= 0 ? "text-green-400" : "text-red-400"}`}>
                {viewerDiff >= 0 ? "+" : ""}{viewerDiff} avg viewers
              </span>
              {viewerDiffPct !== null && (
                <span className="text-xs font-mono text-slate-600 ml-2">
                  ({viewerDiff >= 0 ? "+" : ""}{viewerDiffPct}%)
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
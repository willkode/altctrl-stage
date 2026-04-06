import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "../EmptyState";
import { buildPromoImpact } from "../../../utils/analyticsCalc";

export default function PromoImpact({ sessions }) {
  const [verifiedPromos, setVerifiedPromos] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function verifyPromos() {
      if (sessions.length === 0) return;
      setLoading(true);
      try {
        const sessionIds = sessions.map(s => s.scheduled_stream_id).filter(Boolean);
        if (sessionIds.length === 0) {
          setLoading(false);
          return;
        }
        const res = await base44.functions.invoke('verifyPromoImpact', { session_ids: sessionIds });
        setVerifiedPromos(res.data?.verified_promos || {});
      } catch (err) {
        console.error('Failed to verify promos:', err);
      } finally {
        setLoading(false);
      }
    }
    verifyPromos();
  }, [sessions]);

  // Filter sessions: with promo = verified match, without promo = no match
  const withPromoVerified = sessions.filter(s => verifiedPromos[s.scheduled_stream_id]?.verified);
  const withoutPromoVerified = sessions.filter(s => s.scheduled_stream_id && !verifiedPromos[s.scheduled_stream_id]?.verified);

  const { hasEnoughData, withPromoCount, withoutPromoCount, avgViewersWith, avgViewersWithout, viewerDiff, viewerDiffPct, promoRate } = buildPromoImpact(sessions);
  const verifiedEnoughData = withPromoVerified.filter(s => s.avg_viewers != null && s.avg_viewers > 0).length >= 2 && withoutPromoVerified.filter(s => s.avg_viewers != null && s.avg_viewers > 0).length >= 2;

  // Recalculate stats with verified data
  const verifiedWithPromo = withPromoVerified.filter(s => s.avg_viewers != null && s.avg_viewers > 0).map(s => s.avg_viewers);
  const verifiedWithoutPromo = withoutPromoVerified.filter(s => s.avg_viewers != null && s.avg_viewers > 0).map(s => s.avg_viewers);
  const verifiedAvgWith = verifiedWithPromo.length > 0 ? Math.round(verifiedWithPromo.reduce((a, b) => a + b) / verifiedWithPromo.length) : null;
  const verifiedAvgWithout = verifiedWithoutPromo.length > 0 ? Math.round(verifiedWithoutPromo.reduce((a, b) => a + b) / verifiedWithoutPromo.length) : null;
  const verifiedDiff = verifiedAvgWith !== null && verifiedAvgWithout !== null ? verifiedAvgWith - verifiedAvgWithout : null;
  const verifiedDiffPct = verifiedDiff !== null && verifiedAvgWithout > 0 ? Math.round((verifiedDiff / verifiedAvgWithout) * 100) : null;

  return (
    <div className="bg-[#060d1f] border border-pink-900/20 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400">// PROMO IMPACT {loading && '(verifying...)'}"</div>
        <Zap className="w-3 h-3 text-pink-400/50" />
      </div>

      {!hasEnoughData ? (
        <EmptyState
          title="Not enough comparison data"
          message="Stream with and without promo to see how it affects your viewer numbers."
        />
      ) : (
        <>
          {verifiedEnoughData && (
            <div className="mb-4 p-3 bg-green-500/5 border border-green-900/30 rounded-lg">
              <div className="text-[10px] font-mono uppercase text-green-400 mb-2">// TikTok Verified Promos</div>
              <div className="text-xs text-slate-400">Matched {withPromoVerified.length} sessions with TikTok videos</div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-[#02040f] border border-pink-900/30 rounded-lg p-4 text-center">
              <div className="text-[10px] font-mono uppercase text-pink-400 mb-2">{verifiedEnoughData ? 'Verified With Promo' : 'With Promo'}</div>
              <div className="text-2xl font-black text-white">{verifiedEnoughData ? verifiedAvgWith : avgViewersWith}</div>
              <div className="text-[10px] font-mono text-slate-600 mt-1">{verifiedEnoughData ? withPromoVerified.length : withPromoCount} sessions</div>
            </div>
            <div className="bg-[#02040f] border border-cyan-900/30 rounded-lg p-4 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-500 mb-2">{verifiedEnoughData ? 'Verified Without Promo' : 'Without Promo'}</div>
              <div className="text-2xl font-black text-white">{verifiedEnoughData ? verifiedAvgWithout : avgViewersWithout}</div>
              <div className="text-[10px] font-mono text-slate-600 mt-1">{verifiedEnoughData ? withoutPromoVerified.length : withoutPromoCount} sessions</div>
            </div>
          </div>

          {(verifiedEnoughData ? verifiedDiff : viewerDiff) !== null && (
            <div className={`rounded-lg p-3 text-center border ${(verifiedEnoughData ? verifiedDiff : viewerDiff) >= 0 ? "bg-green-500/5 border-green-900/30" : "bg-red-500/5 border-red-900/30"}`}>
              <span className={`text-sm font-black ${(verifiedEnoughData ? verifiedDiff : viewerDiff) >= 0 ? "text-green-400" : "text-red-400"}`}>
                {(verifiedEnoughData ? verifiedDiff : viewerDiff) >= 0 ? "+" : ""}{verifiedEnoughData ? verifiedDiff : viewerDiff} avg viewers
              </span>
              {(verifiedEnoughData ? verifiedDiffPct : viewerDiffPct) !== null && (
                <span className="text-xs font-mono text-slate-600 ml-2">
                  ({(verifiedEnoughData ? verifiedDiff : viewerDiff) >= 0 ? "+" : ""}{verifiedEnoughData ? verifiedDiffPct : viewerDiffPct}%)
                </span>
              )}
              <div className="text-[10px] font-mono text-slate-600 mt-1">when {verifiedEnoughData ? 'verified' : ''} promo was posted</div>
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
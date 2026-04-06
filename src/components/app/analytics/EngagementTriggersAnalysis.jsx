import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, Clock, Target, TrendingUp } from "lucide-react";

export default function EngagementTriggersAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  async function loadAnalysis() {
    setLoading(true);
    const res = await base44.functions.invoke('analyzeEngagementTriggers', {});
    setAnalysis(res.data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-[#060d1f] border border-yellow-900/20 rounded-xl p-5 flex items-center justify-center py-8">
        <div className="animate-spin w-5 h-5 border-2 border-yellow-400 border-t-yellow-500 rounded-full" />
      </div>
    );
  }

  if (!analysis || analysis.triggers.length === 0) {
    return (
      <div className="bg-[#060d1f] border border-yellow-900/20 rounded-xl p-5">
        <div className="text-xs text-slate-600 text-center py-6">Log more high-performing sessions to get engagement trigger recommendations.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#060d1f] border border-yellow-900/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-yellow-400" />
          <div className="text-xs font-mono uppercase tracking-widest text-yellow-400">// Data-Backed Engagement Triggers</div>
          <span className="text-[9px] font-mono text-slate-600 ml-auto">Based on {analysis.sessionsAnalyzed} high-performers</span>
        </div>

        {/* Game recommendation */}
        {analysis.gameRecommendation && (
          <div className="bg-yellow-500/5 border border-yellow-900/30 rounded-lg px-4 py-3 mb-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 mb-1">Game Focus</div>
            <p className="text-xs text-slate-300">{analysis.gameRecommendation}</p>
          </div>
        )}

        {/* Promo timing */}
        {analysis.promoTiming && (
          <div className="bg-yellow-500/5 border border-yellow-900/30 rounded-lg px-4 py-3 mb-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 mb-1">Promo Strategy</div>
            <p className="text-xs text-slate-300">{analysis.promoTiming}</p>
          </div>
        )}

        {/* Triggers timeline */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-2">Engagement Timeline</div>
          {analysis.triggers.map((trigger, idx) => (
            <div key={idx} className="bg-[#02040f] border border-yellow-900/15 rounded-lg p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-yellow-400/60" />
                  <span className="text-xs font-bold text-yellow-400 min-w-[2rem]">Min {trigger.minute}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white mb-1">{trigger.action}</p>
                  <p className="text-[10px] text-slate-500 mb-2">{trigger.reasoning}</p>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-green-400/60" />
                    <span className="text-[9px] font-mono text-green-400/70">{trigger.expectedOutcome}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
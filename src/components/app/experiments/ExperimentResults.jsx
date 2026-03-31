import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, AlertCircle } from "lucide-react";

export default function ExperimentResults({ experiment, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [sessionsA, setSessionsA] = useState([]);
  const [sessionsB, setSessionsB] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    calculateResult();
  }, [experiment]);

  async function calculateResult() {
    if (!experiment.sessions_a_ids || !experiment.sessions_b_ids) {
      setResult(null);
      return;
    }

    setLoading(true);
    const user = await base44.auth.me();
    const allSessions = await base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 200);

    const aIds = experiment.sessions_a_ids.split(",").map(x => x.trim()).filter(Boolean);
    const bIds = experiment.sessions_b_ids.split(",").map(x => x.trim()).filter(Boolean);

    const a = allSessions.filter(s => aIds.includes(s.id));
    const b = allSessions.filter(s => bIds.includes(s.id));

    setSessionsA(a);
    setSessionsB(b);

    if (a.length === 0 || b.length === 0) {
      setResult(null);
      setLoading(false);
      return;
    }

    // Calculate metric
    const metricKey = experiment.success_metric;
    const calcAvg = (sessions) => {
      if (sessions.length === 0) return 0;
      const total = sessions.reduce((sum, s) => sum + (s[metricKey] || 0), 0);
      return total / sessions.length;
    };

    const avgA = calcAvg(a);
    const avgB = calcAvg(b);
    const winner = avgA > avgB ? "a" : avgB > avgA ? "b" : "tie";
    const diff = Math.abs(avgA - avgB);
    const diffPercent = avgA > 0 ? ((diff / avgA) * 100).toFixed(1) : 0;

    setResult({
      avgA: avgA.toFixed(1),
      avgB: avgB.toFixed(1),
      winner,
      diff: diff.toFixed(1),
      diffPercent,
    });
    setLoading(false);
  }

  if (!experiment.sessions_a_ids || !experiment.sessions_b_ids) {
    return (
      <div className="bg-[#02040f] border border-cyan-900/20 rounded p-4">
        <div className="flex gap-2 text-xs font-mono text-slate-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Link sessions to both variants to calculate results.</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-xs font-mono text-slate-600">Calculating...</div>;
  }

  if (!result) {
    return (
      <div className="bg-[#02040f] border border-cyan-900/20 rounded p-4">
        <div className="text-xs font-mono text-slate-600">No sessions linked yet for both variants.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Variant A</div>
          <div className="text-xl font-black text-cyan-400">{result.avgA}</div>
          <div className="text-[9px] text-slate-700 mt-1">{sessionsA.length} session{sessionsA.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Variant B</div>
          <div className="text-xl font-black text-pink-400">{result.avgB}</div>
          <div className="text-[9px] text-slate-700 mt-1">{sessionsB.length} session{sessionsB.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {result.winner !== "tie" && (
        <div className={`border rounded p-3 ${result.winner === "a" ? "bg-cyan-500/5 border-cyan-500/30" : "bg-pink-500/5 border-pink-500/30"}`}>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${result.winner === "a" ? "text-cyan-400" : "text-pink-400"}`} />
            <div>
              <div className={`text-xs font-black ${result.winner === "a" ? "text-cyan-400" : "text-pink-400"}`}>
                Variant {result.winner.toUpperCase()} wins
              </div>
              <div className="text-[9px] text-slate-600">
                +{result.diffPercent}% difference ({result.diff} {experiment.success_metric.replace("_", " ")})
              </div>
            </div>
          </div>
        </div>
      )}

      {result.winner === "tie" && (
        <div className="border border-slate-700/30 rounded p-3 bg-slate-500/5">
          <div className="text-xs font-mono text-slate-500">No clear winner — results are tied.</div>
        </div>
      )}
    </div>
  );
}
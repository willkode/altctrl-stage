import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import LogSessionDrawer from "../../components/app/drawers/LogSessionDrawer";
import SummaryStats from "../../components/app/analytics/SummaryStats";
import PerformanceChart from "../../components/app/analytics/PerformanceChart";
import GameBreakdown from "../../components/app/analytics/GameBreakdown";
import TimeHeatmap from "../../components/app/analytics/TimeHeatmap";
import PromoImpact from "../../components/app/analytics/PromoImpact";
import SessionHistory from "../../components/app/analytics/SessionHistory";
import { Plus } from "lucide-react";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [logOpen, setLogOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const all = await base44.entities.LiveSession.filter(
      { created_by: user.email },
      "-stream_date",
      200
    );
    setSessions(all);
    setLoading(false);
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// PILLAR_04 — PERFORMANCE</div>
          <h1 className="text-2xl font-black uppercase text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-mono">Turn your session data into clear, actionable insight.</p>
        </div>
        <button
          onClick={() => setLogOpen(true)}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-4 py-2.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all shrink-0">
          <Plus className="w-3.5 h-3.5" /> Log Session
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading performance data..." />
      ) : (
        <div className="space-y-6">
          <SummaryStats sessions={sessions} />
          <PerformanceChart sessions={sessions} />
          <div className="grid md:grid-cols-2 gap-6">
            <GameBreakdown sessions={sessions} />
            <PromoImpact sessions={sessions} />
          </div>
          <TimeHeatmap sessions={sessions} />
          <SessionHistory sessions={sessions} onLogSession={() => setLogOpen(true)} onRefresh={loadData} />
        </div>
      )}

      <LogSessionDrawer open={logOpen} onClose={() => setLogOpen(false)} onSaved={loadData} />
    </PageContainer>
  );
}
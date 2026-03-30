import PageContainer from "../../components/app/PageContainer";
import SectionHeader from "../../components/app/SectionHeader";
import StatCard from "../../components/app/StatCard";
import ChartCard from "../../components/app/ChartCard";
import EmptyState from "../../components/app/EmptyState";
import AppBadge from "../../components/app/AppBadge";
import { Plus, TrendingUp, Users, Eye } from "lucide-react";

export default function Analytics() {
  return (
    <PageContainer>
      <SectionHeader
        tag="PILLAR_04"
        title="Analytics"
        subtitle="Track performance across every session."
        accent="cyan"
        action={
          <button className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all">
            <Plus className="w-3.5 h-3.5" />
            Log Session
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Total Sessions" value="0" sub="all time" accent="cyan" icon={TrendingUp} />
        <StatCard label="Avg Viewers" value="—" sub="last 30 days" accent="pink" icon={Users} />
        <StatCard label="Peak Viewers" value="—" sub="all time" accent="yellow" icon={Eye} />
      </div>

      {/* Chart placeholder */}
      <ChartCard title="Viewer Trend — Last 30 Days" tag="Performance" accent="cyan" className="mb-6">
        <EmptyState
          title="No data yet"
          message="Log your first session to start tracking viewer trends."
        />
      </ChartCard>

      {/* Session history */}
      <SectionHeader tag="Session Log" title="Recent Sessions" accent="cyan" />
      <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg overflow-hidden">
        <div className="grid grid-cols-5 px-4 py-2 border-b border-cyan-900/30 text-xs font-mono uppercase tracking-widest text-slate-600">
          <span>Date</span>
          <span>Game</span>
          <span>Avg</span>
          <span>Peak</span>
          <span>Promo</span>
        </div>
        <EmptyState title="No sessions logged" message="Add your first session above." />
      </div>
    </PageContainer>
  );
}
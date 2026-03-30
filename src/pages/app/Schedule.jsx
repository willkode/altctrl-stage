import PageContainer from "../../components/app/PageContainer";
import SectionHeader from "../../components/app/SectionHeader";
import EmptyState from "../../components/app/EmptyState";
import AppBadge from "../../components/app/AppBadge";
import { Plus } from "lucide-react";

export default function Schedule() {
  return (
    <PageContainer>
      <SectionHeader
        tag="PILLAR_01"
        title="Schedule"
        subtitle="Build your weekly stream calendar."
        accent="cyan"
        action={
          <button className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all">
            <Plus className="w-3.5 h-3.5" />
            New Stream
          </button>
        }
      />

      {/* Week selector */}
      <div className="flex items-center gap-3 mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-slate-500">// WEEK OF</div>
        <div className="text-sm font-black uppercase text-white">March 30 – April 5, 2026</div>
        <AppBadge label="Current Week" accent="cyan" />
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
          <div key={i} className="bg-[#060d1f] border border-cyan-900/30 rounded p-2 text-center">
            <div className="text-xs font-mono uppercase text-slate-600 mb-1">{d}</div>
            <div className="text-xs text-slate-700 font-mono">{30 + i > 31 ? (30 + i) - 31 : 30 + i}</div>
          </div>
        ))}
      </div>

      <EmptyState
        title="No streams scheduled"
        message="Tap 'New Stream' to add your first stream slot for this week."
        action={
          <button className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-5 py-3 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all">
            <Plus className="w-3.5 h-3.5" />
            Schedule First Stream
          </button>
        }
      />
    </PageContainer>
  );
}
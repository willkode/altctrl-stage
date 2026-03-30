import PageContainer from "../../components/app/PageContainer";
import SectionHeader from "../../components/app/SectionHeader";
import ActionCard from "../../components/app/ActionCard";
import AppBadge from "../../components/app/AppBadge";
import ProgressBar from "../../components/app/ProgressBar";
import { Brain, Target, Calendar, TrendingUp } from "lucide-react";

export default function Coach() {
  return (
    <PageContainer>
      <SectionHeader
        tag="PILLAR_03"
        title="Coach"
        subtitle="Daily focus and weekly guidance based on your data."
        accent="yellow"
      />

      {/* Daily card */}
      <div className="bg-[#060d1f] border border-yellow-400/30 rounded-lg p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-yellow-400" />
          <div className="text-xs font-mono uppercase tracking-widest text-yellow-400">// TODAY'S FOCUS</div>
          <AppBadge label="Monday" accent="yellow" />
        </div>
        <p className="text-white font-black uppercase text-sm mb-2">START WITH YOUR SCHEDULE.</p>
        <p className="text-slate-400 text-sm leading-relaxed">
          You haven't logged any sessions yet. The best move today is to plan your week and schedule your first stream slot.
        </p>
        <div className="mt-4 text-xs font-mono text-yellow-400/60">// Log 3 sessions to unlock personalized coaching.</div>
      </div>

      {/* Goals */}
      <SectionHeader tag="Goals" title="Weekly Targets" accent="yellow" />
      <div className="bg-[#060d1f] border border-yellow-900/30 rounded-lg p-5 mb-6 space-y-4">
        <ProgressBar value={0} max={5} label="Streams this week" accent="yellow" />
        <ProgressBar value={0} max={5} label="Promo posted before streams" accent="pink" />
        <ProgressBar value={0} max={5} label="Sessions logged" accent="cyan" />
      </div>

      {/* Next actions */}
      <SectionHeader tag="Recommended" title="What To Do Next" accent="yellow" />
      <div className="grid sm:grid-cols-2 gap-3">
        <ActionCard
          title="Set Your Weekly Goal"
          description="Define how many streams you want to do this week."
          icon={Target}
          accent="yellow"
          cta="Set Goal"
        />
        <ActionCard
          title="Plan This Week"
          description="Add stream slots to your schedule before the week slips."
          icon={Calendar}
          accent="cyan"
          cta="Open Schedule"
          onClick={() => window.location.href = "/app/schedule"}
        />
        <ActionCard
          title="Log Last Session"
          description="Record your last stream's performance to unlock insights."
          icon={TrendingUp}
          accent="pink"
          cta="Log Session"
          onClick={() => window.location.href = "/app/analytics"}
        />
      </div>
    </PageContainer>
  );
}
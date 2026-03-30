import PageContainer from "../../components/app/PageContainer";
import SectionHeader from "../../components/app/SectionHeader";
import StatCard from "../../components/app/StatCard";
import ActionCard from "../../components/app/ActionCard";
import ProgressBar from "../../components/app/ProgressBar";
import AppBadge from "../../components/app/AppBadge";
import { Calendar, Radio, TrendingUp, Brain, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <PageContainer>
      {/* Welcome */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// WELCOME BACK</div>
        <h1 className="text-2xl font-black uppercase text-white">YOUR WEEK AT A GLANCE</h1>
        <p className="text-sm text-slate-500 mt-1">Monday, Week 13 — Let's run the loop.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Streams" value="0" sub="this week" accent="cyan" icon={Zap} />
        <StatCard label="Avg Viewers" value="—" sub="last 30 days" accent="pink" />
        <StatCard label="Followers" value="—" sub="gained this week" accent="yellow" />
        <StatCard label="Streak" value="0" sub="days consistent" accent="cyan" />
      </div>

      {/* Weekly consistency */}
      <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-5 mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// WEEKLY CONSISTENCY</div>
        <ProgressBar value={0} max={5} label="Streams this week (0 / 5 target)" accent="cyan" />
      </div>

      {/* Quick actions */}
      <SectionHeader tag="Quick Actions" title="What do you want to do?" />
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        <ActionCard
          title="Plan This Week"
          description="Set your stream schedule and targets for the week."
          icon={Calendar}
          accent="cyan"
          cta="Open Schedule"
          onClick={() => window.location.href = "/app/schedule"}
        />
        <ActionCard
          title="Generate Promo"
          description="Create a promo pack before your next stream."
          icon={Radio}
          accent="pink"
          cta="Open Promo"
          onClick={() => window.location.href = "/app/promo"}
        />
        <ActionCard
          title="Log a Session"
          description="Record the results from your last stream."
          icon={TrendingUp}
          accent="yellow"
          cta="Log Session"
          onClick={() => window.location.href = "/app/analytics"}
        />
        <ActionCard
          title="Today's Coaching"
          description="See what to focus on today based on your performance."
          icon={Brain}
          accent="cyan"
          cta="Open Coach"
          onClick={() => window.location.href = "/app/coach"}
        />
      </div>

      {/* Status tags */}
      <div className="flex flex-wrap gap-2">
        <AppBadge label="Beta" accent="cyan" dot />
        <AppBadge label="Signal Active" accent="green" dot />
        <AppBadge label="No streams logged" accent="slate" />
      </div>
    </PageContainer>
  );
}
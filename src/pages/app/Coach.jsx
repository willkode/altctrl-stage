import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import DailyCoachingCard from "../../components/app/coach/DailyCoachingCard";
import WeeklyGamePlan from "../../components/app/coach/WeeklyGamePlan";
import GoalsTracker from "../../components/app/coach/GoalsTracker";
import WeeklyRecapPreview from "../../components/app/coach/WeeklyRecapPreview";
import AlertsFeed from "../../components/app/coach/AlertsFeed";
import { Calendar } from "lucide-react";

export default function Coach() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [weeklyRecap, setWeeklyRecap] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [streams, setStreams] = useState([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const [sessionList, profiles, goalList, recs, plans, recaps, alertList, streamList] = await Promise.all([
      base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 100),
      base44.entities.CreatorProfile.filter({ created_by: user.email }),
      base44.entities.GrowthGoal.filter({ created_by: user.email, status: "active" }, "-created_date", 100),
      base44.entities.DailyRecommendation.filter({ created_by: user.email }, "-created_date", 1),
      base44.entities.WeeklyPlan.filter({ created_by: user.email }, "-week_number", 1),
      base44.entities.WeeklyRecap.filter({ created_by: user.email }, "-week_number", 1),
      base44.entities.PerformanceAlert.filter({ created_by: user.email, dismissed: false }, "-created_date", 50),
      base44.entities.ScheduledStream.filter({ created_by: user.email }, "-scheduled_date", 100),
    ]);
    setSessions(sessionList);
    setProfile(profiles[0] || null);
    setGoals(goalList.slice(0, 5)); // Max 5 active
    setRecommendation(recs[0] || null);
    setWeeklyPlan(plans[0] || null);
    setWeeklyRecap(recaps[0] || null);
    setAlerts(alertList);
    setStreams(streamList);
    setLoading(false);
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-1">// PILLAR_03 — COACHING</div>
        <h1 className="text-2xl font-black uppercase text-white">Coach</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">Daily focus and weekly guidance based on your data.</p>
      </div>

      {loading ? (
        <LoadingState message="Loading coaching insights..." />
      ) : (
        <div className="space-y-6">
          <DailyCoachingCard recommendation={recommendation} sessions={sessions} profile={profile} onRefresh={loadData} />
          <div className="grid md:grid-cols-2 gap-6">
            <WeeklyGamePlan plan={weeklyPlan} streams={streams.filter(s => {
              const d = new Date(s.scheduled_date);
              const start = new Date();
              start.setDate(start.getDate() - start.getDay() + 1);
              start.setHours(0, 0, 0, 0);
              return d >= start;
            })} sessions={sessions} profile={profile} />
            <GoalsTracker goals={goals} sessions={sessions} onRefresh={loadData} />
          </div>
          <WeeklyRecapPreview recap={weeklyRecap} previousRecap={null} />
          <AlertsFeed alerts={alerts} onRefresh={loadData} />
        </div>
      )}
    </PageContainer>
  );
}
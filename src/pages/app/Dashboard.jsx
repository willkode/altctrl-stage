import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import HeroWelcome from "../../components/app/dashboard/HeroWelcome";
import QuickStatsRow from "../../components/app/dashboard/QuickStatsRow";
import WeekMiniCalendar from "../../components/app/dashboard/WeekMiniCalendar";
import TodayStreamCard from "../../components/app/dashboard/TodayStreamCard";
import CoachPreview from "../../components/app/dashboard/CoachPreview";
import GoalsPreview from "../../components/app/dashboard/GoalsPreview";
import AlertsPreview from "../../components/app/dashboard/AlertsPreview";
import RecentSessions from "../../components/app/dashboard/RecentSessions";
import NewCreatorChecklist from "../../components/app/NewCreatorChecklist";
import StreamDrawer from "../../components/app/drawers/StreamDrawer";
import LogSessionDrawer from "../../components/app/drawers/LogSessionDrawer";
import GoalDrawer from "../../components/app/drawers/GoalDrawer";

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

const TODAY_STR = new Date().toISOString().split("T")[0];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [todayStream, setTodayStream] = useState(null);
  const [weekStreams, setWeekStreams] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [todayRec, setTodayRec] = useState(null);
  const [goals, setGoals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weekPlan, setWeekPlan] = useState(null);
  const [drawer, setDrawer] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const user = await base44.auth.me();
    const now = new Date();
    const week = getISOWeek(now);
    const year = now.getFullYear();

    const [profiles, streams, sessions, recs, goalsList, alertsList, plans] = await Promise.all([
      base44.entities.CreatorProfile.filter({ created_by: user.email }),
      base44.entities.ScheduledStream.filter({ created_by: user.email }),
      base44.entities.LiveSession.filter({ owner_email: user.email }, "-stream_date", 10),
      base44.entities.DailyRecommendation.filter({ created_by: user.email, date: TODAY_STR }),
      base44.entities.GrowthGoal.filter({ created_by: user.email, status: "active" }),
      base44.entities.PerformanceAlert.filter({ created_by: user.email, read: false, dismissed: false }),
      base44.entities.WeeklyPlan.filter({ created_by: user.email, week_number: week, year }),
    ]);

    setProfile(profiles[0] || null);
    setTodayStream(streams.find(s => s.scheduled_date === TODAY_STR) || null);
    setWeekStreams(streams.filter(s => {
      const d = new Date(s.scheduled_date);
      return getISOWeek(d) === week && d.getFullYear() === year;
    }));
    setRecentSessions(sessions);
    setTodayRec(recs[0] || null);
    setGoals(goalsList);
    setAlerts(alertsList);
    setWeekPlan(plans[0] || null);
    setLoading(false);
  }

  const dismissAlert = async (id) => {
    await base44.entities.PerformanceAlert.update(id, { dismissed: true });
    setAlerts(a => a.filter(x => x.id !== id));
  };

  if (loading) return <div className="pt-20"><LoadingState message="Loading command center..." /></div>;

  const weekTarget = weekPlan?.stream_target || profile?.weekly_stream_target || 3;
  const weekCompleted = weekStreams.filter(s => s.status === "completed").length;

  // Build week day data for mini calendar
  const now = new Date();
  const day = now.getDay();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - ((day + 6) % 7) + i);
    const dateStr = d.toISOString().split("T")[0];
    return { dateStr, stream: weekStreams.find(s => s.scheduled_date === dateStr) };
  });

  // Checklist keys
  const checklistKeys = [];
  if (profile?.display_name) checklistKeys.push("profile");
  if (weekStreams.length > 0 || recentSessions.length > 0) checklistKeys.push("stream");
  if (recentSessions.some(s => s.promo_posted)) checklistKeys.push("promo");
  if (recentSessions.length > 0) checklistKeys.push("session");
  if (recentSessions.length >= 3) checklistKeys.push("coach");

  const isNew = recentSessions.length === 0 && weekStreams.length === 0;

  // Calculate streak
  const sessionWeeks = new Set(recentSessions.map(s => {
    const d = new Date(s.stream_date);
    return `${d.getFullYear()}-${getISOWeek(d)}`;
  }));
  let streak = 0;
  for (let i = 0; i <= 52; i++) {
    const check = new Date(now);
    check.setDate(now.getDate() - i * 7);
    const key = `${check.getFullYear()}-${getISOWeek(check)}`;
    if (sessionWeeks.has(key)) streak++;
    else if (i > 0) break;
  }

  return (
    <PageContainer>
      <div className="space-y-5">
        {/* Hero */}
        <HeroWelcome profile={profile} />

        {/* Checklist for new creators */}
        {isNew && <NewCreatorChecklist completedKeys={checklistKeys} />}

        {/* Today's stream */}
        <TodayStreamCard
          stream={todayStream}
          onGeneratePromo={() => setDrawer("promo")}
          onLogSession={() => setDrawer("session")}
        />

        {/* Stats row */}
        <QuickStatsRow sessions={recentSessions} weekCompleted={weekCompleted} weekTarget={weekTarget} streak={streak} />

        {/* Two-column: Calendar + Coach */}
        <div className="grid md:grid-cols-2 gap-4">
          <WeekMiniCalendar weekDays={weekDays} weekCompleted={weekCompleted} weekTarget={weekTarget} />
          <CoachPreview rec={todayRec} />
        </div>

        {/* Two-column: Goals + Alerts */}
        <div className="grid md:grid-cols-2 gap-4">
          <GoalsPreview goals={goals} onAddGoal={() => setDrawer("goal")} />
          <AlertsPreview alerts={alerts} onDismiss={dismissAlert} />
        </div>

        {/* Recent sessions */}
        <RecentSessions sessions={recentSessions} />
      </div>

      {/* Drawers */}
      <StreamDrawer open={drawer === "stream"} onClose={() => setDrawer(null)} onSaved={loadAll} />
      <LogSessionDrawer
        open={drawer === "session"}
        onClose={() => setDrawer(null)}
        session={todayStream ? { game: todayStream.game, stream_type: todayStream.stream_type, stream_date: TODAY_STR, scheduled_stream_id: todayStream.id } : null}
        onSaved={loadAll}
      />
      <GoalDrawer open={drawer === "goal"} onClose={() => setDrawer(null)} onSaved={loadAll} />
    </PageContainer>
  );
}
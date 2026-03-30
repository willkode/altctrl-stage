import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import StatCard from "../../components/app/StatCard";
import ProgressBar from "../../components/app/ProgressBar";
import LoadingState from "../../components/app/LoadingState";
import DashboardTodayStream from "../../components/app/DashboardTodayStream";
import DashboardCoachCard from "../../components/app/DashboardCoachCard";
import DashboardGoalsSnapshot from "../../components/app/DashboardGoalsSnapshot";
import DashboardAlertsPreview from "../../components/app/DashboardAlertsPreview";
import GlitchText from "../../components/GlitchText";
import StreamDrawer from "../../components/app/drawers/StreamDrawer";
import LogSessionDrawer from "../../components/app/drawers/LogSessionDrawer";
import GoalDrawer from "../../components/app/drawers/GoalDrawer";
import AppBadge from "../../components/app/AppBadge";
import { Flame, Zap, TrendingUp, Calendar, Clock } from "lucide-react";

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
      base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 10),
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
  const todayName = DAYS[new Date().getDay()];
  const weekDays = [0, 1, 2, 3, 4, 5, 6].map(i => {
    const d = new Date();
    const day = d.getDay();
    const diff = i - ((day + 6) % 7); // week starts Mon
    const date = new Date(d);
    date.setDate(d.getDate() + diff - (day === 0 ? 6 : day - 1) + i);
    const dateStr = date.toISOString().split("T")[0];
    const stream = weekStreams.find(s => s.scheduled_date === dateStr);
    return { label: ["M", "T", "W", "T", "F", "S", "S"][i], dateStr, stream };
  });

  const avgViewers = recentSessions.length > 0
    ? Math.round(recentSessions.reduce((s, r) => s + (r.avg_viewers || 0), 0) / recentSessions.filter(s => s.avg_viewers).length) || null
    : null;

  return (
    <PageContainer>
      {/* ── Welcome Banner ── */}
      <div className="relative mb-8 bg-[#060d1f] border border-cyan-900/40 rounded-lg px-5 py-5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-20" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// COMMAND CENTER</div>
            <GlitchText
              text={`GOOD ${new Date().getHours() < 12 ? "MORNING" : new Date().getHours() < 17 ? "AFTERNOON" : "EVENING"}${profile?.display_name ? `, ${profile.display_name.toUpperCase()}` : ""}.`}
              className="text-2xl font-black uppercase text-white block"
              tag="h1"
            />
            <p className="text-xs font-mono text-slate-500 mt-1">{todayName} — Week {getISOWeek(new Date())} — {TODAY_STR}</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <AppBadge label="Beta" accent="cyan" dot />
            {profile?.primary_game && <span className="text-xs font-mono text-slate-600">{profile.primary_game}</span>}
          </div>
        </div>
      </div>

      {/* ── Today's Stream ── */}
      <div className="mb-4">
        <DashboardTodayStream
          stream={todayStream}
          onGeneratePromo={() => setDrawer("promo")}
          onLogSession={() => setDrawer("session")}
        />
      </div>

      {/* ── Coach + Weekly grid ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <DashboardCoachCard rec={todayRec} profile={profile} />

        {/* Weekly calendar mini */}
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">// THIS WEEK</div>
            <div className="text-xs font-mono text-slate-600">{weekCompleted} / {weekTarget} streams</div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map((day, i) => {
              const isToday = day.dateStr === TODAY_STR;
              const hasStream = !!day.stream;
              const done = day.stream?.status === "completed";
              return (
                <div key={i} className={`aspect-square rounded flex flex-col items-center justify-center gap-0.5 border transition-all ${
                  isToday ? "border-cyan-500/60 bg-cyan-500/10" :
                  done ? "border-cyan-900/40 bg-cyan-500/5" :
                  hasStream ? "border-cyan-900/40 bg-[#02040f]" :
                  "border-cyan-900/20 bg-[#02040f]"
                }`}>
                  <span className={`text-[9px] font-mono uppercase ${isToday ? "text-cyan-400" : "text-slate-600"}`}>{day.label}</span>
                  {done ? <span className="text-[8px] text-cyan-400">✓</span> :
                   hasStream ? <span className="w-1 h-1 rounded-full bg-cyan-400" style={{ boxShadow: "0 0 4px #00f5ff" }} /> :
                   <span className="w-1 h-1 rounded-full bg-slate-800" />}
                </div>
              );
            })}
          </div>
          <ProgressBar value={weekCompleted} max={weekTarget} label="Weekly target" accent="cyan" />
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total Sessions" value={recentSessions.length || "0"} sub="all time" accent="cyan" icon={Zap} />
        <StatCard label="Avg Viewers" value={avgViewers || "—"} sub="last 10 sessions" accent="pink" icon={TrendingUp} />
        <StatCard label="This Week" value={`${weekCompleted}/${weekTarget}`} sub="streams" accent="cyan" icon={Calendar} />
        <StatCard label="Streak" value={recentSessions.length > 0 ? `${recentSessions.length}` : "0"} sub="sessions logged" accent="yellow" icon={Flame} />
      </div>

      {/* ── Goals + Alerts ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <DashboardGoalsSnapshot goals={goals} onAddGoal={() => setDrawer("goal")} />
        <DashboardAlertsPreview alerts={alerts} onDismiss={dismissAlert} />
      </div>

      {/* ── Recent Activity ── */}
      {recentSessions.length > 0 && (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">// RECENT SESSIONS</div>
          </div>
          <div className="divide-y divide-white/5">
            {recentSessions.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-black uppercase text-white truncate block">{s.game}</span>
                  <span className="text-xs font-mono text-slate-600">{s.stream_date} · {s.stream_type}</span>
                </div>
                <div className="flex gap-4 text-right shrink-0">
                  {s.avg_viewers != null && (
                    <div>
                      <div className="text-sm font-black text-white">{s.avg_viewers}</div>
                      <div className="text-[10px] font-mono text-slate-600 uppercase">avg</div>
                    </div>
                  )}
                  {s.peak_viewers != null && (
                    <div>
                      <div className="text-sm font-black text-cyan-400">{s.peak_viewers}</div>
                      <div className="text-[10px] font-mono text-slate-600 uppercase">peak</div>
                    </div>
                  )}
                  <AppBadge label={s.promo_posted ? "promo" : "no promo"} accent={s.promo_posted ? "cyan" : "slate"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
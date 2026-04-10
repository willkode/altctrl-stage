import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import DailyCoachingCard from "../../components/app/coach/DailyCoachingCard";
import WeeklyGamePlan from "../../components/app/coach/WeeklyGamePlan";
import GoalsTracker from "../../components/app/coach/GoalsTracker";
import WeeklyRecapPreview from "../../components/app/coach/WeeklyRecapPreview";
import AlertsFeed from "../../components/app/coach/AlertsFeed";
import LiveCoachPanel from "../../components/app/coach/LiveCoachPanel";
import DataProgressBanner from "../../components/app/DataProgressBanner";
import { Brain, Sparkles, Loader2 } from "lucide-react";
import { getISOWeek } from "../../utils/dateHelpers";

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
  const [context, setContext] = useState(null);
  const [loadingContext, setLoadingContext] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const weekNumber = getISOWeek(now);
    const year = now.getFullYear();

    const [sessionList, profiles, goalList, todayRecs, allPlans, recapList, alertList, streamList] = await Promise.all([
      base44.entities.LiveSession.filter({ owner_email: user.email }, "-stream_date", 100),
      base44.entities.CreatorProfile.filter({ created_by: user.email }),
      base44.entities.GrowthGoal.filter({ created_by: user.email, status: "active" }, "-created_date", 20),
      base44.entities.DailyRecommendation.filter({ created_by: user.email, date: today, dismissed: false }, "-created_date", 1),
      base44.entities.WeeklyPlan.filter({ created_by: user.email, week_number: weekNumber, year }, "-created_date", 1),
      base44.entities.WeeklyRecap.filter({ created_by: user.email }, "-week_number", 2),
      base44.entities.PerformanceAlert.filter({ created_by: user.email, dismissed: false }, "-created_date", 20),
      base44.entities.ScheduledStream.filter({ created_by: user.email }, "-scheduled_date", 100),
    ]);

    setSessions(sessionList);
    setProfile(profiles[0] || null);
    setGoals(goalList.slice(0, 5));
    setRecommendation(todayRecs[0] || null);
    setWeeklyPlan(allPlans[0] || null);
    setWeeklyRecap(recapList[0] || null);
    setAlerts(alertList);
    setStreams(streamList);
    setLoading(false);
  }

  async function loadAIContext() {
    setLoadingContext(true);
    const res = await base44.functions.invoke("buildCreatorContext", { scope: "coach" });
    setContext(res.data);
    setLoadingContext(false);
  }

  const hasEnoughData = sessions.length >= 3;

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-yellow-400/60 mb-1">Coaching</p>
          <h1 className="text-2xl font-black uppercase text-white">Coach</h1>
          <p className="text-xs font-mono text-slate-600 mt-1">AI-powered daily focus and weekly guidance.</p>
        </div>
        {hasEnoughData && (
          <button onClick={loadAIContext} disabled={loadingContext}
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 hover:bg-yellow-400/15 transition-all shrink-0 disabled:opacity-50">
            {loadingContext ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {loadingContext ? "Loading..." : "AI Analysis"}
          </button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Loading coaching insights..." />
      ) : (
        <div className="space-y-6">
          {/* Data progress */}
          {!hasEnoughData && (
            <DataProgressBanner
              current={sessions.length}
              required={3}
              featureName="AI Coaching"
              hint={sessions.length === 0
                ? "Log your first stream session. The coach needs real data — not generic advice."
                : `${sessions.length} session${sessions.length > 1 ? "s" : ""} logged. ${3 - sessions.length} more unlocks personalized coaching.`}
              actionLabel="Log a session"
              actionLink="/app/analytics"
            />
          )}

          {/* AI Context summary */}
          {context && (
            <div className="bg-gradient-to-r from-yellow-950/20 to-[#060d1f] border border-yellow-900/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-yellow-400/60" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-yellow-400/60">AI Context Loaded</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[9px] font-mono uppercase text-slate-700 mb-1">Confidence</p>
                  <p className={`text-sm font-black uppercase ${
                    context.confidence?.overall === "high" ? "text-green-400" :
                    context.confidence?.overall === "medium" ? "text-yellow-400" : "text-slate-500"
                  }`}>{context.confidence?.overall || "—"}</p>
                  <p className="text-[10px] font-mono text-slate-600">{context.confidence?.sessions_available || 0} sessions analyzed</p>
                </div>
                {context.baselines && (
                  <div>
                    <p className="text-[9px] font-mono uppercase text-slate-700 mb-1">Baselines (median)</p>
                    <p className="text-[11px] font-mono text-slate-400">
                      Avg: <span className="text-cyan-400">{context.baselines.avg_viewers_median ?? "—"}</span> · 
                      Peak: <span className="text-pink-400">{context.baselines.peak_viewers_median ?? "—"}</span>
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[9px] font-mono uppercase text-slate-700 mb-1">Platforms</p>
                  <p className="text-[11px] font-mono text-slate-400">
                    {context.connection_health?.tiktok_connected ? "Connected" : "Check Settings"}
                    {context.connection_health?.stale && " (stale)"}
                  </p>
                </div>
              </div>

              {/* Top patterns */}
              {context.patterns?.by_game && Object.keys(context.patterns.by_game).length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.03]">
                  <p className="text-[9px] font-mono uppercase text-slate-700 mb-2">Top Games by Score</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(context.patterns.by_game)
                      .filter(([, v]) => v.median_session_score != null)
                      .sort(([, a], [, b]) => (b.median_session_score || 0) - (a.median_session_score || 0))
                      .slice(0, 5)
                      .map(([game, data]) => (
                        <div key={game} className="bg-[#02040f] border border-cyan-900/15 rounded-lg px-3 py-2">
                          <p className="text-[11px] font-bold text-white">{game || "Unknown"}</p>
                          <p className="text-[9px] font-mono text-slate-600">
                            Score: <span className="text-cyan-400">{data.median_session_score?.toFixed(2)}</span> · 
                            {data.sample_size}× · 
                            <span className={data.confidence === "high" ? "text-green-400" : data.confidence === "medium" ? "text-yellow-400" : "text-slate-500"}>{data.confidence}</span>
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Daily coaching card */}
          <DailyCoachingCard recommendation={recommendation} sessions={sessions} profile={profile} onRefresh={loadData} />

          {/* Two-column: Game plan + Goals */}
          <div className="grid md:grid-cols-2 gap-5">
            <WeeklyGamePlan plan={weeklyPlan} streams={streams.filter(s => {
              const d = new Date(s.scheduled_date);
              const start = new Date();
              start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
              start.setHours(0, 0, 0, 0);
              return d >= start;
            })} sessions={sessions} profile={profile} onRefresh={loadData} />
            <GoalsTracker goals={goals} sessions={sessions} onRefresh={loadData} />
          </div>

          {/* Weekly recap */}
          <WeeklyRecapPreview recap={weeklyRecap} previousRecap={null} onRefresh={loadData} />

          {/* Live Coach Feed */}
          <LiveCoachPanel />

          {/* Alerts feed */}
          <AlertsFeed alerts={alerts} onRefresh={loadData} />
        </div>
      )}
    </PageContainer>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import StreamSlotCard from "../../components/app/schedule/StreamSlotCard";
import WeeklyConsistency from "../../components/app/schedule/WeeklyConsistency";
import StreamDrawer from "../../components/app/drawers/StreamDrawer";
import { ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";
import { getISOWeek, getWeekDates as getWeekDatesUtil, getTodayStr } from "../../utils/dateHelpers";

const getWeekDates = getWeekDatesUtil;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY_STR = getTodayStr();

export default function Schedule() {
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [streams, setStreams] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [streak, setStreak] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editStream, setEditStream] = useState(null);
  const [strategyInsight, setStrategyInsight] = useState(null);

  const weekDates = getWeekDates(weekOffset);
  const currentWeek = weekOffset === 0;

  useEffect(() => { loadData(); }, [weekOffset]);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const [allStreams, allSessions, profiles, plans] = await Promise.all([
      base44.entities.ScheduledStream.filter({ created_by: user.email }),
      base44.entities.LiveSession.filter({ owner_email: user.email }),
      base44.entities.CreatorProfile.filter({ created_by: user.email }),
      base44.entities.WeeklyPlan.filter({ created_by: user.email, week_number: getISOWeek(new Date()), year: new Date().getFullYear() }),
    ]);

    const startStr = weekDates[0].toISOString().split("T")[0];
    const endStr = weekDates[6].toISOString().split("T")[0];
    const weekStreams = allStreams.filter(s => s.scheduled_date >= startStr && s.scheduled_date <= endStr);

    // Streak calculation
    const sessionWeeks = new Set(allSessions.map(s => {
      const d = new Date(s.stream_date);
      return `${d.getFullYear()}-${getISOWeek(d)}`;
    }));
    let streakCount = 0;
    const now = new Date();
    for (let i = 0; i <= 52; i++) {
      const check = new Date(now);
      check.setDate(now.getDate() - i * 7);
      const key = `${check.getFullYear()}-${getISOWeek(check)}`;
      if (sessionWeeks.has(key)) streakCount++;
      else if (i > 0) break;
    }

    setStreams(weekStreams);
    setSessions(allSessions);
    setProfile(profiles[0] || null);
    setStreak(streakCount);
    setStrategyInsight(plans[0]?.ai_brief || null);
    setLoading(false);
  }

  async function handleDelete(stream) {
    if (!confirm("Delete this stream?")) return;
    await base44.entities.ScheduledStream.delete(stream.id);
    loadData();
  }

  const openAdd = () => { setEditStream(null); setDrawerOpen(true); };
  const openEdit = (s) => { setEditStream(s); setDrawerOpen(true); };
  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekTarget = profile?.weekly_stream_target || 3;
  const prefDays = profile?.preferred_stream_days || [];

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/60 mb-1">Schedule</p>
          <h1 className="text-2xl font-black uppercase text-white">Weekly Calendar</h1>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15 transition-all shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add Stream
        </button>
      </div>

      {/* AI Strategy Insight */}
      {strategyInsight && (
        <div className="mb-5 bg-gradient-to-r from-yellow-950/20 to-[#060d1f] border border-yellow-900/20 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-yellow-400/60 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-yellow-400/60 mb-1">AI Strategist Brief</p>
            <p className="text-xs text-slate-400 leading-relaxed">{strategyInsight}</p>
          </div>
        </div>
      )}

      {/* Week nav */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setWeekOffset(o => o - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-cyan-900/30 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <span className="text-sm font-black uppercase text-white">{fmt(weekDates[0])} — {fmt(weekDates[6])}</span>
          {currentWeek && <span className="ml-2 text-[9px] font-mono uppercase text-cyan-400/60 bg-cyan-400/10 px-2 py-0.5 rounded-full">This Week</span>}
        </div>
        <button onClick={() => setWeekOffset(o => o + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-cyan-900/30 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
        {weekOffset !== 0 && (
          <button onClick={() => setWeekOffset(0)} className="text-[10px] font-mono uppercase text-slate-600 hover:text-cyan-400 transition-colors">Today</button>
        )}
      </div>

      {loading ? <LoadingState message="Loading schedule..." /> : (
        <>
          {/* Calendar grid */}
          <div className="overflow-x-auto -mx-2 px-2">
            {/* Day header labels */}
            <div className="grid grid-cols-7 gap-1 mb-1.5 min-w-[640px]">
              {DAY_LABELS.map((d, i) => {
                const date = weekDates[i];
                const dateStr = date.toISOString().split("T")[0];
                const isToday = dateStr === TODAY_STR;
                const isPref = prefDays.includes(d.toLowerCase().slice(0, 3));
                return (
                  <div key={i} className="text-center pb-1">
                    <div className={`text-[9px] font-mono uppercase mb-0.5 ${isToday ? "text-cyan-400" : isPref ? "text-pink-400/50" : "text-slate-700"}`}>{d}</div>
                    <div className={`text-xs font-black ${isToday ? "text-cyan-400" : "text-slate-500"}`}>{date.getDate()}</div>
                  </div>
                );
              })}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1 mb-6 min-w-[640px]">
              {weekDates.map((date, i) => {
                const dateStr = date.toISOString().split("T")[0];
                const isToday = dateStr === TODAY_STR;
                const dayStreams = streams.filter(s => s.scheduled_date === dateStr)
                  .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
                return (
                  <div key={i} className={`min-h-[120px] bg-[#060d1f]/80 rounded-lg border transition-all ${
                    isToday ? "border-cyan-500/30 bg-cyan-950/10" : "border-cyan-900/15"
                  }`}>
                    <div className="p-1.5 space-y-1.5">
                      {dayStreams.map(s => (
                        <StreamSlotCard key={s.id} stream={s} onEdit={openEdit} onDelete={handleDelete} />
                      ))}
                      <button onClick={() => { setEditStream({ scheduled_date: dateStr }); setDrawerOpen(true); }}
                        className="w-full py-2 flex items-center justify-center text-slate-800 hover:text-slate-600 hover:bg-cyan-500/5 rounded border border-dashed border-cyan-900/15 hover:border-cyan-900/30 transition-all">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div> {/* end overflow-x-auto wrapper */}

          {/* Empty state */}
          {streams.length === 0 && currentWeek && (
            <div className="mb-6 bg-gradient-to-br from-cyan-950/20 to-[#060d1f] border border-cyan-900/20 rounded-xl p-6 text-center">
              <p className="text-base font-black uppercase text-white mb-1">Week is empty</p>
              <p className="text-xs font-mono text-slate-600 mb-4 max-w-sm mx-auto">Consistency starts with a plan. Pick your days, choose your games, and commit.</p>
              <button onClick={openAdd}
                className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-5 py-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15 transition-all">
                <Plus className="w-3.5 h-3.5" /> Schedule Your First Stream
              </button>
            </div>
          )}

          {/* Bottom panels */}
          <div className="grid md:grid-cols-2 gap-4">
            <WeeklyConsistency streams={streams} target={weekTarget} sessions={sessions} streak={streak} />

            {/* Preferred days */}
            <div className="bg-[#060d1f]/80 border border-cyan-900/30 rounded-xl p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-4">Preferred Days</p>
              <div className="grid grid-cols-7 gap-1 mb-3">
                {["mon","tue","wed","thu","fri","sat","sun"].map((d, i) => (
                  <div key={d} className={`aspect-square rounded-lg flex items-center justify-center text-[9px] font-mono uppercase transition-all ${
                    prefDays.includes(d)
                      ? "bg-cyan-400/10 ring-1 ring-cyan-400/20 text-cyan-400"
                      : "bg-[#02040f]/60 text-slate-700"
                  }`}>
                    {DAY_LABELS[i][0]}
                  </div>
                ))}
              </div>
              {profile?.preferred_stream_time && (
                <p className="text-xs font-mono text-slate-600">Preferred: <span className="text-cyan-400">{profile.preferred_stream_time}</span></p>
              )}
            </div>
          </div>
        </>
      )}

      <StreamDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditStream(null); }}
        stream={editStream}
        onSaved={loadData}
      />
    </PageContainer>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import AppBadge from "../../components/app/AppBadge";
import EmptyState from "../../components/app/EmptyState";
import LoadingState from "../../components/app/LoadingState";
import StreamSlotCard from "../../components/app/schedule/StreamSlotCard";
import WeeklyConsistency from "../../components/app/schedule/WeeklyConsistency";
import StreamDrawer from "../../components/app/drawers/StreamDrawer";
import { ChevronLeft, ChevronRight, Plus, Sparkles, Calendar } from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY_STR = new Date().toISOString().split("T")[0];

// ── component ─────────────────────────────────────────────────────────────────
export default function Schedule() {
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [streams, setStreams] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [streak, setStreak] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editStream, setEditStream] = useState(null);

  const weekDates = getWeekDates(weekOffset);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const currentWeek = weekOffset === 0;

  useEffect(() => { loadData(); }, [weekOffset]);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const [allStreams, allSessions, profiles] = await Promise.all([
      base44.entities.ScheduledStream.filter({ created_by: user.email }),
      base44.entities.LiveSession.filter({ owner_email: user.email }),
      base44.entities.CreatorProfile.filter({ created_by: user.email }),
    ]);

    const startStr = weekDates[0].toISOString().split("T")[0];
    const endStr = weekDates[6].toISOString().split("T")[0];
    const weekStreams = allStreams.filter(s => s.scheduled_date >= startStr && s.scheduled_date <= endStr);

    // Calculate streak: consecutive weeks (ending this week) with ≥1 session logged
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
      else if (i > 0) break; // allow current week to be 0 without breaking
    }

    setStreams(weekStreams);
    setSessions(allSessions);
    setProfile(profiles[0] || null);
    setStreak(streakCount);
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
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// PILLAR_01 — PROGRAMMING</div>
          <h1 className="text-2xl font-black uppercase text-white">Schedule</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-mono">Build your weekly stream calendar.</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-4 py-2.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add Stream
        </button>
      </div>

      {/* ── Week nav ── */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setWeekOffset(o => o - 1)}
          className="w-8 h-8 flex items-center justify-center rounded border border-cyan-900/40 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm font-black uppercase text-white">{fmt(weekStart)} — {fmt(weekEnd)}, {weekEnd.getFullYear()}</span>
          {currentWeek && <AppBadge label="This Week" accent="cyan" dot />}
        </div>
        <button onClick={() => setWeekOffset(o => o + 1)}
          className="w-8 h-8 flex items-center justify-center rounded border border-cyan-900/40 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
        {weekOffset !== 0 && (
          <button onClick={() => setWeekOffset(0)}
            className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors px-2">
            Today
          </button>
        )}
      </div>

      {loading ? <LoadingState message="Loading schedule..." /> : (
        <>
          {/* ── Calendar Grid ── */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map((d, i) => {
              const date = weekDates[i];
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === TODAY_STR;
              const isPref = prefDays.includes(d.toLowerCase().slice(0, 3));
              return (
                <div key={i} className={`rounded-t border-b-2 pb-1 text-center transition-all ${
                  isToday ? "border-cyan-400" : isPref ? "border-pink-500/40" : "border-transparent"
                }`}>
                  <div className={`text-[10px] font-mono uppercase mb-0.5 ${isToday ? "text-cyan-400" : isPref ? "text-pink-400/60" : "text-slate-600"}`}>
                    {d}
                  </div>
                  <div className={`text-xs font-black ${isToday ? "text-cyan-400" : "text-slate-500"}`}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Stream slots per day ── */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {weekDates.map((date, i) => {
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === TODAY_STR;
              const dayStreams = streams.filter(s => s.scheduled_date === dateStr)
                .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

              return (
                <div key={i} className={`min-h-[120px] bg-[#060d1f] rounded border transition-all ${
                  isToday ? "border-cyan-900/60" : "border-cyan-900/20"
                }`}>
                  <div className="p-1.5 space-y-1.5">
                    {dayStreams.map(s => (
                      <StreamSlotCard key={s.id} stream={s} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                    <button onClick={() => { setEditStream({ scheduled_date: dateStr }); setDrawerOpen(true); }}
                      className="w-full py-2 flex items-center justify-center text-slate-800 hover:text-slate-600 hover:bg-cyan-500/5 rounded border border-dashed border-cyan-900/20 hover:border-cyan-900/40 transition-all">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Empty state ── */}
          {streams.length === 0 && (
            <div className="mb-6 bg-gradient-to-br from-cyan-500/5 to-pink-500/5 border border-cyan-900/30 rounded-xl p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// WEEK IS EMPTY</div>
              <p className="text-base font-black uppercase text-white mb-1">
                {currentWeek ? "Nothing scheduled yet" : "No streams this week"}
              </p>
              <p className="text-xs font-mono text-slate-500 mb-5 leading-relaxed">
                {currentWeek
                  ? "Consistency starts with a plan. Pick your days, choose your games, and commit. The system tracks everything from here."
                  : "No streams were scheduled for this week. Use the current week to build your next plan."
                }
              </p>
              {currentWeek && (
                <div className="grid sm:grid-cols-3 gap-3 mb-5">
                  {[
                    { step: "01", label: "Pick a game", sub: "What are you streaming this week?" },
                    { step: "02", label: "Set a day + time", sub: "Consistent slots build audience habit." },
                    { step: "03", label: "Commit and show up", sub: "AltCtrl tracks your consistency score." },
                  ].map(s => (
                    <div key={s.step} className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-3">
                      <div className="text-[10px] font-mono text-cyan-400/50 mb-1">{s.step}</div>
                      <div className="text-sm font-bold text-white mb-0.5">{s.label}</div>
                      <div className="text-xs font-mono text-slate-600">{s.sub}</div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={openAdd}
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-5 py-3 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all">
                <Plus className="w-3.5 h-3.5" /> Schedule Your First Stream
              </button>
            </div>
          )}

          {/* ── Bottom panels ── */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Weekly consistency */}
            <WeeklyConsistency streams={streams} target={weekTarget} sessions={sessions} streak={streak} />

            {/* Preferred days */}
            <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// PREFERRED DAYS</div>
              <div className="grid grid-cols-7 gap-1 mb-3">
                {["mon","tue","wed","thu","fri","sat","sun"].map((d, i) => {
                  const active = prefDays.includes(d);
                  return (
                    <div key={d} className={`aspect-square rounded flex items-center justify-center text-[9px] font-mono uppercase transition-all ${
                      active ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400" : "bg-[#02040f] border border-cyan-900/20 text-slate-700"
                    }`}>
                      {DAY_LABELS[i][0]}
                    </div>
                  );
                })}
              </div>
              {prefDays.length === 0 ? (
                <p className="text-xs font-mono text-slate-700">Set preferred days in your profile settings.</p>
              ) : (
                <p className="text-xs font-mono text-slate-600 leading-relaxed">
                  You stream best on {prefDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}.
                </p>
              )}
              {profile?.preferred_stream_time && (
                <div className="mt-3 text-xs font-mono text-slate-500">Preferred time: <span className="text-cyan-400">{profile.preferred_stream_time}</span></div>
              )}
            </div>

            {/* AI Suggestions — reserved */}
            <div className="bg-[#060d1f] border border-pink-900/20 rounded-lg p-5 opacity-60">
              <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> // AI SLOT SUGGESTIONS
              </div>
              <div className="text-xs font-mono text-slate-700 mb-3">Coming soon</div>
              <p className="text-xs text-slate-700 leading-relaxed">
                AltCtrl will suggest optimal stream times based on your historical session performance and consistency patterns.
              </p>
              <div className="mt-4 space-y-2">
                {["Best slot: Fri 8PM", "2nd best: Wed 7PM", "Avoid: Mon mornings"].map((s, i) => (
                  <div key={i} className="text-[10px] font-mono text-slate-800 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-pink-900" /> {s}
                  </div>
                ))}
              </div>
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
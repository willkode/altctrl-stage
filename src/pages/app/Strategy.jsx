import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import StreamSelector from "../../components/app/strategy/StreamSelector";
import StrategyCard from "../../components/app/strategy/StrategyCard";
import ChallengeGenerator from "../../components/app/strategy/ChallengeGenerator";
import WeeklyPlanView from "../../components/app/strategy/WeeklyPlanView";
import { Brain, Loader2, RefreshCw, Calendar, Sparkles, AlertCircle, Play, BarChart2, Crosshair } from "lucide-react";
import { getISOWeek } from "../../utils/dateHelpers";

export default function Strategy() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("weekly");
  const [streams, setStreams] = useState([]);
  const [strategies, setStrategies] = useState({});
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [selected, setSelected] = useState(null);
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const weekNumber = getISOWeek(now);
    const year = now.getFullYear();
    const [allStreams, allStrategies, plans] = await Promise.all([
      base44.entities.ScheduledStream.filter({ created_by: user.email }),
      base44.entities.StreamStrategy.filter({ created_by: user.email }, "-generated_at", 50),
      base44.entities.WeeklyPlan.filter({ owner_email: user.email, week_number: weekNumber, year }, "-created_date", 1),
    ]);

    const upcoming = allStreams
      .filter(s => s.scheduled_date >= today && s.status !== "cancelled" && s.status !== "skipped")
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));

    const stratMap = {};
    allStrategies.forEach(s => { stratMap[s.scheduled_stream_id] = s; });

    setStreams(upcoming);
    setStrategies(stratMap);
    setWeeklyPlan(plans[0] || null);

    if (upcoming.length > 0) {
      const first = upcoming[0];
      setSelected(first);
      if (stratMap[first.id]) setActiveStrategy(stratMap[first.id]);
    }
    setLoading(false);
  }

  function selectStream(stream) {
    setSelected(stream);
    setActiveStrategy(strategies[stream.id] || null);
    setError(null);
  }

  async function generateStrategy(forceNew = false) {
    if (!selected) return;
    setGenerating(true);
    setError(null);

    const res = await base44.functions.invoke("generateStreamStrategy", {
      scheduled_stream_id: selected.id,
      force_regenerate: forceNew,
    });

    if (res.data?.error) {
      setError(res.data.error);
    } else if (res.data?.strategy) {
      setActiveStrategy(res.data.strategy);
      setStrategies(prev => ({ ...prev, [selected.id]: res.data.strategy }));
    }
    setGenerating(false);
  }

  async function activateStrategy() {
    if (!selected || !activeStrategy) return;
    await base44.functions.invoke("getStreamStrategy", {
      scheduled_stream_id: selected.id,
      action: "activate",
    });
    setActiveStrategy(prev => ({ ...prev, status: "active" }));
    setStrategies(prev => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], status: "active" },
    }));
  }

  if (loading) return <PageContainer><LoadingState message="Loading strategies..." /></PageContainer>;

  const hasStrategy = !!activeStrategy;
  const isActive = activeStrategy?.status === "active";

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/60 mb-1">AI-Powered</p>
          <h1 className="text-2xl font-black uppercase text-white">Strategy</h1>
          <p className="text-xs font-mono text-slate-600 mt-1">Weekly intelligence + per-stream playbooks.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#060d1f] border border-cyan-900/20 rounded-xl p-1">
        {[{id: "weekly", label: "Weekly Plan", icon: BarChart2}, {id: "stream", label: "Stream Strategy", icon: Crosshair}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
              tab === t.id ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-600 hover:text-slate-400"
            }`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {tab === "weekly" && (
        <WeeklyPlanView plan={weeklyPlan} onRefresh={loadData} />
      )}

      {tab === "stream" && (
        streams.length === 0 ? (
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-8 text-center">
            <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400 mb-1">No upcoming streams</p>
            <p className="text-xs font-mono text-slate-600 mb-4">Schedule a stream first, then come back to generate a strategy.</p>
            <Link to="/app/schedule"
              className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15 transition-all">
              Schedule Stream →
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <StreamSelector streams={streams} strategies={strategies} selected={selected} onSelect={selectStream} />

            {selected && (
              <>
                {!hasStrategy ? (
                  <div className="bg-gradient-to-r from-cyan-950/20 to-[#060d1f] border border-cyan-500/15 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400/60 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white mb-1">Generate AI Strategy</p>
                        <p className="text-xs font-mono text-slate-500 leading-relaxed mb-4">
                          The AI will analyze your session history, game patterns, day/time performance, promo impact, energy data, and active goals to create a tactical playbook for this stream.
                        </p>
                        <button onClick={() => generateStrategy(false)} disabled={generating}
                          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-5 py-3 rounded-lg bg-cyan-400 text-[#02040f] font-black hover:bg-cyan-300 transition-all disabled:opacity-50">
                          {generating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…</> : <><Brain className="w-3.5 h-3.5" /> Generate Strategy</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-mono uppercase px-2.5 py-1 rounded-full border ${
                        isActive ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                      }`}>
                        {isActive ? "● Active" : activeStrategy?.status || "Ready"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600">
                        Generated {activeStrategy?.generated_at ? new Date(activeStrategy.generated_at).toLocaleString() : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <button onClick={activateStrategy}
                          className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/15 transition-all">
                          <Play className="w-3 h-3" /> Go Live with Strategy
                        </button>
                      )}
                      <button onClick={() => generateStrategy(true)} disabled={generating}
                        className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-lg border border-cyan-900/20 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/20 transition-all disabled:opacity-50">
                        {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Regenerate
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-mono text-red-400">{error}</p>
                  </div>
                )}

                {generating && (
                  <div className="bg-[#060d1f]/80 border border-cyan-500/10 rounded-xl p-12 text-center">
                    <div className="w-10 h-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-bold text-white mb-1">Building Strategy</p>
                    <p className="text-[10px] font-mono text-slate-600">Analyzing baselines, game patterns, day performance, promo impact, experiments…</p>
                  </div>
                )}

                {hasStrategy && !generating && <StrategyCard strategy={activeStrategy} />}
                <ChallengeGenerator stream={selected} />
              </>
            )}

            {streams.length > 1 && (
              <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-3">All Upcoming Streams</p>
                <div className="space-y-2">
                  {streams.map(s => {
                    const hasSt = !!strategies[s.id];
                    const isSelected = selected?.id === s.id;
                    const dateLabel = s.scheduled_date === new Date().toISOString().split("T")[0]
                      ? "Today"
                      : new Date(s.scheduled_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                    return (
                      <button key={s.id} onClick={() => selectStream(s)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all ${
                          isSelected ? "border-cyan-500/20 bg-cyan-500/5" : "border-white/[0.02] hover:bg-white/[0.02]"
                        }`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{s.game}</span>
                            {hasSt && <span className="text-[8px] font-mono uppercase text-green-400">✓</span>}
                          </div>
                          <span className="text-[10px] font-mono text-slate-600">{dateLabel}{s.start_time ? ` · ${s.start_time}` : ""}</span>
                        </div>
                        {!hasSt && <span className="text-[9px] font-mono text-slate-700">No strategy</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </PageContainer>
  );
}
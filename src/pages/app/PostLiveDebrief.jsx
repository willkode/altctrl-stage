import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import AutoDebriefCard from "../../components/app/debrief/AutoDebriefCard";
import SessionMetricsSummary from "../../components/app/debrief/SessionMetricsSummary";
import SourceBadge from "../../components/app/SourceBadge";
import { Brain, ChevronDown, Loader2, Sparkles, RefreshCw, ExternalLink, Check, AlertCircle } from "lucide-react";

export default function PostLiveDebrief() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [review, setReview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState({});
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => { loadSessions(); }, []);

  async function loadSessions() {
    setLoading(true);
    const user = await base44.auth.me();
    const [allSessions, allReviews] = await Promise.all([
      base44.entities.LiveSession.filter({ owner_email: user.email }, "-stream_date", 50),
      base44.entities.ReplayReview.filter({ created_by: user.email }, "-reviewed_at", 100),
    ]);
    setSessions(allSessions);
    const reviewMap = {};
    allReviews.forEach(r => { reviewMap[r.live_session_id] = r; });
    setReviews(reviewMap);
    if (allSessions.length > 0) {
      const latest = allSessions[0];
      setSelectedSession(latest);
      if (reviewMap[latest.id]) setReview(reviewMap[latest.id]);
    }
    setLoading(false);
  }

  function selectSession(session) {
    setSelectedSession(session);
    setReview(reviews[session.id] || null);
    setError(null);
    setSelectorOpen(false);
  }

  async function generateDebrief(forceNew = false) {
    if (!selectedSession) return;
    setGenerating(true);
    setError(null);
    if (forceNew && reviews[selectedSession.id]) {
      await base44.entities.ReplayReview.delete(reviews[selectedSession.id].id);
      setReviews(prev => { const next = { ...prev }; delete next[selectedSession.id]; return next; });
    }
    const res = await base44.functions.invoke("generateAutoDebrief", { session_id: selectedSession.id });
    if (res.data?.error) {
      setError(res.data.error);
    } else if (res.data?.review) {
      setReview(res.data.review);
      setReviews(prev => ({ ...prev, [selectedSession.id]: res.data.review }));
    }
    setGenerating(false);
  }

  if (loading) return <PageContainer><LoadingState message="Loading sessions..." /></PageContainer>;

  const hasReview = !!review;
  const sessionDate = selectedSession?.stream_date
    ? new Date(selectedSession.stream_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <PageContainer>
      <div className="mb-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-yellow-400/60 mb-1">Post-Stream</p>
        <h1 className="text-2xl font-black uppercase text-white">Debrief</h1>
        <p className="text-xs font-mono text-slate-600 mt-1">AI analyzes your session — what happened, what went right, what went wrong, and what to improve.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-8 text-center">
          <Brain className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400 mb-1">No sessions to debrief</p>
          <p className="text-xs font-mono text-slate-600 mb-4">Log or sync a session first, then come back for an AI review.</p>
          <Link to="/app/analytics" className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15 transition-all">
            Log Session →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Session selector */}
          <div className="relative">
            <button onClick={() => setSelectorOpen(!selectorOpen)}
              className="w-full bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-cyan-500/20 transition-all text-left">
              <div className="flex-1 min-w-0">
                {selectedSession ? (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-black text-white">{selectedSession.game}</span>
                      <SourceBadge source={selectedSession.source} size="sm" />
                      {reviews[selectedSession.id] && (
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Debriefed ✓</span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">{sessionDate} · {selectedSession.stream_type?.replace("_", " ")}</span>
                  </>
                ) : (
                  <span className="text-sm text-slate-500">Select a session…</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${selectorOpen ? "rotate-180" : ""}`} />
            </button>

            {selectorOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSelectorOpen(false)} />
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#060d1f] border border-cyan-900/30 rounded-xl overflow-hidden shadow-2xl max-h-[320px] overflow-y-auto">
                  {sessions.map(s => (
                    <button key={s.id} onClick={() => selectSession(s)}
                      className={`w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-cyan-500/5 transition-all border-b border-white/[0.02] ${
                        selectedSession?.id === s.id ? "bg-cyan-500/5" : ""
                      }`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{s.game}</span>
                          {reviews[s.id] && <Check className="w-3 h-3 text-green-400" />}
                        </div>
                        <span className="text-[10px] font-mono text-slate-600">{s.stream_date} · {s.stream_type?.replace("_", " ")}</span>
                      </div>
                      <div className="text-right shrink-0">
                        {s.avg_viewers != null && <p className="text-xs font-black text-cyan-400">{s.avg_viewers} avg</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {selectedSession && (
            <div className="grid md:grid-cols-[1fr_300px] gap-5">
              {/* Main content */}
              <div className="space-y-5">
                {/* Generate / status bar */}
                {!hasReview && !generating ? (
                  <div className="bg-gradient-to-r from-yellow-950/20 to-[#060d1f] border border-yellow-900/20 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-yellow-400/60 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white mb-1">Generate AI Debrief</p>
                        <p className="text-xs font-mono text-slate-500 leading-relaxed mb-4">
                          The AI will analyze this session against your baselines and timeline data to tell you exactly what happened, what worked, what didn't, and what to do differently next time.
                        </p>
                        <button onClick={() => generateDebrief(false)} disabled={generating}
                          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-5 py-3 rounded-lg bg-yellow-400 text-[#02040f] font-black hover:bg-yellow-300 transition-all disabled:opacity-50">
                          <Brain className="w-3.5 h-3.5" /> Generate Debrief
                        </button>
                      </div>
                    </div>
                  </div>
                ) : hasReview && !generating ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-green-400/60">
                        Debriefed {review.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <button onClick={() => generateDebrief(true)} disabled={generating}
                      className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-lg border border-yellow-900/20 text-yellow-400/60 hover:text-yellow-400 hover:border-yellow-400/30 transition-all disabled:opacity-50">
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                  </div>
                ) : null}

                {/* Error */}
                {error && (
                  <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-mono text-red-400">{error}</p>
                      <button onClick={() => setError(null)} className="text-[10px] font-mono text-red-400/50 hover:text-red-400 mt-1 transition-colors">Dismiss</button>
                    </div>
                  </div>
                )}

                {/* Generating state */}
                {generating && (
                  <div className="bg-[#060d1f]/80 border border-yellow-900/15 rounded-xl p-12 text-center">
                    <div className="w-10 h-10 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-bold text-white mb-1">Analyzing Session</p>
                    <p className="text-[10px] font-mono text-slate-600">Comparing metrics vs baselines, scanning timeline, identifying patterns…</p>
                  </div>
                )}

                {/* The debrief content */}
                {hasReview && !generating && <AutoDebriefCard review={review} />}

                {/* Link to TikTok Live Center */}
                {hasReview && !generating && (
                  <a href="https://livecenter.tiktok.com/analytics/live_video" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-lg border border-pink-900/20 text-pink-400/60 hover:text-pink-400 hover:border-pink-500/20 transition-all">
                    <ExternalLink className="w-3 h-3" /> Review on TikTok Live Center
                  </a>
                )}
              </div>

              {/* Sidebar — session metrics + creator notes */}
              <div className="space-y-4">
                <SessionMetricsSummary session={selectedSession} />

                {(selectedSession.best_moment || selectedSession.weakest_moment || selectedSession.notes) && (
                  <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-4 space-y-3">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60">Creator Notes</p>
                    {selectedSession.best_moment && (
                      <div>
                        <p className="text-[9px] font-mono uppercase text-slate-700 mb-0.5">Best Moment</p>
                        <p className="text-xs text-slate-400">{selectedSession.best_moment}</p>
                      </div>
                    )}
                    {selectedSession.weakest_moment && (
                      <div>
                        <p className="text-[9px] font-mono uppercase text-slate-700 mb-0.5">Weakest Moment</p>
                        <p className="text-xs text-slate-400">{selectedSession.weakest_moment}</p>
                      </div>
                    )}
                    {selectedSession.notes && (
                      <div>
                        <p className="text-[9px] font-mono uppercase text-slate-700 mb-0.5">Notes</p>
                        <p className="text-xs text-slate-400">{selectedSession.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
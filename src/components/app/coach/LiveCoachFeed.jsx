import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, ThumbsUp, X, Clock, Zap, AlertTriangle, TrendingDown, DollarSign, Users, MessageCircle } from "lucide-react";

const STATE_CONFIG = {
  dead_zone:           { label: "DEAD ZONE",    color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",    icon: AlertTriangle },
  drop_risk:           { label: "DROP RISK",    color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",    icon: TrendingDown },
  monetization_window: { label: "GIFT WINDOW",  color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: DollarSign },
  viewer_spike:        { label: "SPIKE",        color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/30",  icon: Users },
  retention_dip:       { label: "RETENTION",   color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", icon: TrendingDown },
  chat_cooling:        { label: "CHAT COLD",   color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/30",  icon: MessageCircle },
  closing_window:      { label: "CLOSING",     color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", icon: Clock },
  high_momentum:       { label: "ON FIRE",     color: "text-pink-400",   bg: "bg-pink-500/10 border-pink-500/30",  icon: Zap },
  rising:              { label: "RISING",      color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30", icon: Zap },
  warming_up:          { label: "WARMING UP",  color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/30", icon: Brain },
  stable:              { label: "STABLE",      color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/30", icon: Brain },
};

const PRIORITY_GLOW = {
  1: "shadow-[0_0_20px_rgba(239,68,68,0.2)] border-red-500/40",
  2: "shadow-[0_0_16px_rgba(251,191,36,0.15)] border-yellow-500/30",
  3: "shadow-[0_0_10px_rgba(0,245,255,0.08)] border-cyan-500/20",
  4: "border-cyan-900/30",
  5: "border-cyan-900/20",
};

function useCountdown(expiresAt) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.round((new Date(expiresAt) - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return secondsLeft;
}

function PromptCard({ log, onFeedback }) {
  const cfg = STATE_CONFIG[log.stream_state_at_fire] || STATE_CONFIG.stable;
  const Icon = cfg.icon;
  const glow = PRIORITY_GLOW[log.priority] || PRIORITY_GLOW[5];
  const countdown = useCountdown(log.expires_at);
  const isDismissed = log.dismissed;
  const isHelpful = log.helpful;

  if (isDismissed) return null;

  return (
    <div className={`relative bg-[#060d1f] border rounded-xl p-4 transition-all ${glow}`}>
      {/* Priority indicator bar */}
      {log.priority <= 2 && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </div>
          {log.minute_live_at_fire > 0 && (
            <span className="text-[10px] font-mono text-slate-600">min {log.minute_live_at_fire}</span>
          )}
        </div>
        {/* Expiry countdown */}
        {countdown > 0 && (
          <span className={`text-[10px] font-mono tabular-nums ${countdown <= 30 ? "text-red-400" : "text-slate-600"}`}>
            {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Message */}
      <p className="text-sm text-white font-medium leading-relaxed mb-2">{log.message}</p>

      {/* Fallback */}
      {log.fallback && (
        <p className="text-xs text-slate-500 font-mono italic mb-3">
          If no change in 2min: {log.fallback}
        </p>
      )}

      {/* Footer: feedback + dismiss */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <button
          onClick={() => onFeedback(log.id, "helpful")}
          disabled={isHelpful === true}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono uppercase tracking-widest transition-all ${
            isHelpful === true
              ? "bg-green-500/20 border-green-500/40 text-green-400"
              : "border-cyan-900/30 text-slate-600 hover:text-green-400 hover:border-green-500/30"
          }`}>
          <ThumbsUp className="w-3 h-3" />
          {isHelpful === true ? "Helpful!" : "Helpful"}
        </button>
        <button
          onClick={() => onFeedback(log.id, "dismiss")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyan-900/30 text-xs font-mono uppercase text-slate-600 hover:text-slate-300 hover:border-slate-500/30 transition-all">
          <X className="w-3 h-3" />
          Dismiss
        </button>
        {log.confidence > 0 && (
          <span className="ml-auto text-[10px] font-mono text-slate-700">
            {Math.round(log.confidence * 100)}% conf
          </span>
        )}
      </div>
    </div>
  );
}

export default function LiveCoachFeed({ sessionId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!sessionId) { setLogs([]); setLoading(false); return; }

    // Initial load
    base44.entities.CoachActionLog.filter(
      { session_id: sessionId },
      '-sent_at',
      20
    ).then(data => {
      setLogs(data.filter(l => !l.dismissed));
      setLoading(false);
    });

    // Real-time subscription
    unsubRef.current = base44.entities.CoachActionLog.subscribe((event) => {
      if (event.data?.session_id !== sessionId) return;
      if (event.type === 'create') {
        setLogs(prev => [event.data, ...prev].slice(0, 20));
      } else if (event.type === 'update') {
        setLogs(prev => prev
          .map(l => l.id === event.id ? event.data : l)
          .filter(l => !l.dismissed)
        );
      } else if (event.type === 'delete') {
        setLogs(prev => prev.filter(l => l.id !== event.id));
      }
    });

    return () => { unsubRef.current?.(); };
  }, [sessionId]);

  async function handleFeedback(logId, type) {
    if (type === 'helpful') {
      await base44.entities.CoachActionLog.update(logId, {
        helpful: true,
        creator_feedback: 'helpful',
        result: 'worked',
      });
    } else {
      await base44.entities.CoachActionLog.update(logId, {
        dismissed: true,
        creator_feedback: 'not_helpful',
        result: 'no_data',
      });
    }
  }

  const visibleLogs = logs.filter(l => !l.dismissed && !l.expires_at || new Date(l.expires_at) > new Date());

  if (!sessionId) {
    return (
      <div className="text-center py-10 text-slate-700 font-mono text-xs uppercase tracking-widest">
        No active session selected
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 gap-2">
        <div className="w-4 h-4 border-2 border-cyan-900 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-600 uppercase tracking-widest">Connecting...</span>
      </div>
    );
  }

  if (visibleLogs.length === 0) {
    return (
      <div className="text-center py-10">
        <Brain className="w-6 h-6 text-slate-700 mx-auto mb-3" />
        <p className="text-xs font-mono text-slate-700 uppercase tracking-widest">Coach is watching...</p>
        <p className="text-xs text-slate-800 mt-1 font-mono">Prompts appear here when action is needed</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleLogs.map(log => (
        <PromptCard key={log.id} log={log} onFeedback={handleFeedback} />
      ))}
    </div>
  );
}
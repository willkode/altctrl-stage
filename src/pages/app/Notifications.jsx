import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import {
  Bell, CheckCheck, Trash2, TrendingUp, TrendingDown, Flame,
  Trophy, Target, Calendar, Zap, AlertTriangle, Info, Star
} from "lucide-react";

const ALERT_CONFIG = {
  consistency_drop:   { icon: TrendingDown, accent: "warning", label: "Consistency Drop" },
  viewer_drop:        { icon: TrendingDown, accent: "warning", label: "Viewer Drop" },
  missed_streams:     { icon: Calendar,     accent: "warning", label: "Missed Streams" },
  goal_completed:     { icon: Trophy,       accent: "success", label: "Goal Completed" },
  streak_milestone:   { icon: Flame,        accent: "success", label: "Streak Milestone" },
  promo_missed:       { icon: Zap,          accent: "warning", label: "Promo Missed" },
  strong_week:        { icon: Star,         accent: "success", label: "Strong Week" },
  low_energy_pattern: { icon: AlertTriangle,accent: "warning", label: "Low Energy Pattern" },
  best_game_insight:  { icon: TrendingUp,   accent: "info",    label: "Best Game Insight" },
  best_time_insight:  { icon: Target,       accent: "info",    label: "Best Time Insight" },
};

const SEVERITY_STYLES = {
  info:    { border: "border-cyan-900/40",  bg: "bg-cyan-500/5",   icon: "text-cyan-400",   badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
  warning: { border: "border-yellow-900/40",bg: "bg-yellow-400/5", icon: "text-yellow-400", badge: "bg-yellow-400/10 text-yellow-400 border-yellow-900/30" },
  success: { border: "border-green-900/40", bg: "bg-green-500/5",  icon: "text-green-400",  badge: "bg-green-500/10 text-green-400 border-green-900/30" },
};

const ALERT_LINKS = {
  consistency_drop:   "/app/analytics",
  viewer_drop:        "/app/analytics",
  missed_streams:     "/app/schedule",
  goal_completed:     "/app/coach",
  streak_milestone:   "/app/coach",
  promo_missed:       "/app/promo",
  strong_week:        "/app/analytics",
  low_energy_pattern: "/app/analytics",
  best_game_insight:  "/app/analytics",
  best_time_insight:  "/app/analytics",
};

function AlertCard({ alert, onRead, onDismiss }) {
  const config = ALERT_CONFIG[alert.alert_type] || { icon: Info, accent: "info", label: alert.alert_type };
  const severity = alert.severity || "info";
  const style = SEVERITY_STYLES[config.accent] || SEVERITY_STYLES.info;
  const Icon = config.icon;
  const link = ALERT_LINKS[alert.alert_type];
  const navigate = useNavigate();

  const handleClick = () => {
    if (!alert.read) onRead(alert.id);
    if (link) navigate(link);
  };

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${style.border} ${style.bg} ${!alert.read ? "ring-1 ring-inset ring-white/5" : "opacity-70"} ${link ? "cursor-pointer hover:opacity-100 hover:ring-white/10" : ""}`}
      onClick={link ? handleClick : undefined}
    >
      {/* Unread dot */}
      {!alert.read && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-pink-500" style={{ boxShadow: "0 0 5px #ff0080" }} />
      )}

      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.bg} border ${style.border}`}>
          <Icon className={`w-4 h-4 ${style.icon}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${style.badge}`}>
              {config.label}
            </span>
            {alert.week_number && (
              <span className="text-[10px] font-mono text-slate-700">Wk {alert.week_number}</span>
            )}
          </div>
          <p className="text-sm font-bold text-white mb-0.5">{alert.title}</p>
          {alert.body && <p className="text-xs text-slate-400 leading-relaxed">{alert.body}</p>}
          {alert.metric_value != null && (
            <p className="text-xs font-mono text-slate-600 mt-1">
              Value: <span className={style.icon}>{alert.metric_value}</span>
            </p>
          )}
          {link && (
            <span className="text-[10px] font-mono text-slate-600 mt-2 block">Tap to view →</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
        {!alert.read && (
          <button
            onClick={e => { e.stopPropagation(); onRead(alert.id); }}
            className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-600 hover:text-cyan-400 transition-colors"
          >
            <CheckCheck className="w-3 h-3" /> Mark read
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); onDismiss(alert.id); }}
          className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-600 hover:text-red-400 transition-colors ml-auto"
        >
          <Trash2 className="w-3 h-3" /> Dismiss
        </button>
      </div>
    </div>
  );
}

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all"); // all | unread | success | warning | info

  useEffect(() => { loadAlerts(); }, []);

  async function loadAlerts() {
    setLoading(true);
    const user = await base44.auth.me();
    const all = await base44.entities.PerformanceAlert.filter(
      { created_by: user.email, dismissed: false },
      "-created_date",
      100
    );
    setAlerts(all);
    setLoading(false);
  }

  async function markRead(id) {
    await base44.entities.PerformanceAlert.update(id, { read: true });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }

  async function dismiss(id) {
    await base44.entities.PerformanceAlert.update(id, { dismissed: true });
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  async function markAllRead() {
    const unread = alerts.filter(a => !a.read);
    await Promise.all(unread.map(a => base44.entities.PerformanceAlert.update(a.id, { read: true })));
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }

  async function dismissAll() {
    await Promise.all(alerts.map(a => base44.entities.PerformanceAlert.update(a.id, { dismissed: true })));
    setAlerts([]);
  }

  const filtered = alerts.filter(a => {
    if (filter === "unread") return !a.read;
    const config = ALERT_CONFIG[a.alert_type];
    const accent = config?.accent || a.severity;
    if (filter === "success") return accent === "success";
    if (filter === "warning") return accent === "warning";
    if (filter === "info") return accent === "info";
    return true;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { key: "success", label: "Wins" },
    { key: "warning", label: "Warnings" },
    { key: "info", label: "Insights" },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-1">// SYSTEM_ALERTS</div>
          <h1 className="text-2xl font-black uppercase text-white flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm px-2 py-0.5 rounded bg-pink-500/20 border border-pink-500/40 text-pink-400 font-mono">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-mono">Performance insights and system alerts.</p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs font-mono uppercase px-3 py-2 rounded border border-cyan-900/40 text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button onClick={dismissAll}
              className="flex items-center gap-1.5 text-xs font-mono uppercase px-3 py-2 rounded border border-red-900/30 text-slate-700 hover:text-red-400 hover:border-red-500/30 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      {alerts.length > 0 && (
        <div className="flex gap-1.5 mb-5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded border transition-all ${
                filter === f.key
                  ? "bg-pink-500/10 border-pink-500/30 text-pink-400"
                  : "border-cyan-900/30 text-slate-600 hover:text-slate-400"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading alerts..." />
      ) : alerts.length === 0 ? (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-12 text-center">
          <Bell className="w-10 h-10 text-slate-800 mx-auto mb-4" />
          <p className="text-sm font-black uppercase text-slate-400 mb-1">All clear</p>
          <p className="text-xs font-mono text-slate-600">No active alerts. Keep streaming and we'll surface insights here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-8 text-center">
          <p className="text-xs font-mono text-slate-600">No alerts match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <AlertCard key={alert.id} alert={alert} onRead={markRead} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
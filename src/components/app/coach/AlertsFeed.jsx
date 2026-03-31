import { useState } from "react";
import { Bell, AlertTriangle, CheckCircle, Info, X, ChevronDown, ChevronUp } from "lucide-react";
import AppBadge from "../AppBadge";
import { base44 } from "@/api/base44Client";
import { useAppToast } from "../../../hooks/useAppToast";

const SEVERITY_CONFIG = {
  info: { icon: Info, color: "text-cyan-400", bg: "bg-cyan-500/5", border: "border-cyan-500/20" },
  warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/20" },
  success: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/5", border: "border-green-500/20" },
};

export default function AlertsFeed({ alerts, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const toast = useAppToast();

  const unread = alerts.filter(a => !a.read && !a.dismissed);
  const read = alerts.filter(a => a.read && !a.dismissed);
  const displayAlerts = expanded ? [...unread, ...read].slice(0, 10) : unread.slice(0, 3);

  async function markRead(alert) {
    if (alert.read) return;
    await base44.entities.PerformanceAlert.update(alert.id, { read: true });
    onRefresh?.();
  }

  async function dismiss(alert) {
    await base44.entities.PerformanceAlert.update(alert.id, { dismissed: true });
    toast.saved("Alert dismissed");
    onRefresh?.();
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// ALERTS & INSIGHTS</div>
        <div className="text-center py-6">
          <Bell className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-black uppercase text-slate-400 mb-1">No alerts yet</p>
          <p className="text-xs font-mono text-slate-600">Stream regularly to unlock performance insights and pattern alerts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">// ALERTS & INSIGHTS</div>
          {unread.length > 0 && <AppBadge label={`${unread.length} new`} accent="pink" dot />}
        </div>
        {alerts.length > 3 && (
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-600 hover:text-cyan-400 transition-colors">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Less" : "More"}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {displayAlerts.map(alert => {
          const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
          const Icon = cfg.icon;

          return (
            <div key={alert.id}
              onClick={() => markRead(alert)}
              className={`${cfg.bg} ${cfg.border} border rounded-lg p-3 cursor-pointer transition-all hover:bg-opacity-70 ${!alert.read ? "ring-1 ring-white/5" : "opacity-80"}`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 ${cfg.color} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-bold text-white">{alert.title}</span>
                    {!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />}
                  </div>
                  {alert.body && (
                    <p className="text-xs text-slate-400 leading-relaxed">{alert.body}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[9px] font-mono text-slate-600">
                    <span className="uppercase">{alert.alert_type.replace(/_/g, " ")}</span>
                    {alert.metric_value != null && (
                      <>
                        <span>·</span>
                        <span>{alert.metric_key}: {alert.metric_value}</span>
                      </>
                    )}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); dismiss(alert); }}
                  className="w-6 h-6 flex items-center justify-center rounded text-slate-700 hover:text-slate-400 hover:bg-white/5 transition-all shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!expanded && read.length > 0 && (
        <div className="mt-3 text-center">
          <button onClick={() => setExpanded(true)}
            className="text-[10px] font-mono uppercase text-slate-600 hover:text-cyan-400 transition-colors">
            + {read.length} older alert{read.length > 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
}
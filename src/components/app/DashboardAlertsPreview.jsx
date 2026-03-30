import { Bell, AlertTriangle, CheckCircle, Info, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const SEVERITY_ICON = {
  warning: { icon: AlertTriangle, color: "text-yellow-400" },
  success: { icon: CheckCircle, color: "text-cyan-400" },
  info:    { icon: Info,         color: "text-slate-400" },
};

export default function DashboardAlertsPreview({ alerts, onDismiss }) {
  if (!alerts?.length) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// ALERTS</div>
        <div className="flex items-center gap-3">
          <Bell className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-mono text-slate-600">No alerts. System nominal.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">// ALERTS</div>
        <span className="text-xs font-mono text-slate-600">{alerts.length} unread</span>
      </div>
      <div className="space-y-3">
        {alerts.slice(0, 3).map(a => {
          const { icon: Icon, color } = SEVERITY_ICON[a.severity] || SEVERITY_ICON.info;
          return (
            <div key={a.id} className="flex items-start gap-3">
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black uppercase text-white">{a.title}</div>
                {a.body && <p className="text-xs font-mono text-slate-500 mt-0.5 truncate">{a.body}</p>}
              </div>
              {onDismiss && (
                <button onClick={() => onDismiss(a.id)} className="text-slate-700 hover:text-slate-400 transition-colors text-xs font-mono">✕</button>
              )}
            </div>
          );
        })}
      </div>
      {alerts.length > 3 && (
        <Link to="/app/coach" className="mt-4 flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
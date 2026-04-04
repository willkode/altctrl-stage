import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { Link } from "react-router-dom";

const ICONS = {
  warning: { icon: AlertTriangle, cls: "text-yellow-400" },
  success: { icon: CheckCircle, cls: "text-green-400" },
  info: { icon: Info, cls: "text-slate-400" },
};

export default function AlertsPreview({ alerts, onDismiss }) {
  return (
    <div className="bg-[#060d1f]/80 border border-cyan-900/30 rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60">Alerts</span>
        {alerts?.length > 0 && (
          <span className="text-[10px] font-mono text-slate-600">{alerts.length}</span>
        )}
      </div>

      {!alerts?.length ? (
        <p className="text-xs font-mono text-slate-700 flex-1">System nominal.</p>
      ) : (
        <div className="space-y-2.5 flex-1">
          {alerts.slice(0, 3).map(a => {
            const { icon: Icon, cls } = ICONS[a.severity] || ICONS.info;
            return (
              <div key={a.id} className="flex items-start gap-2.5">
                <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cls}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{a.title}</p>
                  {a.body && <p className="text-[10px] font-mono text-slate-600 truncate">{a.body}</p>}
                </div>
                {onDismiss && (
                  <button onClick={() => onDismiss(a.id)} className="text-slate-800 hover:text-slate-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {alerts?.length > 3 && (
        <Link to="/app/notifications" className="mt-3 text-[10px] font-mono uppercase tracking-widest text-slate-600 hover:text-cyan-400 transition-colors">
          View all →
        </Link>
      )}
    </div>
  );
}
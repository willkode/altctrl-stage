/**
 * DataProgressBanner
 * Shown when the creator has some data but not enough to power a specific feature.
 * Used in Coach and Analytics to explain the data requirement and motivate next action.
 */
import { Link } from "react-router-dom";

export default function DataProgressBanner({ current, required, featureName, actionLabel, actionLink, hint }) {
  const pct = Math.min(100, Math.round((current / required) * 100));
  const remaining = required - current;

  return (
    <div className="bg-gradient-to-br from-yellow-500/5 to-yellow-400/3 border border-yellow-900/30 rounded-xl p-5 mb-6">
      <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-3">// DATA REQUIRED</div>
      <p className="text-sm font-black uppercase text-white mb-1">{featureName} needs more data</p>
      <p className="text-xs font-mono text-slate-400 mb-4 leading-relaxed">
        {hint || `You need ${remaining} more session${remaining > 1 ? "s" : ""} to unlock this feature. Log your next stream after it ends.`}
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 mb-1.5">
          <span>{current} of {required} sessions logged</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all"
            style={{ width: `${pct}%`, boxShadow: pct > 0 ? "0 0 6px rgba(250,204,21,0.5)" : "none" }}
          />
        </div>
      </div>

      {actionLink && (
        <Link to={actionLink}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 hover:bg-yellow-400/20 transition-all">
          {actionLabel || "Take action"} →
        </Link>
      )}
    </div>
  );
}
import { Brain, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CoachPreview({ rec }) {
  return (
    <div className="bg-[#060d1f]/80 border border-yellow-900/20 rounded-xl p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-3.5 h-3.5 text-yellow-400/60" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400/60">Coach</span>
      </div>

      {rec ? (
        <>
          <p className="text-sm font-black uppercase text-white mb-1 leading-tight">{rec.focus_title}</p>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{rec.focus_body}</p>
          {rec.action_items?.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {rec.action_items.slice(0, 2).map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-yellow-400/60 font-mono text-xs">→</span>
                  <span className="text-[11px] text-slate-400 leading-snug">{item}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm font-bold text-slate-500 mb-1">Start your system</p>
          <p className="text-xs text-slate-600 font-mono leading-relaxed flex-1">Log 3 sessions to unlock AI coaching.</p>
        </>
      )}

      <Link to="/app/coach" className="mt-4 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-yellow-400/50 hover:text-yellow-400 transition-colors">
        Full coaching <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
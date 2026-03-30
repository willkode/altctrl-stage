import { Brain, Clock, TrendingUp, Lightbulb, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardCoachCard({ rec, profile }) {
  if (!rec) {
    return (
      <div className="bg-[#060d1f] border border-yellow-900/30 rounded-lg p-5">
        <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-3 flex items-center gap-2">
          <Brain className="w-3.5 h-3.5" /> // DAILY COACHING
        </div>
        <p className="text-sm font-black uppercase text-white mb-1">START YOUR SYSTEM.</p>
        <p className="text-xs text-slate-500 font-mono leading-relaxed">
          Log 3 sessions to unlock personalized coaching. In the meantime: plan your week, schedule your first stream, and generate promo before you go live.
        </p>
        <Link to="/app/coach" className="mt-4 flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition-colors">
          Open Coach <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative bg-[#060d1f] border border-yellow-400/30 rounded-lg p-5 overflow-hidden"
      style={{ boxShadow: "0 0 20px rgba(250,204,21,0.05)" }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-40" />

      <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-4 flex items-center gap-2">
        <Brain className="w-3.5 h-3.5" /> // DAILY COACHING
      </div>

      {/* Priority action */}
      <div className="mb-4">
        <div className="text-base font-black uppercase text-white mb-1">{rec.focus_title}</div>
        <p className="text-xs text-slate-400 leading-relaxed">{rec.focus_body}</p>
      </div>

      {/* Action items */}
      {rec.action_items?.length > 0 && (
        <div className="space-y-2 mb-4">
          {rec.action_items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-yellow-400 font-mono font-bold text-xs mt-0.5">→</span>
              <span className="text-xs text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      )}

      <Link to="/app/coach"
        className="flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition-colors">
        Full coaching <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
import { Brain, Zap } from "lucide-react";
import AppBadge from "../AppBadge";

export default function DailyCoachingCard({ recommendation, sessions, profile }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  
  // If not enough data, show onboarding guidance
  if (!recommendation || sessions.length < 3) {
    return (
      <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-400/5 border border-yellow-400/30 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-yellow-400" />
          <div className="text-xs font-mono uppercase tracking-widest text-yellow-400">// TODAY'S FOCUS</div>
          <AppBadge label={today} accent="yellow" />
        </div>
        <p className="text-white font-black uppercase text-base mb-3">
          {sessions.length === 0 
            ? "START YOUR JOURNEY." 
            : "KEEP THE MOMENTUM."}
        </p>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          {sessions.length === 0
            ? "You haven't logged any sessions yet. Schedule your first stream and log its performance to unlock AI-powered coaching insights tailored to your growth patterns."
            : `You've logged ${sessions.length} session${sessions.length > 1 ? "s" : ""}. Log ${3 - sessions.length} more to unlock personalized daily coaching.`}
        </p>
        <div className="flex items-center gap-2 text-xs font-mono text-yellow-400/70 pt-3 border-t border-yellow-400/10">
          <Zap className="w-3 h-3" />
          Unlock at 3 sessions
        </div>
      </div>
    );
  }

  // Populated coaching card
  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-400/5 border border-yellow-400/30 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-yellow-400 shrink-0" />
          <div className="text-xs font-mono uppercase tracking-widest text-yellow-400">// TODAY'S FOCUS</div>
        </div>
        <AppBadge label={today} accent="yellow" />
      </div>
      
      <p className="text-white font-black uppercase text-base mb-3">
        {recommendation.focus_title}
      </p>
      
      <p className="text-slate-400 text-sm leading-relaxed mb-4">
        {recommendation.focus_body}
      </p>

      {recommendation.action_items?.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase text-yellow-400/70 mb-2">Action Items:</div>
          {recommendation.action_items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-yellow-400 font-bold shrink-0">→</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-yellow-400/10">
        <div className="text-[10px] font-mono text-yellow-400/60">
          {recommendation.recommendation_type.toUpperCase()} · Priority: {recommendation.priority}
        </div>
      </div>
    </div>
  );
}
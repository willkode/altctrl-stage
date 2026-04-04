import { Link } from "react-router-dom";
import { Clock, Gamepad2, Play, Radio } from "lucide-react";

export default function TodayStreamCard({ stream, onGeneratePromo, onLogSession }) {
  if (!stream) {
    return (
      <div className="bg-[#060d1f]/80 border border-dashed border-cyan-900/30 rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#02040f] border border-cyan-900/20 flex items-center justify-center shrink-0">
          <Play className="w-4 h-4 text-slate-700" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-500">No stream today</p>
          <p className="text-[10px] font-mono text-slate-700">Schedule one to get your pre-stream brief.</p>
        </div>
        <Link to="/app/schedule" className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 hover:text-cyan-400 transition-colors shrink-0">
          Schedule →
        </Link>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-r from-cyan-950/30 to-[#060d1f] border border-cyan-500/20 rounded-xl p-5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-400/40 via-transparent to-transparent" />
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">
          <Play className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-1">Today's Stream</p>
          <p className="text-lg font-black uppercase text-white truncate">{stream.title || stream.game}</p>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
              <Gamepad2 className="w-3 h-3 text-cyan-400/40" />{stream.game}
            </span>
            {stream.start_time && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <Clock className="w-3 h-3 text-cyan-400/40" />{stream.start_time}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {!stream.promo_generated && (
          <button onClick={onGeneratePromo} className="text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/15 transition-all">
            <Radio className="w-3 h-3 inline mr-1.5" />Promo
          </button>
        )}
        {stream.status !== "completed" && (
          <button onClick={onLogSession} className="text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/15 transition-all">
            Log Session
          </button>
        )}
      </div>
    </div>
  );
}
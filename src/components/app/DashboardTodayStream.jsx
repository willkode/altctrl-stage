import { Calendar, Radio, Play, Clock, Gamepad2 } from "lucide-react";
import AppBadge from "./AppBadge";
import { Link } from "react-router-dom";

const TYPE_COLORS = {
  ranked: "cyan", chill: "slate", viewer_games: "pink",
  challenge: "yellow", collab: "pink", special: "yellow", other: "slate",
};

export default function DashboardTodayStream({ stream, onGeneratePromo, onLogSession }) {
  if (!stream) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// TODAY'S STREAM</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded border border-cyan-900/30 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <div className="text-sm font-black uppercase text-slate-500">No stream scheduled today</div>
            <p className="text-xs font-mono text-slate-700 mt-0.5">Go to Schedule to plan your next stream.</p>
          </div>
          <Link to="/app/schedule"
            className="ml-auto text-xs font-mono uppercase tracking-widest px-3 py-2 rounded border border-cyan-900/40 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
            Schedule
          </Link>
        </div>
      </div>
    );
  }

  const accent = TYPE_COLORS[stream.stream_type] || "cyan";

  return (
    <div className="relative bg-[#060d1f] border border-cyan-500/40 rounded-lg p-5 overflow-hidden"
      style={{ boxShadow: "0 0 30px rgba(0,245,255,0.06)" }}>
      {/* Glow bar */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// TODAY'S STREAM</div>
          <div className="text-xl font-black uppercase text-white">{stream.title || stream.game}</div>
        </div>
        <AppBadge label={stream.status} accent={stream.status === "live" ? "pink" : stream.status === "completed" ? "green" : "cyan"} dot />
      </div>

      <div className="flex flex-wrap gap-4 mb-5">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
          {stream.game}
        </div>
        {stream.start_time && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {stream.start_time}
          </div>
        )}
        {stream.stream_type && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            {stream.stream_type}
          </div>
        )}
        {stream.target_duration_minutes && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            {stream.target_duration_minutes}min
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {!stream.promo_generated && (
          <button onClick={onGeneratePromo}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest px-4 py-2.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 transition-all">
            <Radio className="w-3.5 h-3.5" /> Generate Promo
          </button>
        )}
        {stream.status !== "completed" && (
          <button onClick={onLogSession}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest px-4 py-2.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all">
            Log Session
          </button>
        )}
        <Link to="/app/schedule"
          className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest px-4 py-2.5 rounded border border-cyan-900/40 text-slate-500 hover:text-slate-300 transition-all">
          View Schedule
        </Link>
      </div>
    </div>
  );
}
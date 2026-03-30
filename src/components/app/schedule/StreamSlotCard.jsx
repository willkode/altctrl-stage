import { Clock, Gamepad2, Play, RefreshCw, MoreVertical, Pencil, Trash2, CheckCircle } from "lucide-react";
import AppBadge from "../AppBadge";
import { useState } from "react";

const TYPE_ACCENT = {
  ranked: "cyan", chill: "slate", viewer_games: "pink",
  challenge: "yellow", collab: "pink", special: "yellow", other: "slate",
};

const STATUS_ACCENT = {
  planned: "cyan", live: "pink", completed: "green", skipped: "slate", cancelled: "red",
};

export default function StreamSlotCard({ stream, onEdit, onDelete }) {
  const [menu, setMenu] = useState(false);
  const accent = TYPE_ACCENT[stream.stream_type] || "cyan";

  return (
    <div className={`relative bg-[#060d1f] border rounded-lg p-3 transition-all group ${
      stream.status === "completed" ? "border-cyan-900/30 opacity-75" : "border-cyan-500/30 hover:border-cyan-400/50"
    }`}
      style={stream.status !== "completed" ? { boxShadow: "0 0 12px rgba(0,245,255,0.04)" } : {}}>

      {/* Status glow bar */}
      {stream.status === "live" && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-pulse" />
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black uppercase text-white truncate">{stream.title || stream.game}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <AppBadge label={stream.status} accent={STATUS_ACCENT[stream.status] || "cyan"} dot />
          <div className="relative">
            <button onClick={() => setMenu(m => !m)}
              className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:text-slate-300 transition-colors">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="absolute right-0 top-7 z-20 bg-[#060d1f] border border-cyan-900/40 rounded-lg py-1 min-w-[120px] shadow-xl">
                  <button onClick={() => { setMenu(false); onEdit?.(stream); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => { setMenu(false); onDelete?.(stream); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-slate-300 hover:text-red-400 hover:bg-red-500/5 transition-all">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {stream.start_time && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Clock className="w-3 h-3 text-cyan-400" /> {stream.start_time}
            {stream.target_duration_minutes && <span className="text-slate-600">· {stream.target_duration_minutes}min</span>}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Gamepad2 className="w-3 h-3 text-cyan-400" /> {stream.game}
        </div>
        {stream.stream_type && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Play className="w-3 h-3 text-slate-600" /> {stream.stream_type}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 flex-wrap">
        {stream.recurring && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <RefreshCw className="w-2.5 h-2.5" /> Recurring
          </span>
        )}
        {stream.status === "completed" && <CheckCircle className="w-3 h-3 text-cyan-400" />}
        {stream.notes && (
          <span className="text-[10px] font-mono text-slate-700 truncate">{stream.notes}</span>
        )}
      </div>
    </div>
  );
}
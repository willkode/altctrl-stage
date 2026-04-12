import { Clock, Gamepad2, Play, RefreshCw, MoreVertical, Pencil, Trash2, CheckCircle } from "lucide-react";
import AppBadge from "../AppBadge";
import { useState } from "react";
import StreamDetailModal from "./StreamDetailModal";

const TYPE_ACCENT = {
  ranked: "cyan", chill: "slate", viewer_games: "pink",
  challenge: "yellow", collab: "pink", special: "yellow", other: "slate",
};

const STATUS_ACCENT = {
  planned: "cyan", live: "pink", completed: "green", skipped: "slate", cancelled: "red",
};

function formatTime12(time) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function StreamSlotCard({ stream, onEdit, onDelete }) {
  const [menu, setMenu] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const accent = TYPE_ACCENT[stream.stream_type] || "cyan";

  return (
    <>
    <div className={`relative bg-[#060d1f] border rounded-lg p-3 transition-all group cursor-pointer ${
      stream.status === "completed" ? "border-cyan-900/30 opacity-75" : "border-cyan-500/30 hover:border-cyan-400/50"
    }`}
      onClick={() => setModalOpen(true)}
      style={stream.status !== "completed" ? { boxShadow: "0 0 12px rgba(0,245,255,0.04)" } : {}}>

      {stream.status === "live" && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-pulse" />
      )}

      {/* Header: game title + menu */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-sm font-black uppercase text-white truncate flex-1 min-w-0">{stream.title || stream.game}</p>
        <div className="relative shrink-0">
          <button onClick={(e) => { e.stopPropagation(); setMenu(m => !m); }}
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

      {/* Meta row: time · duration · type — all inline */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 flex-wrap">
        {stream.start_time && (
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400/60" />{formatTime12(stream.start_time)}</span>
        )}
        {stream.target_duration_minutes && (
          <span className="text-slate-600">{stream.target_duration_minutes}m</span>
        )}
        {stream.stream_type && (
          <span className="text-slate-500">{stream.stream_type.replace("_", " ")}</span>
        )}
      </div>

      {/* Game (only if title is set and different from game) */}
      {stream.title && stream.title !== stream.game && (
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 mt-1">
          <Gamepad2 className="w-3 h-3 text-cyan-400/40" /> {stream.game}
        </div>
      )}

      {/* Footer tags */}
      <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-white/5 flex-wrap">
        <AppBadge label={stream.status} accent={STATUS_ACCENT[stream.status] || "cyan"} dot />
        {stream.recurring && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-600"><RefreshCw className="w-2.5 h-2.5" />rec</span>
        )}
        {stream.challenge_mode_enabled && (
          <span className="text-[10px] font-mono text-yellow-400/60">⚡ challenge</span>
        )}
      </div>
    </div>
    <StreamDetailModal stream={stream} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
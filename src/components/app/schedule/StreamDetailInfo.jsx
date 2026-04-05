import { Clock, Gamepad2, Play, Calendar, Timer, RefreshCw, FileText } from "lucide-react";
import AppBadge from "../AppBadge";

const STATUS_ACCENT = {
  planned: "cyan", live: "pink", completed: "green", skipped: "slate", cancelled: "red",
};

export default function StreamDetailInfo({ stream }) {
  const date = stream.scheduled_date
    ? new Date(stream.scheduled_date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <AppBadge label={stream.status} accent={STATUS_ACCENT[stream.status] || "cyan"} dot />
        {stream.stream_type && (
          <span className="text-xs font-mono uppercase text-slate-400 bg-slate-800/50 px-2 py-1 rounded">{stream.stream_type.replace("_", " ")}</span>
        )}
        {stream.recurring && (
          <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
            <RefreshCw className="w-3 h-3" /> Recurring
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <InfoRow icon={Calendar} label="Date" value={date} />
        <InfoRow icon={Clock} label="Start Time" value={stream.start_time || "—"} />
        <InfoRow icon={Gamepad2} label="Game" value={stream.game} />
        <InfoRow icon={Timer} label="Target Duration" value={stream.target_duration_minutes ? `${stream.target_duration_minutes} min` : "—"} />
      </div>

      {stream.challenge_mode_enabled && stream.challenge_brief && (
        <div className="bg-yellow-400/5 border border-yellow-900/20 rounded-lg p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-yellow-400/60 mb-1">Challenge Mode</p>
          <p className="text-sm text-slate-300">{stream.challenge_brief}</p>
        </div>
      )}

      {stream.notes && (
        <div className="bg-[#02040f] border border-cyan-900/15 rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="w-3 h-3 text-slate-500" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Notes</p>
          </div>
          <p className="text-sm text-slate-300">{stream.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-[#02040f] rounded-lg px-4 py-3 border border-cyan-900/10">
      <Icon className="w-4 h-4 text-cyan-400/60 shrink-0" />
      <div>
        <p className="text-[10px] font-mono uppercase text-slate-600">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
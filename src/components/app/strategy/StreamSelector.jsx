import { Check, ChevronDown, Gamepad2, Clock, Calendar } from "lucide-react";
import { useState } from "react";
import SourceBadge from "../SourceBadge";

export default function StreamSelector({ streams, strategies, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const fmtDate = (d) => {
    if (d === today) return "Today";
    return new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-full bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-cyan-500/20 transition-all text-left">
        {selected ? (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-black text-white">{selected.game}</span>
              {selected.stream_type && (
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400/60">
                  {selected.stream_type.replace("_", " ")}
                </span>
              )}
              {strategies[selected.id] && (
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Strategy ✓</span>
              )}
            </div>
            <span className={`text-[11px] font-mono ${selected.scheduled_date === today ? "text-cyan-400/60" : "text-slate-500"}`}>
              {fmtDate(selected.scheduled_date)}{selected.start_time ? ` · ${selected.start_time}` : ""}{selected.target_duration_minutes ? ` · ${selected.target_duration_minutes}m` : ""}
            </span>
          </div>
        ) : (
          <span className="text-sm text-slate-500 flex-1">Select a stream…</span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#060d1f] border border-cyan-900/30 rounded-xl overflow-hidden shadow-2xl max-h-[320px] overflow-y-auto">
            {streams.length === 0 ? (
              <div className="px-5 py-4 text-xs font-mono text-slate-600 text-center">No upcoming streams scheduled.</div>
            ) : streams.map(s => (
              <button key={s.id} onClick={() => { onSelect(s); setOpen(false); }}
                className={`w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-cyan-500/5 transition-all border-b border-white/[0.02] ${
                  selected?.id === s.id ? "bg-cyan-500/5" : ""
                }`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{s.game}</span>
                    {strategies[s.id] && <Check className="w-3 h-3 text-green-400" />}
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">
                    {fmtDate(s.scheduled_date)}{s.start_time ? ` · ${s.start_time}` : ""}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
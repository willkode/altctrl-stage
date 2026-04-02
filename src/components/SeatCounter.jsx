import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const TOTAL_SEATS = 100;

export default function SeatCounter({ compact = false }) {
  const [claimed, setClaimed] = useState(null);

  useEffect(() => {
    async function load() {
      const entries = await base44.entities.WaitlistEntry.list('-created_date', 200);
      setClaimed(entries.length);
    }
    load();
  }, []);

  const remaining = claimed !== null ? Math.max(0, TOTAL_SEATS - claimed) : null;
  const pct = claimed !== null ? Math.min(100, Math.round((claimed / TOTAL_SEATS) * 100)) : 0;

  if (claimed === null) {
    return (
      <div className={`bg-black/30 border border-pink-500/30 rounded-lg p-4 ${compact ? "max-w-sm mx-auto" : ""}`}>
        <div className="flex items-center gap-2 justify-center">
          <div className="w-3 h-3 border border-pink-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-600">Loading seats…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black/30 border border-pink-500/30 rounded-lg p-4 ${compact ? "max-w-sm mx-auto" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-widest text-pink-400">// FOUNDING CREATOR SEATS</span>
        <span className="text-sm font-black text-white">
          {remaining} <span className="text-slate-500 font-mono text-xs">/ {TOTAL_SEATS} left</span>
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2.5 mb-2 overflow-hidden">
        <div
          className="h-2.5 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #ff0080, #ff4da6)",
            boxShadow: "0 0 10px rgba(255,0,128,0.7)",
          }}
        />
      </div>
      <p className="text-[10px] font-mono text-slate-600 text-center">
        {claimed} of {TOTAL_SEATS} seats claimed · When they're gone, standard pricing applies · No credit card required
      </p>
    </div>
  );
}
import { useState } from "react";
import { Plus, X, Calendar, Radio, TrendingUp, Brain } from "lucide-react";
import AIChatPanel from "./chat/AIChatPanel";

const actions = [
  { label: "Add Stream",     icon: Calendar,    color: "bg-cyan-400 text-[#02040f]",   event: "add-stream" },
  { label: "Generate Promo", icon: Radio,       color: "bg-pink-500 text-white",        event: "gen-promo" },
  { label: "Log Session",    icon: TrendingUp,  color: "bg-yellow-400 text-[#02040f]", event: "log-session" },
];

export default function QuickActions({ onAction }) {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-[59]" onClick={() => setOpen(false)} />
      )}

      <div className="fixed bottom-[72px] md:bottom-6 right-4 z-[60] flex flex-col items-end gap-3">
        {/* Action items */}
        {open && (
          <>
            <button
              onClick={() => { setOpen(false); setChatOpen(true); }}
              className="flex items-center gap-3 px-4 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-widest shadow-lg transition-all hover:scale-105 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#02040f]"
            >
              <Brain className="w-4 h-4 shrink-0" />
              AI Coach
            </button>
            {actions.map((a, i) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.event}
                  onClick={() => { setOpen(false); onAction?.(a.event); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-widest shadow-lg transition-all hover:scale-105 ${a.color}`}
                  style={{ animationDelay: `${(i + 1) * 40}ms` }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {a.label}
                </button>
              );
            })}
          </>
        )}

        {/* FAB */}
        <button
          onClick={() => setOpen(o => !o)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${
            open
              ? "bg-slate-700 text-white rotate-45"
              : "text-[#02040f] hover:scale-110"
          }`}
          style={open ? {} : {
            background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)",
            boxShadow: "0 0 20px rgba(0,245,255,0.4)",
          }}
        >
          {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>
      <AIChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
import { X } from "lucide-react";
import { useEffect } from "react";

export default function AppModal({ open, onClose, title, children, accent = "cyan" }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const borderColor = accent === "pink" ? "border-pink-500/40" : accent === "yellow" ? "border-yellow-400/40" : "border-cyan-500/40";
  const titleColor = accent === "pink" ? "text-pink-400" : accent === "yellow" ? "text-yellow-400" : "text-cyan-400";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full sm:max-w-lg bg-[#060d1f] border ${borderColor} rounded-t-2xl sm:rounded-xl overflow-hidden flex flex-col`}
        style={{ maxHeight: "92dvh" }}>
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 shrink-0">
          <div>
            <div className={`text-xs font-mono uppercase tracking-widest mb-0.5 ${titleColor}`}>// ALTCTRL</div>
            <h3 className="text-sm font-black uppercase text-white">{title}</h3>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
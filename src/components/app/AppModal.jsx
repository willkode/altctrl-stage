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
      <div className={`relative w-full sm:max-w-lg bg-[#060d1f] border ${borderColor} rounded-t-xl sm:rounded-xl overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <div className={`text-xs font-mono uppercase tracking-widest mb-0.5 ${titleColor}`}>// ALTCTRL</div>
            <h3 className="text-sm font-black uppercase text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
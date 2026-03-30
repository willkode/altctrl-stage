import { useState } from "react";
import { useToastRegister } from "../../hooks/useAppToast";
import { CheckCircle, Copy, Trash2, RefreshCw, AlertCircle, Info, X } from "lucide-react";

const CONFIG = {
  saved:       { icon: CheckCircle, color: "text-cyan-400",   border: "border-cyan-500/30",   bg: "bg-cyan-500/5" },
  copied:      { icon: Copy,        color: "text-cyan-400",   border: "border-cyan-500/30",   bg: "bg-cyan-500/5" },
  deleted:     { icon: Trash2,      color: "text-red-400",    border: "border-red-500/30",    bg: "bg-red-500/5" },
  regenerated: { icon: RefreshCw,   color: "text-pink-400",   border: "border-pink-500/30",   bg: "bg-pink-500/5" },
  error:       { icon: AlertCircle, color: "text-red-400",    border: "border-red-500/30",    bg: "bg-red-500/5" },
  info:        { icon: Info,        color: "text-slate-400",  border: "border-slate-500/30",  bg: "bg-slate-500/5" },
};

export default function AppToaster() {
  const [toasts, setToasts] = useState([]);
  useToastRegister(setToasts);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => {
        const { icon: Icon, color, border, bg } = CONFIG[t.type] || CONFIG.info;
        return (
          <div key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${border} ${bg} backdrop-blur-sm pointer-events-auto shadow-lg animate-in slide-in-from-right-4 duration-200`}
            style={{ minWidth: 220 }}>
            <Icon className={`w-4 h-4 shrink-0 ${color}`} />
            <span className="text-xs font-mono text-white flex-1">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
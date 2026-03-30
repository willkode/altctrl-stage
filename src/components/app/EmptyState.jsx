import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 border border-cyan-900/40 rounded-lg flex items-center justify-center mb-4">
        <Inbox className="w-5 h-5 text-slate-600" />
      </div>
      <div className="text-sm font-black uppercase text-slate-400 mb-2">{title}</div>
      {message && <p className="text-xs text-slate-600 font-mono max-w-xs">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
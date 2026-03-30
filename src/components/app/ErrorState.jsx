import { AlertCircle } from "lucide-react";

export default function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 border border-red-900/40 rounded-lg flex items-center justify-center mb-4">
        <AlertCircle className="w-5 h-5 text-red-500/60" />
      </div>
      <div className="text-sm font-black uppercase text-red-400 mb-2">{title}</div>
      {message && <p className="text-xs text-slate-600 font-mono max-w-xs mb-5">{message}</p>}
      {onRetry && (
        <button onClick={onRetry}
          className="text-xs font-mono uppercase tracking-widest px-4 py-2 rounded border border-red-900/40 text-red-400 hover:border-red-500/40 transition-all">
          Retry
        </button>
      )}
    </div>
  );
}
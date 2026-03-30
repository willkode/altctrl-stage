export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-8 h-8 border-2 border-cyan-900 border-t-cyan-400 rounded-full animate-spin" />
      <span className="text-xs font-mono uppercase tracking-widest text-slate-600">{message}</span>
    </div>
  );
}
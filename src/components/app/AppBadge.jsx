export default function AppBadge({ label, accent = "cyan", dot = false }) {
  const styles = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    yellow: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    slate: "bg-slate-700/30 text-slate-400 border-slate-600/30",
    green: "bg-green-500/10 text-green-400 border-green-500/30",
    red: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  const dotColor = {
    cyan: "bg-cyan-400", pink: "bg-pink-400", yellow: "bg-yellow-400",
    slate: "bg-slate-400", green: "bg-green-400", red: "bg-red-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${styles[accent] || styles.cyan}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[accent] || dotColor.cyan}`} />}
      {label}
    </span>
  );
}
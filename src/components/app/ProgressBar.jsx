export default function ProgressBar({ value = 0, max = 100, label, showValue = true, accent = "cyan" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor = accent === "pink" ? "#ff0080" : accent === "yellow" ? "#facc15" : "#00f5ff";
  const glowColor = accent === "pink" ? "rgba(255,0,128,0.4)" : accent === "yellow" ? "rgba(250,204,21,0.4)" : "rgba(0,245,255,0.4)";

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{label}</span>}
          {showValue && <span className="text-xs font-mono text-slate-400">{pct}%</span>}
        </div>
      )}
      <div className="h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor, boxShadow: `0 0 8px ${glowColor}` }} />
      </div>
    </div>
  );
}
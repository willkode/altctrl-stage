export default function ActionCard({ title, description, accent = "cyan", icon: Icon, onClick, cta = "Go", disabled = false }) {
  const accentColor = accent === "pink" ? "text-pink-400" : accent === "yellow" ? "text-yellow-400" : "text-cyan-400";
  const borderColor = accent === "pink" ? "border-pink-900/40 hover:border-pink-500/40" : accent === "yellow" ? "border-yellow-900/40 hover:border-yellow-500/40" : "border-cyan-900/40 hover:border-cyan-500/40";
  const btnStyle = accent === "pink"
    ? "bg-pink-500/10 text-pink-400 border border-pink-500/30 hover:bg-pink-500/20"
    : accent === "yellow"
    ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/20"
    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20";

  return (
    <div className={`bg-[#060d1f] border ${borderColor} rounded-lg p-5 transition-all ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3 mb-3">
        {Icon && <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${accentColor}`} />}
        <div className="flex-1">
          <div className="text-sm font-black uppercase text-white">{title}</div>
          {description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>}
        </div>
      </div>
      {onClick && (
        <button onClick={onClick} disabled={disabled}
          className={`text-xs font-mono uppercase tracking-widest px-4 py-2 rounded transition-all ${btnStyle}`}>
          {cta}
        </button>
      )}
    </div>
  );
}
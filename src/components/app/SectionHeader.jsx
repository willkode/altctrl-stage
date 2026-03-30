export default function SectionHeader({ tag, title, subtitle, accent = "cyan", action }) {
  const accentColor = accent === "pink" ? "text-pink-400" : accent === "yellow" ? "text-yellow-400" : "text-cyan-400";
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {tag && <div className={`text-xs font-mono uppercase tracking-widest mb-1 ${accentColor}`}>// {tag}</div>}
        <h2 className="text-xl font-black uppercase text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
export default function ChartCard({ title, tag, children, accent = "cyan", className = "" }) {
  const accentColor = accent === "pink" ? "text-pink-400" : accent === "yellow" ? "text-yellow-400" : "text-cyan-400";
  const borderColor = accent === "pink" ? "border-pink-900/40" : accent === "yellow" ? "border-yellow-900/40" : "border-cyan-900/40";

  return (
    <div className={`bg-[#060d1f] border ${borderColor} rounded-lg overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-white/5">
        {tag && <div className={`text-xs font-mono uppercase tracking-widest mb-1 ${accentColor}`}>// {tag}</div>}
        <div className="text-sm font-black uppercase text-white">{title}</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
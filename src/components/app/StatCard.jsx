export default function StatCard({ label, value, sub, accent = "cyan", icon: Icon }) {
  const accentColor = accent === "pink" ? "text-pink-400" : accent === "yellow" ? "text-yellow-400" : "text-cyan-400";
  const borderColor = accent === "pink" ? "border-pink-900/40" : accent === "yellow" ? "border-yellow-900/40" : "border-cyan-900/40";

  return (
    <div className={`bg-[#060d1f] border ${borderColor} rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-mono uppercase tracking-widest ${accentColor}`}>{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${accentColor}`} />}
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1 font-mono">{sub}</div>}
    </div>
  );
}
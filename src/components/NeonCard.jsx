export default function NeonCard({ children, className = "", accent = "cyan", hover = true }) {
  const borderColor = accent === "pink" ? "border-pink-500/40 hover:border-pink-400" : accent === "yellow" ? "border-yellow-400/40 hover:border-yellow-300" : "border-cyan-500/40 hover:border-cyan-400";
  const glowColor = accent === "pink" ? "hover:shadow-[0_0_20px_rgba(255,0,128,0.15)]" : accent === "yellow" ? "hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]" : "hover:shadow-[0_0_20px_rgba(0,245,255,0.15)]";

  return (
    <div className={`bg-[#060d1f] border ${borderColor} rounded-lg p-6 transition-all duration-300 ${hover ? glowColor : ""} ${className}`}>
      {children}
    </div>
  );
}
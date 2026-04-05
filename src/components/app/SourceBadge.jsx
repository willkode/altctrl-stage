export default function SourceBadge({ source, size = "sm" }) {
  if (!source) return null;

  const config = {
    manual: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", label: "Manual" },
    extension_import: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", label: "Extension" },
    hybrid: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400", label: "Hybrid" },
    desktop_sync: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", label: "Desktop" },
  };

  const c = config[source] || config.manual;
  const padding = size === "sm" ? "px-2 py-1 text-[9px]" : "px-2.5 py-1.5 text-[10px]";

  return (
    <span className={`inline-block font-mono uppercase tracking-widest rounded border ${c.bg} ${c.border} ${c.text} ${padding}`}>
      {c.label}
    </span>
  );
}
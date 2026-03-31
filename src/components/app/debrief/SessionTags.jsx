const TAGS = [
  { value: "solo", label: "🎮 Solo" },
  { value: "collab", label: "👥 Collab" },
  { value: "challenge", label: "🏆 Challenge" },
  { value: "ranked", label: "📊 Ranked" },
  { value: "community", label: "🤝 Community" },
  { value: "event", label: "🎉 Event" },
  { value: "grind", label: "⚡ Grind" },
];

export default function SessionTags({ session, onChange }) {
  const tags = session.session_tags || [];

  const toggle = (tag) => {
    const newTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
    onChange({ ...session, session_tags: newTags });
  };

  return (
    <div className="bg-[#060d1f] border border-yellow-900/30 rounded-xl p-5 space-y-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-400">// Session Tags</div>
      <p className="text-xs font-mono text-slate-600">Tag this session to identify patterns in your streams.</p>
      
      <div className="flex flex-wrap gap-2">
        {TAGS.map(t => (
          <button
            key={t.value}
            onClick={() => toggle(t.value)}
            type="button"
            className={`px-3 py-2 rounded border text-xs font-mono uppercase tracking-wide transition-all ${
              tags.includes(t.value)
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                : "bg-[#02040f] border-cyan-900/30 text-slate-500 hover:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="text-xs font-mono text-slate-600">
          {tags.length} tag{tags.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
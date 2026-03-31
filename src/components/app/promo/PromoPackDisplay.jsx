import { useState } from "react";
import { Copy, Check, Zap } from "lucide-react";
import AppBadge from "../AppBadge";

function CopyBtn({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle}
      className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded border transition-all ${
        copied
          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
          : "bg-transparent border-cyan-900/30 text-slate-600 hover:border-cyan-500/30 hover:text-cyan-400"
      }`}>
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : (label || "Copy")}
    </button>
  );
}

function CopyAllBtn({ kit }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    const all = [
      kit.hook && `HOOK:\n${kit.hook}`,
      kit.caption && `CAPTION:\n${kit.caption}`,
      kit.hashtags?.length && `HASHTAGS:\n${kit.hashtags.map(h => `#${h.replace(/^#/, "")}`).join(" ")}`,
      kit.title_options?.length && `TITLE OPTIONS:\n${kit.title_options.join("\n")}`,
    ].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(all);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle}
      className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded border transition-all ${
        copied
          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
          : "bg-pink-500/5 border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
      }`}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "All Copied!" : "Copy All"}
    </button>
  );
}

export default function PromoPackDisplay({ kit, onMarkPosted, onRegenerate, posting }) {
  if (!kit) return null;

  return (
    <div className="relative bg-[#060d1f] border border-pink-500/30 rounded-xl overflow-hidden"
      style={{ boxShadow: "0 0 30px rgba(255,0,128,0.06)" }}>
      {/* Glow bar */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-60" />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Zap className="w-4 h-4 text-pink-400" />
          <span className="text-sm font-black uppercase text-white">{kit.game}</span>
          {kit.stream_type && <AppBadge label={kit.stream_type} accent="pink" />}
          {kit.status === "posted" && <AppBadge label="Posted" accent="green" dot />}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Hook */}
        {kit.hook && (
          <div className="bg-[#02040f] border border-pink-900/30 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-pink-400">// Hook</span>
              <CopyBtn text={kit.hook} label="Copy Hook" />
            </div>
            <p className="text-sm text-white leading-relaxed font-semibold">{kit.hook}</p>
          </div>
        )}

        {/* Caption */}
        {kit.caption && (
          <div className="bg-[#02040f] border border-cyan-900/30 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">// Caption</span>
              <CopyBtn text={kit.caption} label="Copy Caption" />
            </div>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{kit.caption}</p>
          </div>
        )}

        {/* Hashtags */}
        {kit.hashtags?.length > 0 && (
          <div className="bg-[#02040f] border border-cyan-900/30 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">// Hashtags</span>
              <CopyBtn text={kit.hashtags.map(h => `#${h.replace(/^#/, "")}`).join(" ")} label="Copy All Tags" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {kit.hashtags.map((h, i) => (
                <button key={i}
                  onClick={() => { navigator.clipboard.writeText(`#${h.replace(/^#/, "")}`); }}
                  className="text-xs font-mono text-cyan-400 bg-cyan-500/5 border border-cyan-900/40 px-2.5 py-1 rounded hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all">
                  #{h.replace(/^#/, "")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title options */}
        {kit.title_options?.length > 0 && (
          <div className="bg-[#02040f] border border-pink-900/30 rounded-lg p-4">
            <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// Stream Title Options</div>
            <div className="space-y-2">
              {kit.title_options.map((t, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <span className="text-xs font-mono text-slate-700 shrink-0">0{i + 1}</span>
                  <span className="text-sm text-white flex-1 font-semibold">{t}</span>
                  <CopyBtn text={t} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Sticky mobile action bar */}
      <div className="sticky bottom-0 border-t border-white/5 bg-[#060d1f] px-5 py-4 flex gap-2">
        <CopyAllBtn kit={kit} />
        {onRegenerate && (
          <button onClick={onRegenerate}
            className="flex-1 text-xs font-mono uppercase tracking-widest px-3 py-3 rounded border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all">
            Regenerate
          </button>
        )}
        {kit.status !== "posted" && onMarkPosted && (
          <button onClick={onMarkPosted} disabled={posting}
            className="flex-1 bg-pink-500 text-white font-black uppercase tracking-widest py-3 rounded-lg text-xs hover:bg-pink-400 transition-all disabled:opacity-40">
            {posting ? "Saving…" : "✓ Posted"}
          </button>
        )}
        {kit.status === "posted" && (
          <div className="flex-1 text-center text-xs font-mono text-slate-600 py-3">// Posted {kit.posted_at?.split("T")[0]}</div>
        )}
      </div>
    </div>
  );
}
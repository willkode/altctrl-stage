import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import AppBadge from "../AppBadge";

const STATUS_ACCENT = { draft: "slate", saved: "cyan", posted: "green", archived: "slate" };

function QuickCopy({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      className="w-7 h-7 flex items-center justify-center rounded border border-cyan-900/30 text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
      {copied ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function PromoPackCard({ kit, versionLabel, onView, onTogglePosted }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#060d1f] border border-pink-900/20 rounded-lg overflow-hidden hover:border-pink-900/40 transition-all">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black uppercase text-white">{kit.game}</span>
            {kit.stream_type && <span className="text-xs font-mono text-slate-600">{kit.stream_type}</span>}
            {versionLabel && <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-pink-900/30 text-pink-400/60">{versionLabel}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <AppBadge label={kit.status} accent={STATUS_ACCENT[kit.status] || "slate"} dot />
            {kit.stream_date && <span className="text-[10px] font-mono text-slate-700">{kit.stream_date}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onView?.(kit); }}
            className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded border border-pink-900/40 text-pink-400/60 hover:text-pink-400 hover:border-pink-500/40 transition-all">
            View
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
          {kit.hook && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-mono uppercase text-pink-400/60 mt-1 shrink-0 w-12">Hook</span>
              <p className="text-xs text-slate-300 flex-1 leading-relaxed line-clamp-2">{kit.hook}</p>
              <QuickCopy text={kit.hook} />
            </div>
          )}
          {kit.caption && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-mono uppercase text-cyan-400/60 mt-1 shrink-0 w-12">Caption</span>
              <p className="text-xs text-slate-300 flex-1 leading-relaxed line-clamp-2">{kit.caption}</p>
              <QuickCopy text={kit.caption} />
            </div>
          )}
          {kit.hashtags?.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-mono uppercase text-cyan-400/60 mt-1 shrink-0 w-12">Tags</span>
              <p className="text-xs text-cyan-400/70 flex-1 leading-relaxed line-clamp-1">
                {kit.hashtags.slice(0, 5).map(h => `#${h.replace(/^#/, "")}`).join(" ")}
              </p>
              <QuickCopy text={kit.hashtags.map(h => `#${h.replace(/^#/, "")}`).join(" ")} />
            </div>
          )}
          <div className="flex gap-2 pt-2">
            {kit.status !== "posted" && (
              <button onClick={() => onTogglePosted?.(kit)}
                className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 transition-all">
                Mark Posted
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import AppModal from "../AppModal";
import { useAppToast } from "../../../hooks/useAppToast";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle}
      className="shrink-0 w-7 h-7 flex items-center justify-center rounded border border-cyan-900/40 hover:border-cyan-500/40 text-slate-500 hover:text-cyan-400 transition-all">
      {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function PromoPackDrawer({ open, onClose, kit, onMarkedPosted }) {
  const toast = useAppToast();
  const [marking, setMarking] = useState(false);

  if (!kit) return null;

  const handleMarkPosted = async () => {
    setMarking(true);
    await base44.entities.PromoKit.update(kit.id, { status: "posted", posted_at: new Date().toISOString() });
    toast.saved("Marked as posted");
    setMarking(false);
    onMarkedPosted?.();
    onClose();
  };

  return (
    <AppModal open={open} onClose={onClose} title="Promo Pack" accent="pink">
      <div className="space-y-5">
        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono uppercase tracking-widest text-pink-400">{kit.game}</span>
          {kit.stream_type && <span className="text-xs font-mono text-slate-600">· {kit.stream_type}</span>}
          {kit.stream_date && <span className="text-xs font-mono text-slate-600">· {kit.stream_date}</span>}
        </div>

        {/* Hook */}
        {kit.hook && (
          <div className="bg-[#02040f] border border-pink-900/30 rounded p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-pink-400">Hook</span>
              <CopyButton text={kit.hook} />
            </div>
            <p className="text-sm text-white leading-relaxed">{kit.hook}</p>
          </div>
        )}

        {/* Caption */}
        {kit.caption && (
          <div className="bg-[#02040f] border border-cyan-900/30 rounded p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Caption</span>
              <CopyButton text={kit.caption} />
            </div>
            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{kit.caption}</p>
          </div>
        )}

        {/* Hashtags */}
        {kit.hashtags?.length > 0 && (
          <div className="bg-[#02040f] border border-cyan-900/30 rounded p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Hashtags</span>
              <CopyButton text={kit.hashtags.map(h => `#${h.replace(/^#/, "")}`).join(" ")} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {kit.hashtags.map((h, i) => (
                <span key={i} className="text-xs font-mono text-cyan-400 bg-cyan-500/5 border border-cyan-900/40 px-2 py-1 rounded">
                  #{h.replace(/^#/, "")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Title options */}
        {kit.title_options?.length > 0 && (
          <div className="bg-[#02040f] border border-pink-900/30 rounded p-4">
            <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">Stream Title Options</div>
            <div className="space-y-2">
              {kit.title_options.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm text-white flex-1">{t}</span>
                  <CopyButton text={t} />
                </div>
              ))}
            </div>
          </div>
        )}

        {kit.status !== "posted" && (
          <button onClick={handleMarkPosted} disabled={marking}
            className="w-full bg-pink-500 text-white font-black uppercase tracking-widest py-3.5 rounded text-xs hover:bg-pink-400 transition-all disabled:opacity-40">
            {marking ? "Saving..." : "Mark as Posted"}
          </button>
        )}
        {kit.status === "posted" && (
          <div className="text-center text-xs font-mono text-slate-600 py-2">// Posted {kit.posted_at?.split("T")[0]}</div>
        )}
      </div>
    </AppModal>
  );
}
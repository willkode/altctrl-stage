import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function PromoGenerator({ stream }) {
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user =>
      base44.entities.CreatorProfile.filter({ created_by: user.email }).then(p => setProfile(p[0] || null))
    );
  }, []);

  async function generate() {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a TikTok live stream marketing expert. Generate promotional content for this upcoming stream:

Game: ${stream.game}
Stream Type: ${stream.stream_type || "general"}
Date: ${stream.scheduled_date}
Start Time: ${stream.start_time || "TBD"}
Challenge Mode: ${stream.challenge_mode_enabled ? "Yes - " + (stream.challenge_brief || "") : "No"}
Creator Style: ${profile?.promo_tone || "hype"}
Creator Niche: ${profile?.creator_niche || "gaming"}

Return a JSON object with:
- "stream_title" (catchy TikTok live stream title, max 30 chars)
- "caption_short" (short TikTok caption with emojis, 1-2 lines)
- "caption_long" (longer caption for posts, 3-4 lines with hashtags)
- "hook_lines" (array of 3 attention-grabbing one-liners to say at stream start)
- "story_text" (text for an IG/TikTok story announcement, very short and punchy)
- "cta" (call-to-action line to drive viewers to the stream)`,
      response_json_schema: {
        type: "object",
        properties: {
          stream_title: { type: "string" },
          caption_short: { type: "string" },
          caption_long: { type: "string" },
          hook_lines: { type: "array", items: { type: "string" } },
          story_text: { type: "string" },
          cta: { type: "string" },
        },
      },
    });
    setPromo(res);
    setLoading(false);
  }

  function copyText(text, label) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  }

  if (!promo && !loading) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-6 h-6 text-pink-400/60 mx-auto mb-3" />
        <p className="text-sm font-bold text-white mb-1">Generate Promo Content</p>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
          AI will create titles, captions, hooks, and story text tailored to your stream.
        </p>
        <button onClick={generate}
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-5 py-3 rounded-lg bg-pink-500 text-white font-black hover:bg-pink-400 transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Generate Promo
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-6 h-6 text-pink-400 animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-white">Creating promo content…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CopyBlock label="Stream Title" value={promo.stream_title} copied={copied} onCopy={copyText} />
      <CopyBlock label="Short Caption" value={promo.caption_short} copied={copied} onCopy={copyText} />
      <CopyBlock label="Long Caption" value={promo.caption_long} copied={copied} onCopy={copyText} />
      <CopyBlock label="Story Text" value={promo.story_text} copied={copied} onCopy={copyText} />
      <CopyBlock label="Call to Action" value={promo.cta} copied={copied} onCopy={copyText} />

      {promo.hook_lines?.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-2">Hook Lines</p>
          <div className="space-y-1.5">
            {promo.hook_lines.map((line, i) => (
              <CopyBlock key={i} label={`Hook ${i + 1}`} value={line} copied={copied} onCopy={copyText} />
            ))}
          </div>
        </div>
      )}

      <button onClick={generate}
        className="text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-pink-400 transition-colors">
        ↻ Regenerate
      </button>
    </div>
  );
}

function CopyBlock({ label, value, copied, onCopy }) {
  if (!value) return null;
  const isCopied = copied === label;
  return (
    <div className="bg-[#02040f] border border-cyan-900/10 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600">{label}</p>
        <button onClick={() => onCopy(value, label)}
          className="flex items-center gap-1 text-[10px] font-mono text-slate-600 hover:text-cyan-400 transition-colors">
          {isCopied ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
          {isCopied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-slate-300 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
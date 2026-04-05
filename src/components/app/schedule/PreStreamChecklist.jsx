import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, CheckCircle2, Circle } from "lucide-react";

export default function PreStreamChecklist({ stream }) {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stream.saved_checklist) {
      try { setChecklist(JSON.parse(stream.saved_checklist)); } catch {}
    }
  }, [stream.id]);

  async function generate() {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a practical pre-stream checklist for a TikTok live stream.
Game: ${stream.game}
Stream Type: ${stream.stream_type || "general"}
Date: ${stream.scheduled_date}
Start Time: ${stream.start_time || "TBD"}
Duration: ${stream.target_duration_minutes || 60} minutes

Return a JSON object with:
- "before_stream" (array of 5-6 practical tasks to do 2+ hours before — e.g. create & post promo content, charge devices, plan game setup)
- "right_before" (array of 4-5 tasks to do 15-30 min before — e.g. launch OBS/software, test audio/video, check internet, clear notifications, set phone to DND)
- "opening_moves" (array of 3-4 things to do in the first 3 minutes live — e.g. greet chat, introduce the stream, call out the challenge or goal)

Keep each item short, direct, and actionable. No fluff. Real streamer tasks only.`,
      response_json_schema: {
        type: "object",
        properties: {
          before_stream: { type: "array", items: { type: "string" } },
          right_before: { type: "array", items: { type: "string" } },
          opening_moves: { type: "array", items: { type: "string" } },
        },
      },
    });
    setChecklist(res);
    await base44.entities.ScheduledStream.update(stream.id, { saved_checklist: JSON.stringify(res) });
    setLoading(false);
  }

  const [checked, setChecked] = useState({});
  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  if (!checklist && !loading) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-6 h-6 text-yellow-400/60 mx-auto mb-3" />
        <p className="text-sm font-bold text-white mb-1">Generate Pre-Stream Checklist</p>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
          AI will create a personalized checklist based on your game, stream type, and schedule.
        </p>
        <button onClick={generate}
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-5 py-3 rounded-lg bg-yellow-400 text-[#02040f] font-black hover:bg-yellow-300 transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Generate Checklist
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-6 h-6 text-yellow-400 animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-white">Building your checklist…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <CheckSection title="Before Stream (30-60 min)" items={checklist.before_stream} checked={checked} onToggle={toggle} prefix="b" />
      <CheckSection title="Right Before (5 min)" items={checklist.right_before} checked={checked} onToggle={toggle} prefix="r" />
      <CheckSection title="Opening Moves (First 5 min)" items={checklist.opening_moves} checked={checked} onToggle={toggle} prefix="o" />

      {checklist.tip && (
        <div className="bg-yellow-400/5 border border-yellow-900/20 rounded-lg p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-yellow-400/60 mb-1">Pro Tip</p>
          <p className="text-sm text-slate-300">{checklist.tip}</p>
        </div>
      )}

      <button onClick={generate}
        className="text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-yellow-400 transition-colors">
        ↻ Regenerate
      </button>
    </div>
  );
}

function CheckSection({ title, items, checked, onToggle, prefix }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-2">{title}</p>
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const key = `${prefix}-${i}`;
          const done = checked[key];
          return (
            <button key={key} onClick={() => onToggle(key)}
              className={`flex items-start gap-2.5 w-full text-left px-3 py-2 rounded-lg border transition-all ${
                done ? "bg-cyan-500/5 border-cyan-500/20" : "bg-[#02040f] border-cyan-900/10 hover:border-cyan-900/20"
              }`}>
              {done
                ? <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                : <Circle className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />}
              <span className={`text-sm ${done ? "text-slate-500 line-through" : "text-slate-300"}`}>{item}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Crosshair, RefreshCw } from "lucide-react";

export default function StreamStrategyTab({ stream }) {
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stream.saved_strategy) {
      try { setStrategy(JSON.parse(stream.saved_strategy)); } catch {}
    }
  }, [stream.id]);

  async function generate() {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert TikTok live stream coach. Generate a detailed session strategy for this stream:

Game: ${stream.game}
Stream Type: ${stream.stream_type || "general"}
Date: ${stream.scheduled_date}
Start Time: ${stream.start_time || "TBD"}
Target Duration: ${stream.target_duration_minutes || 60} minutes
Challenge Mode: ${stream.challenge_mode_enabled ? "Yes - " + (stream.challenge_brief || "") : "No"}
Notes: ${stream.notes || "none"}

Return a JSON object with:
- "overall_objective" (one sentence goal for this stream)
- "opening_hook" (what to do in the first 2 minutes to retain viewers)
- "peak_strategy" (how to drive peak engagement once momentum builds)
- "engagement_prompts" (array of 4 things to say to the audience during the stream)
- "milestones" (array of 3 time-based milestones with "time" and "action" fields)
- "recovery_play" (what to do if viewers drop)
- "closing_move" (how to end the stream strong and drive follows/shares)
- "avoid" (array of 3 things NOT to do this stream)`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_objective: { type: "string" },
          opening_hook: { type: "string" },
          peak_strategy: { type: "string" },
          engagement_prompts: { type: "array", items: { type: "string" } },
          milestones: { type: "array", items: { type: "object", properties: { time: { type: "string" }, action: { type: "string" } } } },
          recovery_play: { type: "string" },
          closing_move: { type: "string" },
          avoid: { type: "array", items: { type: "string" } },
        },
      },
    });
    setStrategy(res);
    await base44.entities.ScheduledStream.update(stream.id, { saved_strategy: JSON.stringify(res) });
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-white">Building your strategy…</p>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="text-center py-8">
        <Crosshair className="w-6 h-6 text-cyan-400/60 mx-auto mb-3" />
        <p className="text-sm font-bold text-white mb-1">Generate Stream Strategy</p>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
          AI builds a full playbook — opening hook, engagement prompts, milestones, and recovery plays. Syncs to the desktop app.
        </p>
        <button onClick={generate}
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-5 py-3 rounded-lg bg-cyan-500 text-[#02040f] font-black hover:bg-cyan-400 transition-all">
          <Crosshair className="w-3.5 h-3.5" /> Generate Strategy
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Objective */}
      <StrategyBlock label="🎯 Objective" color="cyan">
        <p className="text-sm text-white font-bold">{strategy.overall_objective}</p>
      </StrategyBlock>

      {/* Opening */}
      <StrategyBlock label="🚀 Opening Hook (first 2 min)" color="yellow">
        <p className="text-sm text-slate-300">{strategy.opening_hook}</p>
      </StrategyBlock>

      {/* Peak strategy */}
      <StrategyBlock label="📈 Peak Strategy" color="cyan">
        <p className="text-sm text-slate-300">{strategy.peak_strategy}</p>
      </StrategyBlock>

      {/* Milestones */}
      {strategy.milestones?.length > 0 && (
        <StrategyBlock label="⏱ Time Milestones" color="cyan">
          <div className="space-y-2">
            {strategy.milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded shrink-0">{m.time}</span>
                <p className="text-sm text-slate-300">{m.action}</p>
              </div>
            ))}
          </div>
        </StrategyBlock>
      )}

      {/* Engagement prompts */}
      {strategy.engagement_prompts?.length > 0 && (
        <StrategyBlock label="💬 Say This to the Chat" color="pink">
          <ul className="space-y-1">
            {strategy.engagement_prompts.map((p, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-pink-400 shrink-0">→</span> {p}
              </li>
            ))}
          </ul>
        </StrategyBlock>
      )}

      {/* Recovery */}
      <StrategyBlock label="🛟 Recovery Play (if viewers drop)" color="yellow">
        <p className="text-sm text-slate-300">{strategy.recovery_play}</p>
      </StrategyBlock>

      {/* Closing */}
      <StrategyBlock label="🏁 Closing Move" color="cyan">
        <p className="text-sm text-slate-300">{strategy.closing_move}</p>
      </StrategyBlock>

      {/* Avoid */}
      {strategy.avoid?.length > 0 && (
        <StrategyBlock label="🚫 Avoid This Stream" color="red">
          <ul className="space-y-1">
            {strategy.avoid.map((a, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-red-400 shrink-0">✕</span> {a}
              </li>
            ))}
          </ul>
        </StrategyBlock>
      )}

      <button onClick={generate}
        className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors">
        <RefreshCw className="w-3 h-3" /> Regenerate
      </button>
    </div>
  );
}

function StrategyBlock({ label, color, children }) {
  const border = color === "yellow" ? "border-yellow-900/20" : color === "pink" ? "border-pink-900/20" : color === "red" ? "border-red-900/20" : "border-cyan-900/20";
  const labelColor = color === "yellow" ? "text-yellow-400/60" : color === "pink" ? "text-pink-400/60" : color === "red" ? "text-red-400/60" : "text-cyan-400/60";
  return (
    <div className={`bg-[#02040f] border ${border} rounded-lg p-3`}>
      <p className={`text-[10px] font-mono uppercase tracking-widest ${labelColor} mb-2`}>{label}</p>
      {children}
    </div>
  );
}
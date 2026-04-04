import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ChallengeCard from "./ChallengeCard";
import { Swords, Loader2, RefreshCw, Sparkles, Settings2 } from "lucide-react";

const MODES = [
  { value: "solo", label: "Solo" },
  { value: "viewer_bet", label: "Viewer Bet" },
  { value: "community_vote", label: "Community Vote" },
  { value: "speedrun", label: "Speedrun" },
  { value: "restriction", label: "Restriction" },
  { value: "custom", label: "Custom" },
];

const STYLES = [
  { value: "hardcore", label: "Hardcore" },
  { value: "funny", label: "Funny" },
  { value: "competitive", label: "Competitive" },
  { value: "chill_but_spicy", label: "Chill but Spicy" },
  { value: "viewer_driven", label: "Viewer Driven" },
];

export default function ChallengeGenerator({ stream }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [mode, setMode] = useState(stream?.challenge_mode || "solo");
  const [style, setStyle] = useState(stream?.challenge_style || "competitive");
  const [gameContext, setGameContext] = useState(stream?.ai_game_context_snapshot || "");
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (stream) loadChallenges();
  }, [stream?.id]);

  async function loadChallenges() {
    setLoading(true);
    const user = await base44.auth.me();
    const list = await base44.entities.GameChallenge.filter({
      scheduled_stream_id: stream.id,
      created_by: user.email,
    }, "-generated_at", 20);
    setChallenges(list);
    setMode(stream.challenge_mode || "solo");
    setStyle(stream.challenge_style || "competitive");
    setGameContext(stream.ai_game_context_snapshot || "");
    setLoading(false);
  }

  async function saveConfig() {
    setSavingConfig(true);
    await base44.entities.ScheduledStream.update(stream.id, {
      challenge_mode: mode,
      challenge_style: style,
      ai_game_context_snapshot: gameContext,
    });
    setSavingConfig(false);
    setShowConfig(false);
  }

  async function generate() {
    // Save config first
    await base44.entities.ScheduledStream.update(stream.id, {
      challenge_mode: mode,
      challenge_style: style,
      ai_game_context_snapshot: gameContext,
    });

    setGenerating(true);
    const res = await base44.functions.invoke("generateGameChallenge", {
      scheduled_stream_id: stream.id,
      count: 3,
    });
    if (res.data?.challenges) {
      setChallenges(prev => [...res.data.challenges, ...prev]);
    }
    setGenerating(false);
  }

  async function selectChallenge(challenge) {
    // Deselect others first
    for (const c of challenges.filter(x => x.status === "selected")) {
      await base44.entities.GameChallenge.update(c.id, { status: "generated" });
    }
    await base44.entities.GameChallenge.update(challenge.id, { status: "selected" });
    setChallenges(prev => prev.map(c =>
      c.id === challenge.id ? { ...c, status: "selected" } : c.status === "selected" ? { ...c, status: "generated" } : c
    ));
  }

  async function skipChallenge(challenge) {
    await base44.entities.GameChallenge.update(challenge.id, { status: "skipped" });
    setChallenges(prev => prev.map(c => c.id === challenge.id ? { ...c, status: "skipped" } : c));
  }

  if (!stream) return null;

  const active = challenges.filter(c => c.status !== "skipped");
  const skipped = challenges.filter(c => c.status === "skipped");

  const inp = "w-full bg-[#02040f] border border-cyan-900/20 focus:border-cyan-500/20 text-white placeholder-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono outline-none transition-all";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-pink-400/60" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-pink-400/60">Game Challenges</p>
          <span className="text-[10px] font-mono text-slate-700">{stream.game}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1 text-[9px] font-mono uppercase px-2.5 py-1.5 rounded-lg border transition-all ${
              showConfig ? "border-pink-500/20 text-pink-400 bg-pink-500/5" : "border-cyan-900/20 text-slate-600 hover:text-slate-400"
            }`}>
            <Settings2 className="w-3 h-3" /> Config
          </button>
          <button onClick={generate} disabled={generating}
            className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/15 transition-all disabled:opacity-50">
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {generating ? "Generating…" : challenges.length > 0 ? "More" : "Generate"}
          </button>
        </div>
      </div>

      {/* Config panel */}
      {showConfig && (
        <div className="bg-[#060d1f]/80 border border-pink-900/20 rounded-xl p-4 space-y-3">
          <div>
            <label className="text-[9px] font-mono uppercase text-slate-600 mb-1.5 block">Challenge Mode</label>
            <div className="flex flex-wrap gap-1.5">
              {MODES.map(m => (
                <button key={m.value} onClick={() => setMode(m.value)}
                  className={`text-[10px] font-mono uppercase px-3 py-2 rounded-lg border transition-all ${
                    mode === m.value ? "bg-pink-500/10 border-pink-500/20 text-pink-400" : "border-cyan-900/20 text-slate-600 hover:text-slate-400"
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[9px] font-mono uppercase text-slate-600 mb-1.5 block">Challenge Style</label>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map(s => (
                <button key={s.value} onClick={() => setStyle(s.value)}
                  className={`text-[10px] font-mono uppercase px-3 py-2 rounded-lg border transition-all ${
                    style === s.value ? "bg-pink-500/10 border-pink-500/20 text-pink-400" : "border-cyan-900/20 text-slate-600 hover:text-slate-400"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[9px] font-mono uppercase text-slate-600 mb-1.5 block">
              Game Context <span className="normal-case text-slate-700">(JSON — maps, modes, weapons, mechanics)</span>
            </label>
            <textarea value={gameContext} onChange={e => setGameContext(e.target.value)}
              rows={4} placeholder='{"modes": ["Battle Royale", "Zero Build"], "weapons": ["Pump Shotgun", "AR"], "maps": ["Chapter 5"]}'
              className={inp + " resize-none"} />
            <p className="text-[9px] font-mono text-slate-700 mt-1">This grounds the AI — add real game data to prevent hallucinated mechanics.</p>
          </div>
          <button onClick={saveConfig} disabled={savingConfig}
            className="text-[10px] font-mono uppercase tracking-widest px-4 py-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/15 transition-all disabled:opacity-50">
            {savingConfig ? "Saving…" : "Save Config"}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
        </div>
      ) : generating && challenges.length === 0 ? (
        <div className="bg-[#060d1f]/80 border border-pink-500/10 rounded-xl p-10 text-center">
          <div className="w-8 h-8 border-2 border-pink-400/20 border-t-pink-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-white mb-0.5">Generating Challenges</p>
          <p className="text-[10px] font-mono text-slate-600">Analyzing {stream.game} mechanics, {mode} mode, {style} style…</p>
        </div>
      ) : active.length === 0 && !generating ? (
        <div className="bg-[#060d1f]/80 border border-dashed border-pink-900/20 rounded-xl p-8 text-center">
          <Swords className="w-6 h-6 text-slate-700 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-500 mb-1">No challenges yet</p>
          <p className="text-xs font-mono text-slate-600 mb-3">Configure mode & style above, then generate AI challenges for {stream.game}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map(c => (
            <ChallengeCard key={c.id} challenge={c} onSelect={selectChallenge} onSkip={skipChallenge} />
          ))}
        </div>
      )}

      {/* Skipped */}
      {skipped.length > 0 && (
        <details className="group">
          <summary className="text-[10px] font-mono uppercase text-slate-700 cursor-pointer hover:text-slate-500 transition-colors">
            {skipped.length} skipped
          </summary>
          <div className="mt-2 space-y-2">
            {skipped.map(c => (
              <div key={c.id} className="bg-[#060d1f]/40 border border-slate-800/20 rounded-lg px-4 py-2.5 opacity-50">
                <p className="text-xs font-bold text-slate-500">{c.challenge_title}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
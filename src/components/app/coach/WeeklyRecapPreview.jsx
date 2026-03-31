import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, BarChart3, RefreshCw, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AppBadge from "../AppBadge";

export default function WeeklyRecapPreview({ recap, previousRecap, onRefresh }) {
  const [generating, setGenerating] = useState(false);

  async function generate(force = false) {
    setGenerating(true);
    await base44.functions.invoke('generateWeeklyRecap', { force });
    setGenerating(false);
    onRefresh?.();
  }

  if (!recap) {
    return (
      <div className="bg-[#060d1f] border border-pink-900/20 rounded-xl p-5">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// WEEKLY RECAP</div>
        <div className="text-center py-6">
          <BarChart3 className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-black uppercase text-slate-400 mb-2">No recap yet</p>
          <p className="text-xs font-mono text-slate-600 mb-4">Generate last week's recap based on your logged sessions.</p>
          <button onClick={() => generate(false)} disabled={generating}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-4 py-2.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/30 hover:bg-pink-500/20 transition-all disabled:opacity-50 mx-auto">
            {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {generating ? 'Generating...' : 'Generate Last Week Recap'}
          </button>
        </div>
      </div>
    );
  }

  const trendIcon = (current, previous) => {
    if (!previous || previous === 0) return <Minus className="w-3 h-3 text-slate-600" />;
    if (current > previous) return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (current < previous) return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-slate-600" />;
  };

  const formatWeekRange = () => {
    if (!recap.week_start_date) return "";
    const start = new Date(recap.week_start_date + "T12:00:00");
    const end = recap.week_end_date ? new Date(recap.week_end_date + "T12:00:00") : null;
    const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return end ? `${fmt(start)} - ${fmt(end)}` : fmt(start);
  };

  return (
    <div className="bg-[#060d1f] border border-pink-900/20 rounded-xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400">// WEEKLY RECAP</div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-600">{formatWeekRange()}</span>
          <button onClick={() => generate(true)} disabled={generating} title="Regenerate recap"
            className="w-7 h-7 flex items-center justify-center rounded border border-pink-500/20 text-pink-400/50 hover:text-pink-400 hover:border-pink-500/40 transition-all disabled:opacity-30">
            <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {recap.highlight && (
        <div className="bg-pink-500/5 border border-pink-500/20 rounded-lg p-3 mb-4">
          <div className="text-xs font-mono uppercase text-pink-400/70 mb-1">Highlight</div>
          <p className="text-sm text-white">{recap.highlight}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono uppercase text-slate-600">Streams</span>
            {trendIcon(recap.streams_completed, previousRecap?.streams_completed)}
          </div>
          <div className="text-lg font-black text-white">{recap.streams_completed || 0}</div>
          {recap.streams_planned > 0 && (
            <div className="text-[9px] font-mono text-slate-700">/ {recap.streams_planned} planned</div>
          )}
        </div>

        <div className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono uppercase text-slate-600">Avg Viewers</span>
            {trendIcon(recap.avg_viewers, previousRecap?.avg_viewers)}
          </div>
          <div className="text-lg font-black text-white">{recap.avg_viewers || "—"}</div>
        </div>

        <div className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono uppercase text-slate-600">Peak</span>
            {trendIcon(recap.peak_viewers, previousRecap?.peak_viewers)}
          </div>
          <div className="text-lg font-black text-white">{recap.peak_viewers || "—"}</div>
        </div>

        <div className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono uppercase text-slate-600">Followers</span>
            {trendIcon(recap.followers_gained, previousRecap?.followers_gained)}
          </div>
          <div className="text-lg font-black text-white">+{recap.followers_gained || 0}</div>
        </div>
      </div>

      {recap.consistency_score != null && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono text-slate-500">Consistency Score:</span>
          <AppBadge 
            label={`${recap.consistency_score}%`} 
            accent={recap.consistency_score >= 80 ? "green" : recap.consistency_score >= 50 ? "yellow" : "red"} 
          />
        </div>
      )}

      {recap.top_game && (
        <div className="text-xs font-mono text-slate-500">
          Top game: <span className="text-pink-400 font-bold">{recap.top_game}</span>
        </div>
      )}

      {recap.ai_summary && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-[10px] font-mono uppercase text-pink-400/70 mb-2">AI Summary:</div>
          <p className="text-xs text-slate-400 leading-relaxed">{recap.ai_summary}</p>
        </div>
      )}

      {(recap.goals_hit > 0 || recap.goals_missed > 0) && (
        <div className="mt-3 flex items-center gap-3 text-xs font-mono">
          {recap.goals_hit > 0 && <span className="text-green-400">✓ {recap.goals_hit} goal{recap.goals_hit > 1 ? "s" : ""} hit</span>}
          {recap.goals_missed > 0 && <span className="text-red-400/60">✗ {recap.goals_missed} missed</span>}
        </div>
      )}
    </div>
  );
}
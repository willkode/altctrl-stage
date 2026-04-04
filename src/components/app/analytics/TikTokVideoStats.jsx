import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Heart, MessageCircle, Share2, Eye, RefreshCw, ExternalLink } from "lucide-react";

function fmt(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Number(n).toLocaleString();
}

function parseStats(raw) {
  if (!raw) return {};
  try {
    const p = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      views: p.view_count ?? p.play_count ?? p.statistics?.play_count ?? null,
      likes: p.like_count ?? p.digg_count ?? p.statistics?.digg_count ?? null,
      comments: p.comment_count ?? p.statistics?.comment_count ?? null,
      shares: p.share_count ?? p.statistics?.share_count ?? null,
    };
  } catch {
    return {};
  }
}

export default function TikTokVideoStats() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("create_time");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { loadVideos(); }, []);

  async function loadVideos() {
    setLoading(true);
    const user = await base44.auth.me();
    const accounts = await base44.entities.ConnectedAccount.filter({ created_by: user.email, provider: "tiktok" });
    if (!accounts.length) { setLoading(false); return; }
    const vids = await base44.entities.TikTokVideo.filter(
      { connected_account_id: accounts[0].id },
      "-create_time",
      100
    );
    setVideos(vids);
    setLoading(false);
  }

  async function handleSync() {
    setSyncing(true);
    try {
      await base44.functions.invoke("runTikTokFullSync", {});
      await loadVideos();
    } catch {}
    setSyncing(false);
  }

  if (loading) return (
    <div className="bg-[#060d1f] border border-pink-900/30 rounded-lg p-6">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-pink-900 border-t-pink-400 rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-600">Loading video data…</span>
      </div>
    </div>
  );

  if (!videos.length) return null;

  // Parse stats for each video
  const withStats = videos.map(v => ({ ...v, _stats: parseStats(v.raw_payload_json) }));

  // Sort
  const sorted = [...withStats].sort((a, b) => {
    if (sortBy === "views") return (b._stats.views ?? 0) - (a._stats.views ?? 0);
    if (sortBy === "likes") return (b._stats.likes ?? 0) - (a._stats.likes ?? 0);
    if (sortBy === "comments") return (b._stats.comments ?? 0) - (a._stats.comments ?? 0);
    if (sortBy === "shares") return (b._stats.shares ?? 0) - (a._stats.shares ?? 0);
    return (b.create_time ?? 0) - (a.create_time ?? 0); // newest first
  });

  // Aggregate totals
  const totals = withStats.reduce((acc, v) => ({
    views: acc.views + (v._stats.views ?? 0),
    likes: acc.likes + (v._stats.likes ?? 0),
    comments: acc.comments + (v._stats.comments ?? 0),
    shares: acc.shares + (v._stats.shares ?? 0),
  }), { views: 0, likes: 0, comments: 0, shares: 0 });

  const SORTS = [
    { key: "create_time", label: "Newest" },
    { key: "views", label: "Views" },
    { key: "likes", label: "Likes" },
    { key: "comments", label: "Comments" },
    { key: "shares", label: "Shares" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400">// TIKTOK VIDEO PERFORMANCE</div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-600">{videos.length} videos</span>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1 text-[10px] font-mono uppercase text-pink-400 hover:text-pink-300 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync"}
          </button>
        </div>
      </div>

      {/* Totals row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Views", value: fmt(totals.views), icon: Eye, accent: "cyan" },
          { label: "Total Likes", value: fmt(totals.likes), icon: Heart, accent: "pink" },
          { label: "Total Comments", value: fmt(totals.comments), icon: MessageCircle, accent: "yellow" },
          { label: "Total Shares", value: fmt(totals.shares), icon: Share2, accent: "cyan" },
        ].map(({ label, value, icon: Icon, accent }) => {
          const colors = {
            cyan: "text-cyan-400 border-cyan-900/40",
            pink: "text-pink-400 border-pink-900/30",
            yellow: "text-yellow-400 border-yellow-900/30",
          };
          return (
            <div key={label} className={`bg-[#060d1f] border ${colors[accent]} rounded-xl p-4`}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">{label}</div>
              <div className={`text-2xl font-black ${colors[accent].split(" ")[0]}`}>{value}</div>
            </div>
          );
        })}
      </div>

      {/* Sort bar */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <span className="text-[10px] font-mono text-slate-600 mr-1">Sort:</span>
        {SORTS.map(s => (
          <button key={s.key} onClick={() => setSortBy(s.key)}
            className={`text-[10px] font-mono uppercase px-2.5 py-1.5 rounded border transition-all ${
              sortBy === s.key
                ? "border-pink-500/40 text-pink-400 bg-pink-500/10"
                : "border-cyan-900/30 text-slate-600 hover:text-slate-400"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Video table */}
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl overflow-hidden">
        <div className="divide-y divide-white/5">
          {sorted.map(v => {
            const date = v.create_time
              ? new Date(v.create_time * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : null;
            return (
              <div key={v.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                {/* Thumbnail */}
                {v.cover_image_url ? (
                  <img src={v.cover_image_url} alt="" className="w-10 h-14 object-cover rounded shrink-0 border border-white/10" />
                ) : (
                  <div className="w-10 h-14 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Play className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate mb-0.5">
                    {v.title || v.video_description || "Untitled"}
                  </div>
                  {date && <div className="text-[10px] font-mono text-slate-600">{date}</div>}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-black text-cyan-400">{fmt(v._stats.views)}</div>
                    <div className="text-[9px] font-mono text-slate-700">views</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-black text-pink-400">{fmt(v._stats.likes)}</div>
                    <div className="text-[9px] font-mono text-slate-700">likes</div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-black text-yellow-400">{fmt(v._stats.comments)}</div>
                    <div className="text-[9px] font-mono text-slate-700">comments</div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-black text-green-400">{fmt(v._stats.shares)}</div>
                    <div className="text-[9px] font-mono text-slate-700">shares</div>
                  </div>
                  {v.share_url && (
                    <a href={v.share_url} target="_blank" rel="noopener noreferrer"
                      className="text-slate-700 hover:text-pink-400 transition-colors shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
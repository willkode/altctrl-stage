import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, RefreshCw, Loader2, Tv, ExternalLink, AlertCircle } from "lucide-react";

function fmt(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const PLATFORM_COLORS = {
  tiktok: { border: "border-pink-900/30", text: "text-pink-400", bg: "bg-pink-500/10", label: "TikTok" },
  twitch: { border: "border-purple-900/30", text: "text-purple-400", bg: "bg-purple-500/10", label: "Twitch" },
  youtube: { border: "border-red-900/30", text: "text-red-400", bg: "bg-red-500/10", label: "YouTube" },
};

function PlatformCard({ conn, onSync, syncing }) {
  const colors = PLATFORM_COLORS[conn.platform] || PLATFORM_COLORS.tiktok;
  const lastSync = conn.last_sync_at ? new Date(conn.last_sync_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never";

  return (
    <div className={`bg-[#060d1f] border ${colors.border} rounded-xl p-5`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded ${colors.bg} border ${colors.border} ${colors.text}`}>
            {colors.label}
          </span>
          {conn.verified && <span className="text-[9px] text-green-400">✓</span>}
        </div>
        <button
          onClick={() => onSync(conn)}
          disabled={syncing}
          className={`flex items-center gap-1 text-[10px] font-mono uppercase ${colors.text} hover:opacity-80 transition-all disabled:opacity-40`}
        >
          {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {syncing ? "Syncing…" : "Sync"}
        </button>
      </div>

      <div className="mb-3">
        <div className="text-white font-black text-base">{conn.profile_title || conn.handle}</div>
        <div className="text-xs font-mono text-slate-500">@{conn.handle}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Followers</div>
          <div className={`text-xl font-black ${colors.text}`}>{fmt(conn.followers)}</div>
        </div>
        <div className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Status</div>
          <div className={`text-sm font-black ${conn.status === "online" ? "text-green-400" : "text-slate-500"}`}>
            {conn.status === "online" ? "🟢 Live" : conn.status === "offline" ? "Offline" : "Unknown"}
          </div>
        </div>
      </div>

      {conn.last_stream_title && (
        <div className="text-[10px] font-mono text-slate-600 truncate mb-2">
          Last: <span className="text-slate-400">{conn.last_stream_title}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-slate-700">Synced {lastSync}</span>
        {conn.profile_url && (
          <a href={conn.profile_url} target="_blank" rel="noopener noreferrer"
            className="text-slate-700 hover:text-cyan-400 transition-colors">
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {conn.last_error && (
        <div className="mt-2 flex items-start gap-1.5 text-[9px] font-mono text-red-400 bg-red-500/5 border border-red-900/20 rounded px-2 py-1.5">
          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
          <span className="truncate">{conn.last_error}</span>
        </div>
      )}
    </div>
  );
}

export default function ExternalPlatformStats() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);

  useEffect(() => { loadConnections(); }, []);

  async function loadConnections() {
    setLoading(true);
    const user = await base44.auth.me();
    const conns = await base44.entities.ExternalPlatformConnection.filter(
      { created_by: user.email },
      "-last_sync_at",
      10
    );
    setConnections(conns);
    setLoading(false);
  }

  async function handleSync(conn) {
    setSyncingId(conn.id);
    try {
      await base44.functions.invoke("fetchExternalStats", {
        platform: conn.platform,
        handle: conn.handle,
        id: conn.id,
      });
      await loadConnections();
    } catch (err) {
      console.error("Sync failed:", err);
    }
    setSyncingId(null);
  }

  if (loading) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-6 animate-pulse">
        <div className="h-4 w-40 bg-white/5 rounded mb-4" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-6">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// PLATFORM STATS</div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase text-white mb-1">No platforms connected</div>
            <div className="text-xs font-mono text-slate-600">Connect your TikTok, Twitch, or YouTube in Settings to see stats here.</div>
          </div>
          <a href="/app/settings" className="shrink-0 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all">
            Settings →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">// PLATFORM STATS</div>
        <span className="text-[10px] font-mono text-slate-600">{connections.length} connected</span>
      </div>
      <div className={`grid gap-4 ${connections.length === 1 ? "grid-cols-1" : connections.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {connections.map(conn => (
          <PlatformCard
            key={conn.id}
            conn={conn}
            onSync={handleSync}
            syncing={syncingId === conn.id}
          />
        ))}
      </div>
    </div>
  );
}
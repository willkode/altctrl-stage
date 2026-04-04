import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Heart, Video, UserPlus, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

function StatBox({ label, value, sub, icon: Icon, accent = "cyan" }) {
  const colors = {
    cyan: { text: "text-cyan-400", border: "border-cyan-900/40", icon: "text-cyan-400/40" },
    pink: { text: "text-pink-400", border: "border-pink-900/30", icon: "text-pink-400/40" },
    yellow: { text: "text-yellow-400", border: "border-yellow-900/30", icon: "text-yellow-400/40" },
    green: { text: "text-green-400", border: "border-green-900/30", icon: "text-green-400/40" },
  };
  const c = colors[accent] || colors.cyan;
  return (
    <div className={`bg-[#060d1f] border ${c.border} rounded-xl p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">{label}</div>
          <div className={`text-2xl font-black ${c.text}`}>{value}</div>
          {sub && <div className="text-[10px] font-mono text-slate-600 mt-1">{sub}</div>}
        </div>
        {Icon && <Icon className={`w-5 h-5 ${c.icon} shrink-0 mt-1`} />}
      </div>
    </div>
  );
}

function TrendIndicator({ current, previous }) {
  if (current == null || previous == null) return null;
  const diff = current - previous;
  if (diff === 0) return <Minus className="w-3 h-3 text-slate-600 inline" />;
  if (diff > 0) return <span className="text-green-400 text-[10px] font-mono">+{diff.toLocaleString()}</span>;
  return <span className="text-red-400 text-[10px] font-mono">{diff.toLocaleString()}</span>;
}

function fmt(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function TikTokAccountStats() {
  const [loading, setLoading] = useState(true);
  const [snapshots, setSnapshots] = useState([]);
  const [account, setAccount] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    // Get connection status first
    const statusRes = await base44.functions.invoke("tiktokAuth", { action: "get_status" });
    const status = statusRes.data;
    if (status.connected) {
      setAccount({
        connection_status: "connected",
        display_name: status.display_name,
        username: status.username,
        avatar_url: status.avatar_url,
        last_sync_at: status.last_sync_at,
        last_sync_status: status.last_sync_status,
      });
      // Filter by connected_account_id (snapshots saved via service role)
      const snaps = await base44.entities.TikTokProfileSnapshot.filter(
        { connected_account_id: status.connection_id },
        "-captured_at",
        30
      );
      setSnapshots(snaps);
    } else {
      setAccount(null);
      setSnapshots([]);
    }
    setLoading(false);
  }

  async function handleSync() {
    if (!account || account.connection_status !== "connected") return;
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await base44.functions.invoke("runTikTokFullSync", {});
      if (res.data?.status === "failed" || res.data?.errors?.length) {
        const errs = res.data.errors || [];
        if (errs.some(e => e.includes("403"))) {
          setSyncError("TikTok token expired. Please reconnect TikTok in Settings.");
        } else {
          setSyncError(errs[0] || "Sync failed");
        }
      } else {
        await loadData();
      }
    } catch (e) {
      setSyncError(e.message || "Sync failed");
    }
    setSyncing(false);
  }

  if (loading) {
    return (
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// TIKTOK ACCOUNT</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["Followers", "Following", "Total Likes", "Videos"].map(label => (
            <div key={label} className="bg-[#060d1f] border border-pink-900/30 rounded-xl p-4 animate-pulse">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-2">{label}</div>
              <div className="h-7 w-16 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!account || account.connection_status !== "connected") {
    return (
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// TIKTOK ACCOUNT</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {[
            { label: "Followers", icon: Users, accent: "pink" },
            { label: "Following", icon: UserPlus, accent: "cyan" },
            { label: "Total Likes", icon: Heart, accent: "pink" },
            { label: "Videos", icon: Video, accent: "yellow" },
          ].map(({ label, icon: Icon, accent }) => (
            <StatBox key={label} label={label} value="—" sub="not connected" icon={Icon} accent={accent} />
          ))}
        </div>
        <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase text-white mb-0.5">Connect TikTok to sync your stats</div>
            <div className="text-[10px] font-mono text-slate-600">Followers, likes, videos and live stream data will appear here.</div>
          </div>
          <a href="/app/settings" className="shrink-0 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 transition-all whitespace-nowrap">
            Connect →
          </a>
        </div>
      </div>
    );
  }

  const latest = snapshots[0];
  const previous = snapshots[1];
  if (!latest) {
    return (
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// TIKTOK ACCOUNT</div>
        <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl p-4 flex items-center gap-4">
          {account.avatar_url && <img src={account.avatar_url} alt="" className="w-10 h-10 rounded-lg border border-pink-900/40 object-cover" />}
          <div className="flex-1">
            <div className="text-white font-black">{account.display_name || account.username}</div>
            <div className="text-xs font-mono text-slate-500">Connected — sync in progress</div>
          </div>
          <button onClick={handleSync} disabled={syncing} className="flex items-center gap-1 text-[10px] font-mono uppercase text-pink-400 hover:text-pink-300 transition-colors disabled:opacity-40">
            <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Syncing…" : "Sync Now"}
          </button>
        </div>
      </div>
    );
  }

  const lastSynced = account.last_sync_at
    ? new Date(account.last_sync_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Never";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400">// TIKTOK ACCOUNT</div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-600">Synced: {lastSynced}</span>
          {syncError && (
            <span className="text-[10px] font-mono text-red-400 max-w-[200px] truncate" title={syncError}>{syncError}</span>
          )}
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

      {/* Account identity */}
      <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl p-4 mb-3 flex items-center gap-4">
        {account.avatar_url && (
          <img src={account.avatar_url} alt="" className="w-12 h-12 rounded-lg border border-pink-900/40 object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-white font-black text-lg">{account.display_name || account.username}</div>
          {account.username && <div className="text-xs font-mono text-slate-500">@{account.username}</div>}
        </div>
        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 shrink-0">
          Connected
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <StatBox
          label="Followers"
          value={fmt(latest.follower_count)}
          sub={previous ? <TrendIndicator current={latest.follower_count} previous={previous.follower_count} /> : "from TikTok"}
          icon={Users}
          accent="pink"
        />
        <StatBox
          label="Following"
          value={fmt(latest.following_count)}
          icon={UserPlus}
          accent="cyan"
        />
        <StatBox
          label="Total Likes"
          value={fmt(latest.likes_count)}
          sub={previous ? <TrendIndicator current={latest.likes_count} previous={previous.likes_count} /> : "on all videos"}
          icon={Heart}
          accent="pink"
        />
        <StatBox
          label="Videos"
          value={fmt(latest.video_count)}
          sub={previous ? <TrendIndicator current={latest.video_count} previous={previous.video_count} /> : "published"}
          icon={Video}
          accent="yellow"
        />
      </div>

      {/* Follower trend (if we have multiple snapshots) */}
      {snapshots.length >= 2 && (
        <FollowerTrend snapshots={snapshots} />
      )}
    </div>
  );
}

function FollowerTrend({ snapshots }) {
  // Show recent snapshots as a mini trend
  const sorted = [...snapshots].reverse(); // oldest first
  const data = sorted
    .filter(s => s.follower_count != null)
    .map(s => ({
      date: new Date(s.captured_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      followers: s.follower_count,
    }));

  if (data.length < 2) return null;

  const first = data[0].followers;
  const last = data[data.length - 1].followers;
  const change = last - first;

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600">Follower Trend</div>
        <div className="flex items-center gap-1.5">
          {change > 0 ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : change < 0 ? <TrendingDown className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5 text-slate-600" />}
          <span className={`text-xs font-black ${change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-slate-600"}`}>
            {change > 0 ? "+" : ""}{change.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-slate-600">since first sync</span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-12">
        {data.map((d, i) => {
          const min = Math.min(...data.map(x => x.followers));
          const max = Math.max(...data.map(x => x.followers));
          const range = max - min || 1;
          const height = Math.max(4, ((d.followers - min) / range) * 48);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                className="w-full rounded-sm bg-pink-500/30 group-hover:bg-pink-500/50 transition-colors"
                style={{ height: `${height}px` }}
              />
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#02040f] border border-pink-900/40 rounded px-1.5 py-0.5 text-[9px] font-mono text-pink-400 whitespace-nowrap z-10">
                {d.followers.toLocaleString()} · {d.date}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px] font-mono text-slate-700">{data[0].date}</span>
        <span className="text-[9px] font-mono text-slate-700">{data[data.length - 1].date}</span>
      </div>
    </div>
  );
}
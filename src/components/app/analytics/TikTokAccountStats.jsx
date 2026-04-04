import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Heart, Video, UserPlus, TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink, BadgeCheck, ChevronDown, ChevronUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function fmt(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function pctChange(current, previous) {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function GrowthBadge({ current, previous, invert = false }) {
  const pct = pctChange(current, previous);
  if (pct == null) return <span className="text-slate-600 text-[10px] font-mono">—</span>;
  const isPositive = invert ? pct < 0 : pct > 0;
  const isNeutral = Math.abs(pct) < 0.01;
  if (isNeutral) return <span className="flex items-center gap-0.5 text-slate-500 text-[10px] font-mono"><Minus className="w-3 h-3" /> 0%</span>;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-mono font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, accent = "cyan", current, previous, invert }) {
  const colors = {
    cyan: { text: "text-cyan-400", border: "border-cyan-900/40", icon: "text-cyan-400/30" },
    pink: { text: "text-pink-400", border: "border-pink-900/30", icon: "text-pink-400/30" },
    yellow: { text: "text-yellow-400", border: "border-yellow-900/30", icon: "text-yellow-400/30" },
    green: { text: "text-green-400", border: "border-green-900/30", icon: "text-green-400/30" },
  };
  const c = colors[accent] || colors.cyan;
  return (
    <div className={`bg-[#060d1f] border ${c.border} rounded-xl p-4 flex flex-col gap-2`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${c.icon} shrink-0`} />}
      </div>
      <div className={`text-2xl font-black ${c.text}`}>{value}</div>
      <div className="flex items-center justify-between gap-2">
        {sub && <span className="text-[10px] font-mono text-slate-600">{sub}</span>}
        {current != null && previous != null && (
          <GrowthBadge current={current} previous={previous} invert={invert} />
        )}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#02040f] border border-cyan-900/40 rounded-lg px-3 py-2 text-xs font-mono">
      <div className="text-slate-500 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value?.toLocaleString()}</div>
      ))}
    </div>
  );
}

function TrendChart({ snapshots, field, color, label }) {
  const sorted = [...snapshots].reverse();
  const data = sorted
    .filter(s => s[field] != null)
    .map(s => ({
      date: new Date(s.captured_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      [label]: s[field],
    }));

  if (data.length < 2) return (
    <div className="flex items-center justify-center h-24 text-[10px] font-mono text-slate-700">Not enough data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={90}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#475569", fontFamily: "monospace" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "#475569", fontFamily: "monospace" }} tickLine={false} axisLine={false} tickFormatter={fmt} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey={label} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function TikTokAccountStats() {
  const [loading, setLoading] = useState(true);
  const [snapshots, setSnapshots] = useState([]);
  const [account, setAccount] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
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
        connection_id: status.connection_id,
      });
      const snaps = await base44.entities.TikTokProfileSnapshot.filter(
        { connected_account_id: status.connection_id },
        "-captured_at",
        60
      );
      setSnapshots(snaps);
    } else {
      setAccount(null);
      setSnapshots([]);
    }
    setLoading(false);
  }

  async function handleSync() {
    setSyncing(true);
    setSyncError(null);
    const res = await base44.functions.invoke("runTikTokFullSync", {});
    if (res.data?.status === "failed" || res.data?.errors?.length) {
      setSyncError(res.data.errors?.[0] || "Sync failed");
    } else {
      await loadData();
    }
    setSyncing(false);
  }

  if (loading) return (
    <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl p-6 animate-pulse">
      <div className="h-4 w-32 bg-white/5 rounded mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
      </div>
    </div>
  );

  if (!account || account.connection_status !== "connected") return (
    <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl p-6">
      <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// TIKTOK ACCOUNT</div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-black uppercase text-white mb-1">Connect TikTok to see your stats</div>
          <div className="text-xs font-mono text-slate-600">Followers, likes, videos, trends and more.</div>
        </div>
        <a href="/app/settings" className="shrink-0 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 transition-all">Connect →</a>
      </div>
    </div>
  );

  const latest = snapshots[0];
  const previous = snapshots[1];
  const oldest = snapshots[snapshots.length - 1];

  const lastSynced = account.last_sync_at
    ? new Date(account.last_sync_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Never";

  // Growth since first snapshot
  const followerGrowthTotal = latest && oldest && latest !== oldest
    ? (latest.follower_count ?? 0) - (oldest.follower_count ?? 0)
    : null;
  const likesGrowthTotal = latest && oldest && latest !== oldest
    ? (latest.likes_count ?? 0) - (oldest.likes_count ?? 0)
    : null;

  // Engagement rate estimate (likes per video)
  const likesPerVideo = latest?.video_count > 0
    ? Math.round((latest.likes_count ?? 0) / latest.video_count)
    : null;

  return (
    <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {account.avatar_url && (
            <img src={account.avatar_url} alt="" className="w-10 h-10 rounded-lg border border-pink-900/40 object-cover" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-base">{account.display_name || account.username}</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-green-500/10 border border-green-500/30 text-green-400">Connected</span>
            </div>
            {account.username && <div className="text-xs font-mono text-slate-500">@{account.username}</div>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-mono text-slate-600">Last synced</div>
            <div className="text-[10px] font-mono text-slate-500">{lastSynced}</div>
          </div>
          {syncError && <span className="text-[10px] font-mono text-red-400 max-w-[160px] truncate" title={syncError}>{syncError}</span>}
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-pink-400 hover:text-pink-300 border border-pink-900/40 hover:border-pink-500/40 px-3 py-1.5 rounded transition-all disabled:opacity-40">
            <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync"}
          </button>
          <button onClick={() => setExpanded(e => !e)} className="text-slate-600 hover:text-slate-400 transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-5">
          {/* Stats grid */}
          {latest ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="Followers" icon={Users} accent="pink"
                  value={fmt(latest.follower_count)}
                  sub={followerGrowthTotal != null ? `${followerGrowthTotal >= 0 ? "+" : ""}${followerGrowthTotal.toLocaleString()} all time` : "since first sync"}
                  current={latest.follower_count} previous={previous?.follower_count}
                />
                <StatCard
                  label="Following" icon={UserPlus} accent="cyan"
                  value={fmt(latest.following_count)}
                  current={latest.following_count} previous={previous?.following_count}
                />
                <StatCard
                  label="Total Likes" icon={Heart} accent="pink"
                  value={fmt(latest.likes_count)}
                  sub={likesGrowthTotal != null ? `${likesGrowthTotal >= 0 ? "+" : ""}${likesGrowthTotal.toLocaleString()} all time` : undefined}
                  current={latest.likes_count} previous={previous?.likes_count}
                />
                <StatCard
                  label="Videos" icon={Video} accent="yellow"
                  value={fmt(latest.video_count)}
                  sub={likesPerVideo != null ? `~${fmt(likesPerVideo)} likes/video` : undefined}
                  current={latest.video_count} previous={previous?.video_count}
                />
              </div>

              {/* Secondary stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#02040f] border border-cyan-900/30 rounded-xl p-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">Follower / Following Ratio</div>
                  <div className="text-xl font-black text-cyan-400">
                    {latest.following_count > 0 ? (latest.follower_count / latest.following_count).toFixed(2) : "—"}x
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 mt-1">
                    {latest.follower_count > latest.following_count ? "More followers than following ✓" : "Following more than followers"}
                  </div>
                </div>
                <div className="bg-[#02040f] border border-pink-900/30 rounded-xl p-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">Avg Likes per Video</div>
                  <div className="text-xl font-black text-pink-400">{fmt(likesPerVideo)}</div>
                  <div className="text-[10px] font-mono text-slate-600 mt-1">{fmt(latest.video_count)} total videos</div>
                </div>
                <div className="bg-[#02040f] border border-yellow-900/30 rounded-xl p-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">Account Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    {latest.is_verified
                      ? <><BadgeCheck className="w-5 h-5 text-blue-400" /><span className="text-sm font-black text-blue-400">Verified</span></>
                      : <span className="text-sm font-black text-slate-500">Not Verified</span>}
                  </div>
                  {latest.bio_description && (
                    <div className="text-[10px] font-mono text-slate-600 mt-2 line-clamp-2">{latest.bio_description}</div>
                  )}
                </div>
              </div>

              {/* Trend charts */}
              {snapshots.length >= 2 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[#02040f] border border-pink-900/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600">Follower Trend</div>
                      <GrowthBadge current={latest.follower_count} previous={oldest?.follower_count} />
                    </div>
                    <TrendChart snapshots={snapshots} field="follower_count" color="#f472b6" label="Followers" />
                  </div>
                  <div className="bg-[#02040f] border border-cyan-900/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600">Likes Trend</div>
                      <GrowthBadge current={latest.likes_count} previous={oldest?.likes_count} />
                    </div>
                    <TrendChart snapshots={snapshots} field="likes_count" color="#00f5ff" label="Likes" />
                  </div>
                </div>
              )}

            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-sm font-black uppercase text-slate-500 mb-2">No snapshots yet</div>
              <p className="text-xs font-mono text-slate-600 mb-4">Sync your account to capture your first stats snapshot.</p>
              <button onClick={handleSync} disabled={syncing}
                className="text-xs font-mono uppercase text-pink-400 border border-pink-900/40 px-4 py-2 rounded hover:bg-pink-500/10 transition-all disabled:opacity-40">
                {syncing ? "Syncing…" : "Sync Now"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
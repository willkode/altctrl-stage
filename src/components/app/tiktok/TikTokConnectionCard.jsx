/**
 * TikTokConnectionCard
 * Uses manual OAuth flow via tiktokAuth backend function.
 * NO Base44 connector SDK — tokens stored in TikTokConnection entity.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, RefreshCw, Unlink, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";

// Redirect URI must match what's registered in TikTok Developer Portal
const REDIRECT_URI = window.location.origin + "/tiktok-callback";

export default function TikTokConnectionCard() {
  const [status, setStatus] = useState(null); // null = loading
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch connection status from tiktokAuth
  const fetchStatus = async () => {
    try {
      const res = await base44.functions.invoke("tiktokAuth", { action: "get_status" });
      setStatus(res.data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) fetchStatus();
    });
  }, []);

  // Open TikTok OAuth popup
  const handleConnect = async () => {
    try {
      const res = await base44.functions.invoke("tiktokAuth", { 
        action: "get_auth_url", 
        redirect_uri: REDIRECT_URI 
      });
      if (!res.data.auth_url) {
        setError("Failed to get TikTok auth URL");
        return;
      }
      // Store state for CSRF validation
      sessionStorage.setItem("tiktok_oauth_state", res.data.state);
      sessionStorage.setItem("tiktok_redirect_uri", REDIRECT_URI);
      
      const popup = window.open(res.data.auth_url, "_blank");
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          fetchStatus().then(() => handleSync());
        }
      }, 500);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke("runTikTokFullSync", {});
      await fetchStatus();
    } catch (e) {
      setError(e.message);
    }
    setSyncing(false);
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect TikTok? Your imported data will be preserved.")) return;
    setDisconnecting(true);
    try {
      await base44.functions.invoke("tiktokAuth", { action: "disconnect" });
      await fetchStatus();
    } catch (e) {
      setError(e.message);
    }
    setDisconnecting(false);
  };

  const isConnected = status?.connected === true;
  const fmt = (iso) => iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

  if (!status) {
    return (
      <div className="flex items-center gap-3 py-3">
        <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
        <span className="text-xs font-mono text-slate-600">Checking connection…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />
          )}
          <div>
            <p className="text-sm text-white font-mono">
              {isConnected
                ? (status.display_name || status.username || "TikTok Account")
                : "TikTok Not Connected"}
            </p>
            {isConnected && status.username && (
              <p className="text-xs font-mono text-slate-500">@{status.username}</p>
            )}
            {!isConnected && (
              <p className="text-xs font-mono text-slate-600 mt-0.5">
                Connect to import your profile stats and video library.
              </p>
            )}
          </div>
        </div>

        {isConnected ? (
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400">
            Connected
          </span>
        ) : (
          <button onClick={handleConnect}
            className="flex items-center gap-1.5 text-xs font-mono uppercase px-4 py-2 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 transition-all shrink-0">
            <ExternalLink className="w-3.5 h-3.5" /> Connect TikTok
          </button>
        )}
      </div>

      {/* Connected detail rows */}
      {isConnected && (
        <>
          {/* Last sync */}
          <div className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              <Clock className="w-3 h-3" /> Sync Status
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-slate-600">Last sync: </span>
                <span className={status.last_sync_status === "success" ? "text-green-400" : "text-slate-400"}>
                  {fmt(status.last_sync_at) || "Never"}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Status: </span>
                <span className={
                  status.last_sync_status === "success" ? "text-green-400" :
                  status.last_sync_status === "failed" ? "text-red-400" :
                  "text-slate-400"
                }>{status.last_sync_status || "never"}</span>
              </div>
            </div>
          </div>

          {/* Error banner */}
          {status.last_error && (
            <div className="flex items-start gap-2 bg-red-500/5 border border-red-900/40 rounded-lg p-3">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs font-mono text-red-400">{status.last_error}</p>
            </div>
          )}

          {/* What is synced */}
          <div className="text-[10px] font-mono text-slate-700 leading-relaxed">
            // SYNCS: profile stats · follower count · video library
            <br />
            // MANUAL ONLY: avg viewers · peak viewers · LIVE gifts · diamonds · fan club joins
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-1.5 text-xs font-mono uppercase px-3 py-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing…" : "Sync Now"}
            </button>
            <button onClick={handleConnect}
              className="flex items-center gap-1.5 text-xs font-mono uppercase px-3 py-2 rounded border border-cyan-900/30 text-slate-500 hover:text-slate-300 transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> Reconnect
            </button>
            <button onClick={handleDisconnect} disabled={disconnecting}
              className="flex items-center gap-1.5 text-xs font-mono uppercase px-3 py-2 rounded bg-red-500/5 border border-red-900/30 text-red-500/60 hover:text-red-400 hover:border-red-500/40 transition-all disabled:opacity-40 ml-auto">
              <Unlink className="w-3.5 h-3.5" />
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>
        </>
      )}

      {error && (
        <p className="text-xs font-mono text-red-400">{error}</p>
      )}
    </div>
  );
}
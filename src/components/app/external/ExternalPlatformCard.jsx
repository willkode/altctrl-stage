import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";

export default function ExternalPlatformCard() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const [newPlatform, setNewPlatform] = useState("twitch");
  const [newHandle, setNewHandle] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [addError, setAddError] = useState(null);

  useEffect(() => {
    loadConnections();
  }, []);

  async function loadConnections() {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const conns = await base44.entities.ExternalPlatformConnection.filter(
        { created_by: user.email },
        "-last_sync_at",
        10
      );
      setConnections(conns);
    } catch (err) {
      console.error("Failed to load connections:", err);
    }
    setLoading(false);
  }

  async function handleSync(conn) {
    setSyncing(conn.id);
    try {
      await base44.functions.invoke("fetchExternalStats", {
        platform: conn.platform,
        handle: conn.handle,
        id: conn.id,
      });
      await loadConnections();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(null);
    }
  }

  async function handleAdd() {
    if (!newHandle.trim()) return;
    setSyncing("new");
    setAddError(null);
    try {
      const result = await base44.functions.invoke("fetchExternalStats", {
        platform: newPlatform,
        handle: newHandle.trim(),
      });
      if (result.data?.success) {
        setNewHandle("");
        setAddingNew(false);
        setAddError(null);
        await loadConnections();
      } else {
        setAddError(result.data?.error || "Failed to sync platform stats");
      }
    } catch (err) {
      console.error("Add failed:", err);
      setAddError(err.message || "Error syncing platform");
    } finally {
      setSyncing(null);
    }
  }

  async function handleDelete(conn) {
    if (!confirm(`Disconnect ${conn.platform}?`)) return;
    await base44.entities.ExternalPlatformConnection.delete(conn.id);
    await loadConnections();
  }

  if (loading) {
    return <div className="text-xs font-mono text-slate-600">Loading connections...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {connections.map((conn) => (
          <div
            key={conn.id}
            className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-4 flex items-start justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase px-2 py-1 rounded bg-cyan-500/10 border border-cyan-900/30 text-cyan-400">
                  {conn.platform}
                </span>
                {conn.verified && (
                  <span className="text-[9px] text-green-400">✓ Verified</span>
                )}
              </div>
              <p className="text-sm font-bold text-white">{conn.handle}</p>
              {conn.profile_title && (
                <p className="text-[11px] text-slate-600">{conn.profile_title}</p>
              )}
              <div className="flex gap-4 mt-2 text-[10px] font-mono text-slate-600">
                {conn.followers !== undefined && (
                  <span>Followers: <span className="text-cyan-400">{conn.followers.toLocaleString()}</span></span>
                )}
                {conn.status && (
                  <span>
                    Status:{" "}
                    <span className={conn.status === "online" ? "text-green-400" : "text-slate-500"}>
                      {conn.status}
                    </span>
                  </span>
                )}
              </div>
              {conn.last_sync_at && (
                <p className="text-[9px] font-mono text-slate-700 mt-2">
                  Last sync: {new Date(conn.last_sync_at).toLocaleDateString()}
                </p>
              )}
              {conn.last_error && (
                <div className="flex items-start gap-2 mt-2 bg-red-500/10 border border-red-900/20 rounded px-3 py-2">
                  <AlertCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-mono text-red-400">{conn.last_error}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleSync(conn)}
                disabled={syncing === conn.id}
                className="p-2 rounded border border-cyan-900/30 text-slate-500 hover:text-cyan-400 transition-all disabled:opacity-40"
                title="Sync now"
              >
                {syncing === conn.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleDelete(conn)}
                className="p-2 rounded border border-cyan-900/30 text-slate-500 hover:text-red-400 transition-all"
                title="Disconnect"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {addingNew ? (
        <div className="bg-[#02040f] border border-cyan-900/20 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              className="bg-[#02040f] border border-cyan-900/20 text-white rounded px-3 py-2 text-xs font-mono"
            >
              <option value="twitch">Twitch</option>
              <option value="youtube">YouTube</option>
            </select>
            <input
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              placeholder="Handle / Username"
              className="bg-[#02040f] border border-cyan-900/20 text-white rounded px-3 py-2 text-xs font-mono placeholder-slate-700"
            />
          </div>
          <div className="space-y-2">
          {addError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-900/20 rounded px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[9px] font-mono text-red-400">{addError}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newHandle.trim() || syncing === "new"}
              className="flex-1 text-[10px] font-mono uppercase px-3 py-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/15 transition-all disabled:opacity-40"
            >
              {syncing === "new" ? "Syncing..." : "Connect & Sync"}
            </button>
            <button
              onClick={() => {
                setAddingNew(false);
                setAddError(null);
              }}
              className="px-4 text-[10px] font-mono uppercase border border-cyan-900/30 text-slate-500 rounded hover:text-white transition-all"
            >
              Cancel
            </button>
          </div>
          </div>
          </div>
          ) : (
        <button
          onClick={() => setAddingNew(true)}
          className="w-full flex items-center justify-center gap-2 text-[10px] font-mono uppercase px-4 py-3 rounded border border-cyan-900/30 text-slate-500 hover:text-cyan-400 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Twitch / YouTube
        </button>
      )}
    </div>
  );
}
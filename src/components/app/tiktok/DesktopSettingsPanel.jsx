import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, Clock, Monitor } from "lucide-react";

export default function DesktopSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [lastSession, setLastSession] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const sessions = await base44.entities.DesktopSession.filter(
      { user_id: user.id },
      "-synced_at",
      1
    );
    setLastSession(sessions[0] || null);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-xs font-mono text-slate-600 py-4 text-center">
        Loading desktop status...
      </div>
    );
  }

  const isConnected = !!lastSession;
  const lastSync = lastSession?.synced_at
    ? new Date(lastSession.synced_at).toLocaleDateString()
    : "never";
  const lastUsed = lastSession?.started_at
    ? new Date(lastSession.started_at).toLocaleDateString()
    : "never";
  const syncStatus = lastSession ? "success" : "unknown";

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-4">
        // Desktop Status
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Connection</div>
          <div className={`flex items-center gap-1.5 ${isConnected ? "text-green-400" : "text-red-400"}`}>
            {isConnected ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span className="font-black text-sm">{isConnected ? "Active" : "Inactive"}</span>
          </div>
        </div>

        <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Last Sync</div>
          <div className="text-xs font-mono text-slate-400">{lastSync}</div>
        </div>

        <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Sync Status</div>
          <div className={`text-xs font-black ${
            syncStatus === "success" ? "text-green-400" : "text-red-400"
          }`}>
            {syncStatus}
          </div>
        </div>

        <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Last Used</div>
          <div className="text-xs font-mono text-slate-400">{lastUsed}</div>
        </div>
      </div>

      {lastSession && (
        <div className="text-[9px] text-slate-600">
          Last session: {lastSession.game || "Unknown game"} ·{" "}
          {lastSession.duration_min ? `${Math.round(lastSession.duration_min)} min` : "duration unknown"} ·{" "}
          Synced {lastSync}
        </div>
      )}

      {!lastSession && (
        <div className="flex items-center gap-2 text-[9px] text-slate-600">
          <Monitor className="w-3.5 h-3.5 text-slate-700" />
          No desktop sessions synced yet. Install the desktop app to get started.
        </div>
      )}
    </div>
  );
}
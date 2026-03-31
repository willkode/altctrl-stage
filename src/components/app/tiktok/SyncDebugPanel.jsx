import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle, CheckCircle2, XCircle, Clock, Info } from "lucide-react";

const STATUS_ICONS = {
  success: CheckCircle2,
  partial_success: Clock,
  failed: XCircle,
};

const STATUS_COLORS = {
  success: "text-green-400 bg-green-500/10 border-green-500/30",
  partial_success: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  failed: "text-red-400 bg-red-500/10 border-red-500/30",
};

const ERROR_CODE_HINTS = {
  INVALID_TOKEN: "Extension token is malformed or invalid. Reconnect your TikTok account.",
  TOKEN_EXPIRED: "Token has expired. Reconnect your TikTok account.",
  TOKEN_REVOKED: "TikTok account was disconnected. Reconnect to sync again.",
  MALFORMED_ROW: "One or more session rows had invalid data (bad date, negative numbers, etc.)",
  VALIDATION_ERROR: "Session data validation failed. Check dates and numeric values.",
  AUTH_FAILED: "Authentication failed. Try logging out and back in.",
  INTERNAL_ERROR: "Server error during sync. Try again or contact support.",
};

export default function SyncDebugPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadSyncLogs();
  }, []);

  async function loadSyncLogs() {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const syncLogs = await base44.entities.ImportSyncLog.filter(
        { created_by: user.email },
        "-sync_timestamp",
        20
      );
      setLogs(syncLogs);
    } catch (error) {
      console.error("Failed to load sync logs:", error);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-xs font-mono text-slate-600">
        Loading sync history...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-[#02040f] border border-cyan-900/20 rounded p-4">
        <div className="text-xs font-mono text-slate-600">
          No sync history yet. Sync with Chrome extension to see logs here.
        </div>
      </div>
    );
  }

  const recentSync = logs[0];
  const last7Days = logs.slice(0, 7);
  const successCount = logs.filter(l => l.status === "success").length;
  const failureCount = logs.filter(l => l.status === "failed").length;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">
          // Extension Sync Health
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-[#02040f] border border-cyan-900/20 rounded p-2.5">
            <div className="text-[9px] font-mono text-slate-600">Last 7 Days</div>
            <div className="text-lg font-black text-cyan-400">{last7Days.length}</div>
          </div>
          <div className="bg-[#02040f] border border-green-900/20 rounded p-2.5">
            <div className="text-[9px] font-mono text-slate-600">Success</div>
            <div className="text-lg font-black text-green-400">{successCount}</div>
          </div>
          <div className="bg-[#02040f] border border-red-900/20 rounded p-2.5">
            <div className="text-[9px] font-mono text-slate-600">Failed</div>
            <div className="text-lg font-black text-red-400">{failureCount}</div>
          </div>
          <div className="bg-[#02040f] border border-slate-700/30 rounded p-2.5">
            <div className="text-[9px] font-mono text-slate-600">Success Rate</div>
            <div className="text-lg font-black text-white">
              {last7Days.length > 0
                ? Math.round((successCount / last7Days.length) * 100)
                : 0}
              %
            </div>
          </div>
        </div>

        {/* Most Recent Sync Status */}
        {recentSync && (
          <div className={`rounded border p-3 ${STATUS_COLORS[recentSync.status]}`}>
            <div className="flex items-start gap-2">
              {(() => {
                const Icon = STATUS_ICONS[recentSync.status];
                return Icon ? <Icon className="w-4 h-4 shrink-0 mt-0.5" /> : null;
              })()}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs font-black uppercase">
                  Last sync: {new Date(recentSync.sync_timestamp).toLocaleDateString()} at{" "}
                  {new Date(recentSync.sync_timestamp).toLocaleTimeString()}
                </div>
                <div className="text-[10px] mt-1">
                  {recentSync.sessions_created} created · {recentSync.sessions_updated} updated ·{" "}
                  {recentSync.sessions_skipped} skipped
                  {recentSync.sessions_failed > 0 ? ` · ${recentSync.sessions_failed} failed` : ""}
                </div>
                {recentSync.error_code && (
                  <div className="text-[10px] mt-1 opacity-90">
                    {ERROR_CODE_HINTS[recentSync.error_code] || recentSync.error_message}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sync History Timeline */}
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">
          // Recent Syncs
        </div>
        <div className="space-y-2">
          {logs.slice(0, 10).map(log => (
            <div
              key={log.id}
              className="bg-[#02040f] border border-cyan-900/20 rounded p-3 cursor-pointer hover:border-cyan-500/40 transition-all"
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
            >
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${STATUS_COLORS[log.status].split(" ")[0]} ${STATUS_COLORS[log.status].split(" ")[1]}`}>
                    {log.status.replace("_", " ")}
                  </span>
                  <span className="text-[9px] font-mono text-slate-600 truncate">
                    {new Date(log.sync_timestamp).toLocaleDateString()} {new Date(log.sync_timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-500 shrink-0">
                  {log.sessions_created + log.sessions_updated} imported
                </span>
              </div>

              {/* Expanded Details */}
              {expandedId === log.id && (
                <div className="mt-3 pt-3 border-t border-cyan-900/20 space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-[9px]">
                    <div>
                      <span className="text-slate-600">Created:</span> {log.sessions_created}
                    </div>
                    <div>
                      <span className="text-slate-600">Updated:</span> {log.sessions_updated}
                    </div>
                    <div>
                      <span className="text-slate-600">Skipped:</span> {log.sessions_skipped}
                    </div>
                  </div>
                  {log.sessions_manual_review > 0 && (
                    <div className="text-[9px] text-yellow-400">
                      ⚠ {log.sessions_manual_review} flagged for manual review
                    </div>
                  )}
                  {log.sessions_failed > 0 && (
                    <div className="text-[9px] text-red-400">
                      ✕ {log.sessions_failed} failed validation
                    </div>
                  )}
                  {log.error_code && (
                    <div className="text-[9px] bg-red-500/10 border border-red-500/30 text-red-400 rounded p-2 mt-2">
                      <span className="font-mono font-black">{log.error_code}</span>:{" "}
                      {ERROR_CODE_HINTS[log.error_code] || log.error_message}
                    </div>
                  )}
                  {log.token_issue && (
                    <div className="text-[9px] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded p-2">
                      🔑 Token issue detected: {log.token_issue}
                    </div>
                  )}
                  {log.notes && (
                    <div className="text-[9px] text-slate-500 italic">{log.notes}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Context Help */}
      <div className="bg-[#02040f] border border-cyan-900/20 rounded p-4">
        <div className="flex gap-2 items-start">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] font-mono uppercase text-cyan-400 mb-1.5">
              Common Sync Issues
            </div>
            <ul className="text-[9px] space-y-1.5 text-slate-500">
              <li>
                <span className="text-cyan-400">Duplicates skipped:</span> Session already logged. Check Analytics.
              </li>
              <li>
                <span className="text-yellow-400">Manual review:</span> Conflicting data detected. Review in Analytics.
              </li>
              <li>
                <span className="text-red-400">Invalid token:</span> Reconnect TikTok in Settings.
              </li>
              <li>
                <span className="text-red-400">Validation error:</span> Session had bad data (date, numbers). Fix in extension.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
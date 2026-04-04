import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_CONFIG = {
  success: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", label: "Success" },
  partial_success: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", label: "Partial" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "Failed" },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function SyncEntry({ log, profiles }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.failed;
  const Icon = cfg.icon;
  const profile = profiles[log.created_by];

  return (
    <div className={`border ${cfg.border} rounded-lg overflow-hidden transition-all`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors`}
      >
        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground truncate">
              {profile?.display_name || log.created_by || "Unknown"}
            </span>
            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              {log.source || "extension"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono text-muted-foreground">
            <span>{timeAgo(log.sync_timestamp)}</span>
            <span>+{log.sessions_created || 0} created</span>
            <span>~{log.sessions_updated || 0} updated</span>
            <span>={log.sessions_skipped || 0} skipped</span>
            {(log.sessions_failed || 0) > 0 && (
              <span className="text-red-400">✗{log.sessions_failed} failed</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-2 text-xs font-mono">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Detail label="Submitted" value={log.sessions_submitted} />
            <Detail label="Created" value={log.sessions_created} accent="green" />
            <Detail label="Updated" value={log.sessions_updated} accent="cyan" />
            <Detail label="Failed" value={log.sessions_failed} accent="red" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Detail label="Skipped" value={log.sessions_skipped} />
            <Detail label="Manual Review" value={log.sessions_manual_review} accent="yellow" />
            <Detail label="Profile Updated" value={log.profile_updated ? "Yes" : "No"} />
          </div>

          {log.error_code && (
            <div className="bg-red-500/5 border border-red-500/20 rounded p-3 space-y-1">
              <div className="text-red-400 font-bold text-[10px] uppercase">Error: {log.error_code}</div>
              {log.error_message && <div className="text-red-300/80 break-all">{log.error_message}</div>}
            </div>
          )}

          {log.token_issue && (
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded p-3">
              <span className="text-yellow-400 font-bold text-[10px] uppercase">Token Issue: </span>
              <span className="text-yellow-300/80">{log.token_issue}</span>
              {log.retry_needed && <span className="text-yellow-400 ml-2">(retry recommended)</span>}
            </div>
          )}

          {log.failure_reasons && log.failure_reasons !== "{}" && (
            <div className="bg-muted rounded p-3">
              <div className="text-muted-foreground text-[10px] uppercase mb-1">Failure Details</div>
              <pre className="text-foreground/70 whitespace-pre-wrap break-all text-[10px]">
                {(() => {
                  try { return JSON.stringify(JSON.parse(log.failure_reasons), null, 2); }
                  catch { return log.failure_reasons; }
                })()}
              </pre>
            </div>
          )}

          {log.failed_indices && (
            <div className="text-muted-foreground">
              <span className="text-[10px] uppercase">Failed Indices: </span>{log.failed_indices}
            </div>
          )}

          {log.session_ids_created && (
            <div className="text-muted-foreground">
              <span className="text-[10px] uppercase">Created IDs: </span>
              <span className="break-all">{log.session_ids_created}</span>
            </div>
          )}

          <div className="text-muted-foreground/60 text-[10px]">
            Timestamp: {new Date(log.sync_timestamp).toLocaleString()} · Log ID: {log.id}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, accent }) {
  const colorMap = { green: "text-green-400", cyan: "text-cyan-400", red: "text-red-400", yellow: "text-yellow-400" };
  return (
    <div className="bg-muted/50 rounded px-3 py-2">
      <div className="text-[9px] uppercase text-muted-foreground">{label}</div>
      <div className={`text-sm font-bold ${accent ? colorMap[accent] : "text-foreground"}`}>{value ?? "—"}</div>
    </div>
  );
}

export default function LiveSyncFeed({ profiles = {} }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  async function fetchLogs() {
    const data = await base44.entities.ImportSyncLog.list("-sync_timestamp", 50);
    setLogs(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, 10000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh]);

  const successCount = logs.filter(l => l.status === "success").length;
  const failCount = logs.filter(l => l.status === "failed").length;
  const partialCount = logs.filter(l => l.status === "partial_success").length;

  return (
    <div className="space-y-4">
      {/* Feed header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${autoRefresh ? "text-green-400 animate-pulse" : "text-muted-foreground"}`} />
          <h2 className="text-lg font-black uppercase">Live Sync Feed</h2>
          {autoRefresh && <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30">Live</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(a => !a)}
            className={`text-[10px] font-mono uppercase px-3 py-1.5 rounded border transition-all ${
              autoRefresh
                ? "border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </button>
          <button
            onClick={() => { setLoading(true); fetchLogs(); }}
            className="p-1.5 rounded border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg px-4 py-2.5 text-center">
          <div className="text-lg font-black text-green-400">{successCount}</div>
          <div className="text-[9px] font-mono uppercase text-green-400/60">Success</div>
        </div>
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg px-4 py-2.5 text-center">
          <div className="text-lg font-black text-yellow-400">{partialCount}</div>
          <div className="text-[9px] font-mono uppercase text-yellow-400/60">Partial</div>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-2.5 text-center">
          <div className="text-lg font-black text-red-400">{failCount}</div>
          <div className="text-[9px] font-mono uppercase text-red-400/60">Failed</div>
        </div>
      </div>

      {/* Feed entries */}
      {loading && logs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading sync feed...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg">
          <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No sync activity yet.</p>
          <p className="text-xs text-muted-foreground/60 font-mono mt-1">Events will appear here when extensions send data.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <SyncEntry key={log.id} log={log} profiles={profiles} />
          ))}
        </div>
      )}
    </div>
  );
}
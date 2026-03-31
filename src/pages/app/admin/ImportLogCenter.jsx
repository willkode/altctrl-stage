import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../../../components/app/admin/AdminLayout";
import { ChevronRight } from "lucide-react";

export default function ImportLogCenter() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [filter, setFilter] = useState({ status: "all", source: "all", search: "" });
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [allLogs, allProfiles] = await Promise.all([
        base44.asServiceRole.entities.ImportSyncLog.list("-sync_timestamp", 200),
        base44.asServiceRole.entities.CreatorProfile.list("-created_date", 500),
      ]);
      setLogs(allLogs);
      const profileMap = {};
      allProfiles.forEach(p => {
        profileMap[p.created_by] = p;
      });
      setProfiles(profileMap);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setLoading(false);
  }

  const filtered = logs.filter(log => {
    if (filter.status !== "all" && log.status !== filter.status) return false;
    if (filter.source !== "all" && log.source !== filter.source) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const profile = profiles[log.created_by];
      return (
        (profile?.display_name || "").toLowerCase().includes(searchLower) ||
        log.created_by.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading import logs...</p>
        </div>
      </AdminLayout>
    );
  }

  if (selectedLog) {
    return <ImportLogDetail log={selectedLog} onBack={() => setSelectedLog(null)} />;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black uppercase mb-2">Import Logs</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Review all extension sync attempts and bulk import results.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-xs">
            <input
              type="text"
              placeholder="Search by creator name or email..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              className="w-full px-4 py-2 rounded border border-border bg-card text-foreground placeholder-muted-foreground text-sm font-mono"
            />
          </div>
          <select
            value={filter.status}
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="px-4 py-2 rounded border border-border bg-card text-foreground text-sm font-mono"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="partial_success">Partial</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filter.source}
            onChange={e => setFilter(f => ({ ...f, source: e.target.value }))}
            className="px-4 py-2 rounded border border-border bg-card text-foreground text-sm font-mono"
          >
            <option value="all">All Sources</option>
            <option value="extension">Extension</option>
            <option value="extension_bulk">Bulk Import</option>
          </select>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.map(log => {
            const profile = profiles[log.created_by];
            const statusColor =
              log.status === "success"
                ? "bg-green-500/10 text-green-400"
                : log.status === "partial_success"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400";

            return (
              <button
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="w-full bg-card border border-border rounded-lg p-4 hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[9px] font-mono uppercase px-2 py-1 rounded ${statusColor}`}>
                        {log.status}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {log.source === "extension" ? "Extension" : "Bulk"}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(log.sync_timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-black text-foreground mb-1">{profile?.display_name || log.created_by}</p>
                    <p className="text-xs text-muted-foreground font-mono mb-2">{log.created_by}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: {log.sessions_created}</span>
                      <span>Updated: {log.sessions_updated}</span>
                      <span>Skipped: {log.sessions_skipped}</span>
                      <span>Failed: {log.sessions_failed}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
            No import logs found matching your filters.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ImportLogDetail({ log, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profiles = await base44.asServiceRole.entities.CreatorProfile.filter({
        created_by: log.created_by,
      });
      setProfile(profiles[0] || null);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
    setLoading(false);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="text-sm font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          ← Back to Logs
        </button>

        <div>
          <h1 className="text-2xl font-black uppercase mb-2">Import Log Detail</h1>
          <p className="text-sm text-muted-foreground font-mono">
            {profile?.display_name || log.created_by} · {log.source}
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Submitted", value: log.sessions_submitted },
            { label: "Created", value: log.sessions_created },
            { label: "Updated", value: log.sessions_updated },
            { label: "Skipped", value: log.sessions_skipped },
            { label: "Failed", value: log.sessions_failed },
            { label: "Manual Review", value: log.sessions_manual_review },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded p-3">
              <p className="text-[9px] font-mono uppercase text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Error details */}
        {log.error_code && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-5">
            <h2 className="font-black uppercase text-sm text-red-400 mb-2">Error Details</h2>
            <div className="text-sm text-red-400">
              <code className="font-mono">{log.error_code}</code>
              <p className="text-xs mt-1">{log.error_message}</p>
            </div>
          </div>
        )}

        {/* Failure reasons */}
        {log.failure_reasons && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="font-black uppercase text-sm mb-3">Failure Reasons</h2>
            <pre className="text-[9px] font-mono text-muted-foreground overflow-x-auto p-3 bg-muted rounded">
              {typeof log.failure_reasons === "string"
                ? log.failure_reasons
                : JSON.stringify(JSON.parse(log.failure_reasons || "{}"), null, 2)}
            </pre>
          </div>
        )}

        {/* Raw metadata */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-black uppercase text-sm mb-3">Metadata</h2>
          <div className="space-y-2 text-xs text-muted-foreground font-mono">
            <div>
              <span className="text-slate-600">Timestamp:</span> {log.sync_timestamp}
            </div>
            <div>
              <span className="text-slate-600">Source:</span> {log.source}
            </div>
            <div>
              <span className="text-slate-600">Status:</span> {log.status}
            </div>
            {log.profile_updated && <div className="text-green-400">Profile updated</div>}
            {log.retry_needed && <div className="text-yellow-400">Retry recommended</div>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
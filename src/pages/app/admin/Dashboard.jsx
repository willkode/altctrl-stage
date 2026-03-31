import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../../../components/app/admin/AdminLayout";
import { Activity, AlertTriangle, CheckCircle2, Zap } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExtensions: 0,
    activeExtensions: 0,
    revokedExtensions: 0,
    syncsLast24h: 0,
    failedSyncsLast24h: 0,
    partialSyncsLast24h: 0,
    sessionsCreatedToday: 0,
    sessionsSkippedToday: 0,
    sessionsManualReview: 0,
    topErrors: [],
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split("T")[0];
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      const [allTokens, allSyncLogs, allSessions] = await Promise.all([
        base44.asServiceRole.entities.ExtensionToken.list("-generated_at", 1000),
        base44.asServiceRole.entities.ImportSyncLog.list("-sync_timestamp", 1000),
        base44.asServiceRole.entities.LiveSession.list("-stream_date", 1000),
      ]);

      const active = allTokens.filter(t => t.status === "active");
      const revoked = allTokens.filter(t => t.status === "revoked");
      const syncsLast24h = allSyncLogs.filter(s => new Date(s.sync_timestamp) > new Date(yesterday));
      const failed = syncsLast24h.filter(s => s.status === "failed");
      const partial = syncsLast24h.filter(s => s.status === "partial_success");
      const todaySession = allSessions.filter(s => s.stream_date === today);
      const manualReview = allSessions.filter(s => s.manual_review_status === "pending");
      const skipped = syncsLast24h.reduce((sum, s) => sum + (s.sessions_skipped || 0), 0);

      // Count error patterns
      const errorCodes = {};
      syncsLast24h.forEach(s => {
        if (s.error_code) {
          errorCodes[s.error_code] = (errorCodes[s.error_code] || 0) + 1;
        }
      });
      const topErrors = Object.entries(errorCodes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([code, count]) => ({ code, count }));

      setStats({
        totalExtensions: allTokens.length,
        activeExtensions: active.length,
        revokedExtensions: revoked.length,
        syncsLast24h: syncsLast24h.length,
        failedSyncsLast24h: failed.length,
        partialSyncsLast24h: partial.length,
        sessionsCreatedToday: todaySession.length,
        sessionsSkippedToday: skipped,
        sessionsManualReview: manualReview.length,
        topErrors,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading system health...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black uppercase mb-2">System Health</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Real-time overview of extension integrations, sync activity, and import health.
          </p>
        </div>

        {/* Extension stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Zap}
            label="Total Extensions"
            value={stats.totalExtensions}
            detail={`${stats.activeExtensions} active · ${stats.revokedExtensions} revoked`}
            accent="cyan"
          />
          <StatCard
            icon={Activity}
            label="Syncs (24h)"
            value={stats.syncsLast24h}
            detail={`${stats.failedSyncsLast24h} failed · ${stats.partialSyncsLast24h} partial`}
            accent="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Sessions Today"
            value={stats.sessionsCreatedToday}
            detail={`${stats.sessionsSkippedToday} skipped (duplicates)`}
            accent="green"
          />
        </div>

        {/* Manual review & errors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h2 className="font-black uppercase text-sm">Manual Review Queue</h2>
            </div>
            <div className="text-3xl font-black text-foreground mb-1">
              {stats.sessionsManualReview}
            </div>
            <p className="text-xs text-muted-foreground">sessions flagged for review</p>
            <a
              href="/app/admin/review"
              className="mt-4 inline-flex text-xs font-mono uppercase text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              → View Queue
            </a>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="font-black uppercase text-sm">Top Errors (24h)</h2>
            </div>
            <div className="space-y-2">
              {stats.topErrors.length > 0 ? (
                stats.topErrors.map((err, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
                    <code className="text-xs text-slate-400">{err.code}</code>
                    <span className="text-sm font-black text-muted-foreground">{err.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No errors in the last 24 hours</p>
              )}
            </div>
            <a
              href="/app/admin/errors"
              className="mt-4 inline-flex text-xs font-mono uppercase text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              → View Error Center
            </a>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-black uppercase text-sm mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a
              href="/app/admin/extensions"
              className="px-4 py-2 rounded border border-border hover:bg-muted text-center text-xs font-mono uppercase transition-colors"
            >
              Browse Extensions
            </a>
            <a
              href="/app/admin/imports"
              className="px-4 py-2 rounded border border-border hover:bg-muted text-center text-xs font-mono uppercase transition-colors"
            >
              Import Logs
            </a>
            <a
              href="/app/admin/sessions"
              className="px-4 py-2 rounded border border-border hover:bg-muted text-center text-xs font-mono uppercase transition-colors"
            >
              Inspect Sessions
            </a>
            <a
              href="/app/admin/support"
              className="px-4 py-2 rounded border border-border hover:bg-muted text-center text-xs font-mono uppercase transition-colors"
            >
              Creator Support
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, detail, accent = "cyan" }) {
  const colors = {
    cyan: "border-cyan-900/30",
    blue: "border-blue-900/30",
    green: "border-green-900/30",
  };
  return (
    <div className={`bg-card border ${colors[accent]} rounded-lg p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-black text-foreground">{value}</p>
          {detail && <p className="text-xs text-muted-foreground mt-2">{detail}</p>}
        </div>
        <Icon className="w-6 h-6 text-muted-foreground opacity-40" />
      </div>
    </div>
  );
}
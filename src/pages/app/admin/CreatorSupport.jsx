import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../../../components/app/admin/AdminLayout";
import { Search } from "lucide-react";

export default function CreatorSupport() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    try {
      const allProfiles = await base44.asServiceRole.entities.CreatorProfile.list("-created_date", 200);
      setProfiles(allProfiles);
    } catch (error) {
      console.error("Failed to load profiles:", error);
    }
    setLoading(false);
  }

  const filtered = profiles.filter(p =>
    p.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.created_by?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading creators...</p>
        </div>
      </AdminLayout>
    );
  }

  if (selectedProfile) {
    return <CreatorDetail profile={selectedProfile} onBack={() => setSelectedProfile(null)} />;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black uppercase mb-2">Creator Support</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Quickly troubleshoot individual creator accounts and extension issues.
          </p>
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search creators by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded border border-border bg-card text-foreground placeholder-muted-foreground text-sm font-mono"
          />
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.map(profile => (
            <button
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className="w-full bg-card border border-border rounded-lg p-4 hover:bg-muted transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-foreground">{profile.display_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{profile.created_by}</p>
                  {profile.primary_game && (
                    <p className="text-xs text-muted-foreground mt-1">{profile.primary_game}</p>
                  )}
                </div>
                <span className="text-sm font-mono text-cyan-400">→</span>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
            No creators found matching your search.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function CreatorDetail({ profile, onBack }) {
  const [data, setData] = useState({
    token: null,
    recentLogs: [],
    recentSessions: [],
    manualReview: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [tokens, logs, sessions, manualReview] = await Promise.all([
        base44.asServiceRole.entities.ExtensionToken.filter(
          { created_by: profile.created_by, status: "active" },
          "-generated_at",
          1
        ),
        base44.asServiceRole.entities.ImportSyncLog.filter(
          { created_by: profile.created_by },
          "-sync_timestamp",
          5
        ),
        base44.asServiceRole.entities.LiveSession.filter(
          { created_by: profile.created_by },
          "-stream_date",
          5
        ),
        base44.asServiceRole.entities.LiveSession.filter(
          { created_by: profile.created_by, manual_review_status: "pending" },
          "-stream_date",
          10
        ),
      ]);
      setData({
        token: tokens[0] || null,
        recentLogs: logs,
        recentSessions: sessions,
        manualReview: manualReview,
      });
    } catch (error) {
      console.error("Failed to load creator data:", error);
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
          ← Back to Creators
        </button>

        <div>
          <h1 className="text-2xl font-black uppercase mb-2">{profile.display_name}</h1>
          <p className="text-sm text-muted-foreground font-mono">{profile.created_by}</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Extension Status */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="font-black uppercase text-sm mb-3">Extension Status</h2>
              {data.token ? (
                <div className="space-y-2 text-sm font-mono text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="text-foreground">{new Date(data.token.generated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Syncs:</span>
                    <span className="text-foreground">{data.token.total_syncs}</span>
                  </div>
                  {data.token.last_used_at && (
                    <div className="flex justify-between">
                      <span>Last Used:</span>
                      <span className="text-foreground">{new Date(data.token.last_used_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active extension token</p>
              )}
            </div>

            {/* Recent Syncs */}
            {data.recentLogs.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-5">
                <h2 className="font-black uppercase text-sm mb-3">Recent Syncs</h2>
                <div className="space-y-2">
                  {data.recentLogs.map(log => (
                    <div
                      key={log.id}
                      className={`p-2 rounded text-xs font-mono ${
                        log.status === "success" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>{new Date(log.sync_timestamp).toLocaleDateString()}</span>
                        <span className={log.status === "success" ? "text-green-400" : "text-red-400"}>
                          {log.status}
                        </span>
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-1">
                        Created: {log.sessions_created} · Updated: {log.sessions_updated} · Failed: {log.sessions_failed}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Review */}
            {data.manualReview.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-5">
                <h2 className="font-black uppercase text-sm text-yellow-400 mb-3">
                  {data.manualReview.length} Sessions Pending Review
                </h2>
                <div className="space-y-1 text-[9px] font-mono text-muted-foreground">
                  {data.manualReview.map(s => (
                    <div key={s.id}>
                      {s.stream_date} · {s.game} · {s.stream_type}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            {data.recentSessions.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-5">
                <h2 className="font-black uppercase text-sm mb-3">Recent Sessions</h2>
                <div className="space-y-1 text-[9px] font-mono text-muted-foreground">
                  {data.recentSessions.map(s => (
                    <div key={s.id} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                      <span>{s.stream_date} · {s.game}</span>
                      <span className="text-slate-400">{s.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
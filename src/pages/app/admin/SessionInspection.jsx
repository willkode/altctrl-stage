import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../../../components/app/admin/AdminLayout";
import { Search } from "lucide-react";

export default function SessionInspection() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [filter, setFilter] = useState({ source: "all", search: "" });
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [allSessions, allProfiles] = await Promise.all([
        base44.asServiceRole.entities.LiveSession.list("-stream_date", 300),
        base44.asServiceRole.entities.CreatorProfile.list("-created_date", 500),
      ]);
      setSessions(allSessions);
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

  const filtered = sessions.filter(s => {
    if (filter.source !== "all" && s.source !== filter.source) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const profile = profiles[s.created_by];
      return (
        (profile?.display_name || "").toLowerCase().includes(searchLower) ||
        s.created_by.toLowerCase().includes(searchLower) ||
        s.game.toLowerCase().includes(searchLower) ||
        (s.external_session_key || "").toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading sessions...</p>
        </div>
      </AdminLayout>
    );
  }

  if (selectedSession) {
    return <SessionDetail session={selectedSession} profile={profiles[selectedSession.created_by]} onBack={() => setSelectedSession(null)} />;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black uppercase mb-2">Session Inspection</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Inspect imported LiveSession records and data provenance.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-xs">
            <input
              type="text"
              placeholder="Search by creator, game, or session key..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              className="w-full px-4 py-2 rounded border border-border bg-card text-foreground placeholder-muted-foreground text-sm font-mono"
            />
          </div>
          <select
            value={filter.source}
            onChange={e => setFilter(f => ({ ...f, source: e.target.value }))}
            className="px-4 py-2 rounded border border-border bg-card text-foreground text-sm font-mono"
          >
            <option value="all">All Sources</option>
            <option value="manual">Manual</option>
            <option value="extension_import">Extension</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Creator</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Game</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Imported</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(session => {
                  const profile = profiles[session.created_by];
                  return (
                    <tr key={session.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-black text-foreground">
                        {profile?.display_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{session.stream_date}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{session.game}</td>
                      <td className="px-4 py-3">
                        <span className="text-[9px] font-mono uppercase px-2 py-1 rounded bg-slate-500/10 text-slate-400">
                          {session.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {session.import_created_at ? new Date(session.import_created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No sessions found matching your filters.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function SessionDetail({ session, profile, onBack }) {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="text-sm font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          ← Back to Sessions
        </button>

        <div>
          <h1 className="text-2xl font-black uppercase mb-2">Session Detail</h1>
          <p className="text-sm text-muted-foreground font-mono">
            {profile?.display_name || session.created_by} · {session.stream_date}
          </p>
        </div>

        {/* Session data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="font-black uppercase text-sm mb-4">Stream Details</h2>
            <div className="space-y-2 text-sm font-mono text-muted-foreground">
              <div className="flex justify-between"><span>Date:</span> <span className="text-foreground">{session.stream_date}</span></div>
              <div className="flex justify-between"><span>Game:</span> <span className="text-foreground">{session.game}</span></div>
              <div className="flex justify-between"><span>Type:</span> <span className="text-foreground">{session.stream_type}</span></div>
              <div className="flex justify-between"><span>Avg Viewers:</span> <span className="text-foreground">{session.avg_viewers || "—"}</span></div>
              <div className="flex justify-between"><span>Peak Viewers:</span> <span className="text-foreground">{session.peak_viewers || "—"}</span></div>
              <div className="flex justify-between"><span>Followers Gained:</span> <span className="text-foreground">{session.followers_gained || "—"}</span></div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="font-black uppercase text-sm mb-4">Import Provenance</h2>
            <div className="space-y-2 text-sm font-mono text-muted-foreground">
              <div className="flex justify-between"><span>Source:</span> <span className="text-foreground">{session.source}</span></div>
              <div className="flex justify-between"><span>Was Auto:</span> <span className="text-foreground">{session.was_auto_imported ? "Yes" : "No"}</span></div>
              <div className="flex justify-between"><span>Confidence:</span> <span className="text-foreground">{session.source_confidence}</span></div>
              {session.external_session_key && (
                <div className="flex justify-between">
                  <span>Ext Key:</span>
                  <span className="text-slate-400 truncate">{session.external_session_key}</span>
                </div>
              )}
              {session.import_created_at && (
                <div className="flex justify-between">
                  <span>Imported:</span>
                  <span className="text-foreground">{new Date(session.import_created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Raw payload */}
        {session.raw_import_payload && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="font-black uppercase text-sm mb-3">Raw Import Payload</h2>
            <pre className="text-[9px] font-mono text-muted-foreground overflow-x-auto p-3 bg-muted rounded max-h-80">
              {JSON.stringify(JSON.parse(session.raw_import_payload), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
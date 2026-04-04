import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../../../components/app/admin/AdminLayout";
import LiveSyncFeed from "../../../components/app/admin/LiveSyncFeed";
import { Search, Eye, Trash2, RotateCw } from "lucide-react";

export default function ExtensionIntegrations() {
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [filter, setFilter] = useState({ status: "all", search: "" });
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [allTokens, allProfiles] = await Promise.all([
        base44.asServiceRole.entities.ExtensionToken.list("-generated_at", 500),
        base44.asServiceRole.entities.CreatorProfile.list("-created_date", 500),
      ]);
      setTokens(allTokens);
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

  async function handleRevoke(tokenId, creatorEmail) {
    if (!confirm("Revoke this token? The creator's extension will no longer be able to sync.")) return;
    setRevoking(tokenId);
    try {
      await base44.asServiceRole.entities.ExtensionToken.update(tokenId, {
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoke_reason: "admin_revoked",
      });
      await loadData();
    } catch (error) {
      console.error("Failed to revoke token:", error);
    }
    setRevoking(null);
  }

  const filtered = tokens.filter(t => {
    if (filter.status !== "all" && t.status !== filter.status) return false;
    if (filter.search) {
      const profile = profiles[t.created_by];
      const searchLower = filter.search.toLowerCase();
      return (
        (profile?.display_name || "").toLowerCase().includes(searchLower) ||
        t.created_by.toLowerCase().includes(searchLower) ||
        t.id.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading extensions...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black uppercase mb-2">Extension Integrations</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Monitor creator extension tokens, connection health, and sync activity.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-xs">
            <input
              type="text"
              placeholder="Search by creator name, email, or token ID..."
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
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Creator</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Last Used</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Syncs</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(token => {
                  const profile = profiles[token.created_by];
                  return (
                    <tr key={token.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-black text-foreground">
                        {profile?.display_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {token.created_by}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-1 rounded ${
                            token.status === "active"
                              ? "bg-green-500/10 text-green-400"
                              : token.status === "revoked"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-slate-500/10 text-slate-400"
                          }`}
                        >
                          {token.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(token.generated_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {token.total_syncs} ({token.total_sessions_imported} sessions)
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          className="p-1 rounded border border-border hover:bg-muted transition-colors text-slate-400"
                          title="Inspect"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {token.status === "active" && (
                          <button
                            onClick={() => handleRevoke(token.id, token.created_by)}
                            disabled={revoking === token.id}
                            className="p-1 rounded border border-red-900/30 hover:bg-red-500/10 transition-colors text-red-400 disabled:opacity-40"
                            title="Revoke"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No integrations found matching your filters.
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          Showing {filtered.length} of {tokens.length} extensions
        </p>

        {/* Live Sync Feed */}
        <LiveSyncFeed profiles={profiles} />
      </div>
    </AdminLayout>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../../../components/app/admin/AdminLayout";
import { Check, X } from "lucide-react";

export default function ManualReviewQueue() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [allSessions, allProfiles] = await Promise.all([
        base44.asServiceRole.entities.LiveSession.filter(
          { manual_review_status: "pending" },
          "-stream_date",
          200
        ),
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

  async function handleResolve(sessionId, action) {
    setUpdating(sessionId);
    try {
      const newStatus = action === "approve" ? "approved" : "rejected";
      await base44.asServiceRole.entities.LiveSession.update(sessionId, {
        manual_review_status: newStatus,
      });
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error("Failed to resolve:", error);
    }
    setUpdating(null);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading review queue...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black uppercase mb-2">Manual Review Queue</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Sessions flagged for conflict resolution and manual verification.
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 text-center">
            <div className="text-green-400 font-black uppercase text-sm mb-2">Queue Empty</div>
            <p className="text-sm text-green-400/60">No sessions need manual review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => {
              const profile = profiles[session.created_by];
              const isConflict = session.source === "extension_import" && session.was_auto_imported;

              return (
                <div key={session.id} className="bg-card border border-yellow-900/30 rounded-lg p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="text-sm font-black uppercase text-foreground mb-1">
                        {profile?.display_name || session.created_by}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mb-2">{session.created_by}</div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {session.stream_date} · {session.game} · {session.stream_type}
                        </span>
                        {isConflict && (
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                            Potential Conflict
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Session details */}
                  <div className="bg-muted/50 rounded p-3 mb-4 text-xs font-mono text-muted-foreground space-y-1">
                    <div>Avg Viewers: {session.avg_viewers || "—"}</div>
                    <div>Peak Viewers: {session.peak_viewers || "—"}</div>
                    <div>
                      External Key: <code className="text-slate-400">{session.external_session_key}</code>
                    </div>
                    {session.raw_import_reference && (
                      <div>
                        Raw Reference: <code className="text-slate-400">{session.raw_import_reference}</code>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(session.id, "approve")}
                      disabled={updating === session.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-40 text-xs font-mono uppercase transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleResolve(session.id, "reject")}
                      disabled={updating === session.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-40 text-xs font-mono uppercase transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../../../components/app/admin/AdminLayout";
import { Users as UsersIcon, Mail, Loader2 } from "lucide-react";

export default function Users() {
  const [view, setView] = useState("signups"); // signups | newsletter
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [view]);

  async function loadData() {
    setLoading(true);
    if (view === "signups") {
      const allUsers = await base44.entities.User.list("-created_date", 500);
      setUsers(allUsers);
    } else {
      const entries = await base44.entities.WaitlistEntry.list("-created_date", 500);
      setUsers(entries);
    }
    setLoading(false);
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black uppercase">Users</h1>
          <p className="text-sm text-muted-foreground font-mono">Manage app users and newsletter subscribers.</p>
        </div>

        {/* Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setView("signups")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-mono uppercase transition-all ${
              view === "signups"
                ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                : "bg-[#02040f] border border-cyan-900/20 text-slate-500 hover:text-cyan-400"
            }`}
          >
            <UsersIcon className="w-4 h-4" /> App Users ({users.length})
          </button>
          <button
            onClick={() => setView("newsletter")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-mono uppercase transition-all ${
              view === "newsletter"
                ? "bg-pink-500/10 border border-pink-500/30 text-pink-400"
                : "bg-[#02040f] border border-cyan-900/20 text-slate-500 hover:text-pink-400"
            }`}
          >
            <Mail className="w-4 h-4" /> Newsletter ({users.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-sm">
            No {view === "signups" ? "users" : "newsletter subscribers"} yet.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#030609] text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                  {view === "signups" ? (
                    <>
                      <th className="text-left py-3.5 px-4">Name</th>
                      <th className="text-left py-3.5 px-4">Email</th>
                      <th className="text-left py-3.5 px-4">Role</th>
                      <th className="text-left py-3.5 px-4">Joined</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left py-3.5 px-4">Name</th>
                      <th className="text-left py-3.5 px-4">Email</th>
                      <th className="text-left py-3.5 px-4">TikTok Handle</th>
                      <th className="text-left py-3.5 px-4">Status</th>
                      <th className="text-left py-3.5 px-4">Signed Up</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                      idx % 2 === 0 ? "bg-[#020408]" : ""
                    }`}
                  >
                    {view === "signups" ? (
                      <>
                        <td className="py-3 px-4 font-bold text-white">{user.full_name}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                            {user.role || "user"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">
                          {user.created_date ? new Date(user.created_date).toLocaleDateString() : "—"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 font-bold text-white">{user.name || "—"}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">{user.email}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{user.tiktok_handle || "—"}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            user.status === "approved"
                              ? "bg-green-500/10 border border-green-500/20 text-green-400"
                              : user.status === "rejected"
                              ? "bg-red-500/10 border border-red-500/20 text-red-400"
                              : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                          }`}>
                            {user.status || "pending"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">
                          {user.created_date ? new Date(user.created_date).toLocaleDateString() : "—"}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
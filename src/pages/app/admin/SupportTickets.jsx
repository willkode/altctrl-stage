import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../../../components/app/admin/AdminLayout";
import TicketDetail from "../../../components/app/admin/TicketDetail";
import { Search, Inbox, Clock, CheckCircle2, XCircle } from "lucide-react";

const STATUS_STYLES = {
  open: { color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Open" },
  in_progress: { color: "text-cyan-400", bg: "bg-cyan-500/10", label: "In Progress" },
  resolved: { color: "text-green-400", bg: "bg-green-500/10", label: "Resolved" },
  closed: { color: "text-slate-500", bg: "bg-slate-500/10", label: "Closed" },
};

const CATEGORY_LABELS = {
  bug: "Bug", feature_request: "Feature", account_issue: "Account",
  extension_issue: "Extension", billing: "Billing", other: "Other",
};

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => { loadTickets(); }, []);

  async function loadTickets() {
    setLoading(true);
    const all = await base44.entities.SupportTicket.list("-created_date", 200);
    setTickets(all);
    setLoading(false);
  }

  const filtered = tickets.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search && !t.subject?.toLowerCase().includes(search.toLowerCase()) &&
        !t.creator_name?.toLowerCase().includes(search.toLowerCase()) &&
        !t.creator_email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    open: tickets.filter(t => t.status === "open").length,
    in_progress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
  };

  if (selectedTicket) {
    return (
      <TicketDetail
        ticket={selectedTicket}
        onBack={() => { setSelectedTicket(null); loadTickets(); }}
      />
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black uppercase mb-2">Support Tickets</h1>
          <p className="text-sm text-muted-foreground font-mono">Manage creator support requests and respond to tickets.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-yellow-500/10 border border-yellow-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-black text-yellow-400">{counts.open}</div>
            <div className="text-[10px] font-mono uppercase text-slate-500">Open</div>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-black text-cyan-400">{counts.in_progress}</div>
            <div className="text-[10px] font-mono uppercase text-slate-500">In Progress</div>
          </div>
          <div className="bg-green-500/10 border border-green-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-black text-green-400">{counts.resolved}</div>
            <div className="text-[10px] font-mono uppercase text-slate-500">Resolved</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded border border-border bg-card text-foreground placeholder-muted-foreground text-sm font-mono" />
          <div className="flex gap-1.5">
            {["all", "open", "in_progress", "resolved", "closed"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded text-[10px] font-mono uppercase border transition-all ${
                  statusFilter === s ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "border-border text-muted-foreground hover:text-foreground"
                }`}>
                {s === "all" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket list */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No tickets found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(ticket => {
              const style = STATUS_STYLES[ticket.status] || STATUS_STYLES.open;
              const msgs = (() => { try { return JSON.parse(ticket.messages || "[]"); } catch { return []; } })();
              const lastMsg = msgs[msgs.length - 1];
              const lastIsAdmin = lastMsg?.role === "admin";
              return (
                <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                  className="w-full bg-card border border-border rounded-lg p-4 hover:bg-muted transition-colors text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${style.bg} ${style.color}`}>{style.label}</span>
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
                        {!lastIsAdmin && msgs.length > 1 && (
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-pink-500/10 text-pink-400">Awaiting Reply</span>
                        )}
                      </div>
                      <p className="font-black text-foreground truncate">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {ticket.creator_name || ticket.creator_email} · {new Date(ticket.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground shrink-0">
                      {msgs.length} msg{msgs.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
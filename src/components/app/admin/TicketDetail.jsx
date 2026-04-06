import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "./AdminLayout";
import { ArrowLeft, Send, Loader2, User, ShieldAlert } from "lucide-react";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

export default function TicketDetail({ ticket, onBack }) {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const bottomRef = useRef(null);

  useEffect(() => {
    try { setMessages(JSON.parse(ticket.messages || "[]")); } catch { setMessages([]); }
  }, [ticket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendReply() {
    if (!reply.trim()) return;
    setSending(true);
    const admin = await base44.auth.me();
    const newMsg = {
      role: "admin",
      content: reply.trim(),
      author: admin.full_name || "Admin",
      author_email: admin.email,
      timestamp: new Date().toISOString(),
    };
    const updated = [...messages, newMsg];
    await base44.entities.SupportTicket.update(ticket.id, {
      messages: JSON.stringify(updated),
      status: status === "open" ? "in_progress" : status,
    });
    setMessages(updated);
    setReply("");
    if (status === "open") setStatus("in_progress");
    setSending(false);
  }

  async function handleStatusChange(newStatus) {
    setStatus(newStatus);
    await base44.entities.SupportTicket.update(ticket.id, { status: newStatus });
  }

  async function handlePriorityChange(newPriority) {
    setPriority(newPriority);
    await base44.entities.SupportTicket.update(ticket.id, { priority: newPriority });
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <button onClick={onBack} className="text-sm font-mono text-cyan-400 hover:text-cyan-300 transition-colors">
          ← Back to Tickets
        </button>

        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-black uppercase text-foreground">{ticket.subject}</h1>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                From: {ticket.creator_name} ({ticket.creator_email}) · {new Date(ticket.created_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <select value={priority} onChange={e => handlePriorityChange(e.target.value)}
                className="px-2 py-1 rounded border border-border bg-card text-foreground text-xs font-mono">
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
              <select value={status} onChange={e => handleStatusChange(e.target.value)}
                className="px-2 py-1 rounded border border-border bg-card text-foreground text-xs font-mono">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-2">
            Category: <span className="text-foreground">{ticket.category?.replace("_", " ")}</span>
          </p>
        </div>

        {/* Messages thread */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-4 max-h-[50vh] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
          ) : (
            messages.map((msg, i) => {
              const isAdmin = msg.role === "admin";
              return (
                <div key={i} className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isAdmin ? "bg-red-500/10 text-red-400" : "bg-cyan-500/10 text-cyan-400"
                  }`}>
                    {isAdmin ? <ShieldAlert className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`flex-1 max-w-[80%] ${isAdmin ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-xl px-4 py-3 text-sm ${
                      isAdmin ? "bg-red-500/10 border border-red-900/20 text-foreground" : "bg-muted border border-border text-foreground"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground mt-1">
                      {msg.author} · {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply box */}
        <div className="bg-card border border-border rounded-lg p-4">
          <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
            placeholder="Type your reply..."
            onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleSendReply(); }}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none resize-none font-mono" />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[9px] font-mono text-muted-foreground">⌘+Enter to send</span>
            <button onClick={handleSendReply} disabled={!reply.trim() || sending}
              className="flex items-center gap-2 px-4 py-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase hover:bg-cyan-500/20 transition-all disabled:opacity-40">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Loader2, CheckCircle2, ArrowLeft, Plus, User, ShieldAlert, MessageSquare } from "lucide-react";

const CATEGORIES = [
  { value: "bug", label: "Bug Report" },
  { value: "account_issue", label: "Account Issue" },
  { value: "extension_issue", label: "Extension / Desktop Issue" },
  { value: "feature_request", label: "Feature Request" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Other" },
];

const STATUS_STYLES = {
  open: "text-yellow-400 bg-yellow-500/10",
  in_progress: "text-cyan-400 bg-cyan-500/10",
  resolved: "text-green-400 bg-green-500/10",
  closed: "text-slate-500 bg-slate-500/10",
};

const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-3 py-2.5 text-sm outline-none transition-all font-mono";

export default function SupportTicketModal({ open, onClose }) {
  const [view, setView] = useState("list"); // list | new | detail
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form, setForm] = useState({ subject: "", category: "other", description: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) { loadTickets(); setView("list"); }
  }, [open]);

  if (!open) return null;

  async function loadTickets() {
    setLoading(true);
    const user = await base44.auth.me();
    const t = await base44.entities.SupportTicket.filter({ creator_email: user.email }, "-created_date", 50);
    setTickets(t);
    setLoading(false);
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setSending(true);
    const user = await base44.auth.me();
    let creatorName = user.full_name || user.email;
    try {
      const profiles = await base44.entities.CreatorProfile.filter({ created_by: user.email }, "-created_date", 1);
      if (profiles[0]?.display_name) creatorName = profiles[0].display_name;
    } catch {}

    const firstMessage = { role: "user", content: form.description, author: creatorName, author_email: user.email, timestamp: new Date().toISOString() };
    await base44.entities.SupportTicket.create({
      subject: form.subject.trim(), category: form.category, description: form.description.trim(),
      status: "open", priority: "medium", creator_email: user.email, creator_name: creatorName,
      messages: JSON.stringify([firstMessage]),
    });
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ subject: "", category: "other", description: "" }); loadTickets(); setView("list"); }, 1500);
  }

  async function handleReply() {
    if (!reply.trim() || !selectedTicket) return;
    setSendingReply(true);
    const user = await base44.auth.me();
    let msgs = [];
    try { msgs = JSON.parse(selectedTicket.messages || "[]"); } catch {}
    const newMsg = { role: "user", content: reply.trim(), author: selectedTicket.creator_name || user.email, author_email: user.email, timestamp: new Date().toISOString() };
    const updated = [...msgs, newMsg];
    await base44.entities.SupportTicket.update(selectedTicket.id, { messages: JSON.stringify(updated) });
    setSelectedTicket({ ...selectedTicket, messages: JSON.stringify(updated) });
    setReply("");
    setSendingReply(false);
    // refresh list in background
    loadTickets();
  }

  function openDetail(ticket) { setSelectedTicket(ticket); setView("detail"); }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#060d1f] border border-cyan-900/40 rounded-xl w-full max-w-lg shadow-2xl shadow-black/60 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-900/20 shrink-0">
          <div className="flex items-center gap-3">
            {view !== "list" && (
              <button onClick={() => setView("list")} className="text-slate-500 hover:text-cyan-400 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">// SUPPORT</div>
              <h2 className="text-base font-black uppercase text-white mt-0.5">
                {view === "new" ? "New Ticket" : view === "detail" ? selectedTicket?.subject : "Support"}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {view === "list" && (
            <div className="p-5 space-y-3">
              <button onClick={() => setView("new")}
                className="w-full flex items-center justify-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3 rounded-lg text-sm hover:bg-cyan-300 transition-all">
                <Plus className="w-4 h-4" /> New Ticket
              </button>
              {loading ? (
                <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-500" /></div>
              ) : tickets.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-slate-600">No tickets yet. Create one if you need help!</div>
              ) : (
                tickets.map(t => {
                  const style = STATUS_STYLES[t.status] || STATUS_STYLES.open;
                  const msgs = (() => { try { return JSON.parse(t.messages || "[]"); } catch { return []; } })();
                  const hasAdminReply = msgs.some(m => m.role === "admin");
                  return (
                    <button key={t.id} onClick={() => openDetail(t)}
                      className="w-full bg-[#02040f] border border-cyan-900/20 rounded-lg p-4 hover:border-cyan-500/30 transition-all text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${style}`}>{t.status?.replace("_", " ")}</span>
                        {hasAdminReply && (
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-pink-500/10 text-pink-400">Reply</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-white truncate">{t.subject}</p>
                      <p className="text-[10px] font-mono text-slate-600 mt-0.5">{new Date(t.created_date).toLocaleDateString()} · {msgs.length} msg{msgs.length !== 1 ? "s" : ""}</p>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {view === "new" && (
            sent ? (
              <div className="p-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-lg font-black text-white">Ticket Submitted!</p>
                <p className="text-xs font-mono text-slate-500 mt-1">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Subject</label>
                  <input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Brief summary of your issue" className={inp} required />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => set("category", e.target.value)} className={inp}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} placeholder="Tell us what's going on..." className={inp + " resize-none"} required />
                </div>
                <button type="submit" disabled={sending || !form.subject.trim() || !form.description.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3 rounded-lg text-sm hover:bg-cyan-300 transition-all disabled:opacity-50">
                  {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Submit Ticket</>}
                </button>
              </form>
            )
          )}

          {view === "detail" && selectedTicket && (
            <TicketConversation ticket={selectedTicket} reply={reply} setReply={setReply}
              sendingReply={sendingReply} onSendReply={handleReply} bottomRef={bottomRef} />
          )}
        </div>
      </div>
    </div>
  );
}

function TicketConversation({ ticket, reply, setReply, sendingReply, onSendReply, bottomRef }) {
  const msgs = (() => { try { return JSON.parse(ticket.messages || "[]"); } catch { return []; } })();
  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-3 flex-1">
        {msgs.map((msg, i) => {
          const isAdmin = msg.role === "admin";
          return (
            <div key={i} className={`flex gap-2.5 ${isAdmin ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                isAdmin ? "bg-red-500/10 text-red-400" : "bg-cyan-500/10 text-cyan-400"
              }`}>
                {isAdmin ? <ShieldAlert className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className={`max-w-[80%] ${isAdmin ? "text-right" : ""}`}>
                <div className={`inline-block rounded-xl px-3.5 py-2.5 text-sm ${
                  isAdmin ? "bg-red-500/10 border border-red-900/20" : "bg-[#02040f] border border-cyan-900/20"
                }`}>
                  <p className="whitespace-pre-wrap text-white">{msg.content}</p>
                </div>
                <p className="text-[9px] font-mono text-slate-700 mt-1">
                  {isAdmin ? "Support" : msg.author} · {new Date(msg.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {!isClosed && (
        <div className="p-4 border-t border-cyan-900/20 shrink-0">
          <div className="flex gap-2">
            <input value={reply} onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSendReply(); } }}
              placeholder="Type a reply..." className={`flex-1 bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none transition-all font-mono`} />
            <button onClick={onSendReply} disabled={!reply.trim() || sendingReply}
              className="px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-40">
              {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {isClosed && (
        <div className="p-4 border-t border-cyan-900/20 text-center">
          <p className="text-xs font-mono text-slate-600">This ticket is {ticket.status}.</p>
        </div>
      )}
    </div>
  );
}
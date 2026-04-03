import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../../../components/app/admin/AdminLayout";
import { Send, Users, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const AUDIENCES = [
  { key: "all", label: "All (Users + Waitlist)", desc: "Every registered user and waitlist signup" },
  { key: "users", label: "Registered Users Only", desc: "Only users with an account" },
  { key: "waitlist", label: "Waitlist Signups Only", desc: "Only waitlist entries (not registered)" },
];

export default function Messaging() {
  const [audience, setAudience] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [counts, setCounts] = useState({ users: 0, waitlist: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [users, waitlist] = await Promise.all([
        base44.entities.User.list("-created_date", 200),
        base44.entities.WaitlistEntry.list("-created_date", 200),
      ]);
      setCounts({ users: users.length, waitlist: waitlist.length });
      setLoading(false);
    }
    load();
  }, []);

  const recipientCount =
    audience === "all" ? counts.users + counts.waitlist :
    audience === "users" ? counts.users : counts.waitlist;

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    if (!confirm(`Send this email to ${recipientCount} recipients?`)) return;

    setSending(true);
    setResult(null);

    let emails = [];

    if (audience === "users" || audience === "all") {
      const users = await base44.entities.User.list("-created_date", 200);
      emails.push(...users.map(u => u.email).filter(Boolean));
    }

    if (audience === "waitlist" || audience === "all") {
      const waitlist = await base44.entities.WaitlistEntry.list("-created_date", 200);
      emails.push(...waitlist.map(w => w.email).filter(Boolean));
    }

    // Deduplicate
    const unique = [...new Set(emails.map(e => e.toLowerCase()))];

    const res = await base44.functions.invoke('sendEmail', {
      to: unique,
      subject,
      body,
      from_name: 'AltCtrl',
    });

    const { sent = 0, failed = 0 } = res.data;

    setSending(false);
    setResult({ sent, failed, total: unique.length });
  }

  const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-3 py-2.5 text-sm outline-none transition-all font-mono";

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// ADMIN — MESSAGING</div>
          <h1 className="text-2xl font-black uppercase text-white">Send Message</h1>
          <p className="text-sm text-slate-500 font-mono mt-1">Email all users, waitlist signups, or both.</p>
        </div>

        {/* Audience picker */}
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5 mb-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-3">// SELECT AUDIENCE</div>
          <div className="grid sm:grid-cols-3 gap-2">
            {AUDIENCES.map(a => (
              <button
                key={a.key}
                onClick={() => setAudience(a.key)}
                className={`text-left px-4 py-3 rounded-lg border transition-all ${
                  audience === a.key
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                    : "border-cyan-900/30 bg-[#02040f] text-slate-500 hover:text-slate-300"
                }`}
              >
                <div className="text-xs font-black uppercase mb-0.5">{a.label}</div>
                <div className="text-[10px] font-mono text-slate-600">{a.desc}</div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-xs font-mono text-slate-500">
              {loading ? "Loading..." : `${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}`}
              {!loading && audience === "all" && ` (${counts.users} users + ${counts.waitlist} waitlist)`}
            </span>
          </div>
        </div>

        {/* Compose */}
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5 mb-4 space-y-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600">// COMPOSE EMAIL</div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. AltCtrl Beta Update — What's Coming Next"
              className={inp}
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Body (HTML supported)</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message here..."
              rows={10}
              className={inp + " resize-y"}
            />
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`border rounded-lg p-4 mb-4 flex items-start gap-3 ${
            result.failed === 0 ? "border-green-500/30 bg-green-500/5" : "border-yellow-400/30 bg-yellow-400/5"
          }`}>
            {result.failed === 0 ? (
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs font-mono">
              <span className="text-white font-bold">{result.sent} of {result.total}</span>
              <span className="text-slate-500"> emails sent successfully.</span>
              {result.failed > 0 && (
                <span className="text-red-400 block mt-1">{result.failed} failed to send.</span>
              )}
            </div>
          </div>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={sending || !subject.trim() || !body.trim()}
          className="w-full flex items-center justify-center gap-2 font-black uppercase tracking-widest py-4 rounded text-sm transition-all disabled:opacity-40 bg-cyan-400 text-[#02040f] hover:bg-cyan-300"
        >
          {sending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
          ) : (
            <><Send className="w-4 h-4" /> Send to {recipientCount} Recipients</>
          )}
        </button>
      </div>
    </AdminLayout>
  );
}
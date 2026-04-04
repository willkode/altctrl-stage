import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader } from "./MarketOpportunity";
import { Send, Loader2, Check, Mail, Building2, User, MessageSquare } from "lucide-react";

const inp = "w-full bg-[#02040f] border border-cyan-900/30 focus:border-cyan-500/30 text-white placeholder-slate-700 rounded-lg px-4 py-3.5 text-sm outline-none transition-all font-mono";

export default function InvestorContact() {
  const [form, setForm] = useState({ name: "", email: "", firm: "", type: "investor", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setError(null);

    await base44.integrations.Core.SendEmail({
      to: "admin@altctrl.live",
      from_name: "ALT CTRL Investor Page",
      subject: `[${form.type.toUpperCase()}] Inquiry from ${form.name}${form.firm ? ` (${form.firm})` : ""}`,
      body: `
Name: ${form.name}
Email: ${form.email}
Firm: ${form.firm || "N/A"}
Type: ${form.type}

Message:
${form.message}

---
Sent from ALT CTRL Investor Page
      `.trim(),
    }).catch(err => {
      setError("Failed to send. Please try again or email us directly.");
    });

    // Also save to waitlist for tracking
    await base44.entities.WaitlistEntry.create({
      email: form.email,
      name: form.name,
      source: "investor_page",
      admin_notes: `Type: ${form.type}. Firm: ${form.firm || "N/A"}. Message: ${form.message}`,
    }).catch(() => {});

    setSending(false);
    if (!error) setSent(true);
  };

  return (
    <section className="py-20 px-4 border-t border-cyan-900/20" id="contact">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 bg-cyan-500/5 border border-cyan-500/20 px-2 py-0.5 rounded">J</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white mb-2">Get in Touch</h2>
          <p className="text-sm font-mono text-slate-500">Investor inquiries, partnership opportunities, or press requests.</p>
        </div>

        {sent ? (
          <div className="bg-[#060d1f]/80 border border-green-500/30 rounded-xl p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-black uppercase text-white mb-2">Message Sent</h3>
            <p className="text-sm font-mono text-slate-500">We'll get back to you within 24-48 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-6 md:p-8 space-y-5">
            {/* Type selector */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-600 block mb-2">I am a...</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "investor", label: "Investor" },
                  { value: "partner", label: "Potential Partner" },
                  { value: "press", label: "Press / Media" },
                  { value: "other", label: "Other" },
                ].map(t => (
                  <button key={t.value} type="button" onClick={() => set("type", t.value)}
                    className={`text-[10px] font-mono uppercase px-4 py-2.5 rounded-lg border transition-all ${
                      form.type === t.value
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        : "border-cyan-900/20 text-slate-600 hover:text-slate-300"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-600 block mb-1.5">
                  <User className="w-3 h-3 inline mr-1" />Name *
                </label>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" required className={inp} />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-600 block mb-1.5">
                  <Mail className="w-3 h-3 inline mr-1" />Email *
                </label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@firm.com" required className={inp} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-600 block mb-1.5">
                <Building2 className="w-3 h-3 inline mr-1" />Firm / Organization
              </label>
              <input value={form.firm} onChange={e => set("firm", e.target.value)} placeholder="Optional" className={inp} />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-600 block mb-1.5">
                <MessageSquare className="w-3 h-3 inline mr-1" />Message *
              </label>
              <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={4} placeholder="What would you like to discuss?" required className={inp + " resize-none"} />
            </div>

            {error && (
              <p className="text-xs font-mono text-red-400">{error}</p>
            )}

            <button type="submit" disabled={sending || !form.name || !form.email || !form.message}
              className="w-full flex items-center justify-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-4 rounded-lg text-sm hover:bg-cyan-300 transition-all disabled:opacity-50">
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
            </button>

            <p className="text-center text-[10px] font-mono text-slate-700">
              Or email directly: <a href="mailto:investors@altctrl.live" className="text-cyan-400 hover:text-cyan-300">investors@altctrl.live</a>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
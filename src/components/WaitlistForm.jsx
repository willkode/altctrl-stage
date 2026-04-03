import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function WaitlistForm({ source = "waitlist", founding = false, className = "" }) {
  const [form, setForm] = useState({ name: "", email: "", tiktok_handle: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.WaitlistEntry.create({
      ...form,
      source,
      founding_creator: founding,
    });
    if (founding && form.email) {
      base44.functions.invoke('sendWaitlistWelcome', { email: form.email, name: form.name }).catch(() => {});
    }
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-2">// SIGNAL RECEIVED</div>
        <div className="text-white text-2xl font-black uppercase">YOU'RE IN THE QUEUE</div>
        <div className="text-slate-400 mt-2 text-sm">We'll transmit when your access is ready.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
            className="w-full bg-[#02040f] border border-cyan-900 focus:border-cyan-400 text-white placeholder-slate-600 rounded px-4 py-3 text-sm outline-none transition-all focus:shadow-[0_0_10px_rgba(0,245,255,0.2)]"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">TikTok Handle</label>
          <input
            type="text"
            value={form.tiktok_handle}
            onChange={e => setForm(f => ({ ...f, tiktok_handle: e.target.value }))}
            placeholder="@yourhandle"
            className="w-full bg-[#02040f] border border-cyan-900 focus:border-cyan-400 text-white placeholder-slate-600 rounded px-4 py-3 text-sm outline-none transition-all focus:shadow-[0_0_10px_rgba(0,245,255,0.2)]"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="your@email.com"
          className="w-full bg-[#02040f] border border-cyan-900 focus:border-cyan-400 text-white placeholder-slate-600 rounded px-4 py-3 text-sm outline-none transition-all focus:shadow-[0_0_10px_rgba(0,245,255,0.2)]"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-4 rounded text-sm hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] transition-all duration-200 disabled:opacity-50"
      >
        {loading ? "TRANSMITTING..." : founding ? "CLAIM FOUNDING CREATOR SPOT" : "JOIN THE WAITLIST"}
      </button>
      <p className="text-xs text-slate-600 text-center font-mono">No spam. No noise. Pure signal.</p>
    </form>
  );
}
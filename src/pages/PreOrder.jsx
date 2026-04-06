import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Loader2, CheckCircle2, Clock, Zap } from "lucide-react";
import GlitchText from "../components/GlitchText";

const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-4 py-3.5 text-sm outline-none transition-all font-mono";

export default function PreOrder() {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get("success") === "true";
  const canceled = urlParams.get("canceled") === "true";

  const [form, setForm] = useState({ name: "", email: "", tiktok_handle: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    setError(null);

    const res = await base44.functions.invoke("preorderCheckout", {
      name: form.name.trim(),
      email: form.email.trim(),
      tiktok_handle: form.tiktok_handle.trim(),
    });

    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      setError(res.data?.error || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6" style={{ boxShadow: "0 0 40px rgba(34,197,94,0.2)" }}>
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <GlitchText text="THANK YOU." className="text-5xl font-black uppercase text-white block mb-3" tag="h1" />
            <p className="text-2xl font-black uppercase text-cyan-400" style={{ textShadow: "0 0 20px rgba(0,245,255,0.4)" }}>You're locked in.</p>
          </div>

          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-6 mb-8 text-left space-y-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">Your rate: $15/mo — forever</p>
                <p className="text-xs text-slate-500 font-mono">This price is locked in and will never increase for you.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">We launch April 10th</p>
                <p className="text-xs text-slate-500 font-mono">When we go live, you'll receive an email with your official invite to join and set up your account.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">Nothing to do until then</p>
                <p className="text-xs text-slate-500 font-mono">Sit tight — we'll handle the rest. You're officially part of the first wave.</p>
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-xs font-mono mb-6">Check your inbox for a payment confirmation from Stripe.</p>

          <a href="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 border border-pink-500/40 bg-[#020408]/70 rounded px-4 py-2 mb-6">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-pink-400">Pre-Order — Launches April 10th</span>
          </div>
          <GlitchText text="PRE-ORDER NOW" className="text-4xl font-black uppercase text-white block mb-3" tag="h1" />
          <p className="text-slate-400 text-sm mb-1">Lock in <span className="font-black text-cyan-400">$15/mo</span> forever.</p>
          <p className="text-xs text-slate-600 font-mono">Price goes to $25/mo after April 10th.</p>
        </div>

        {canceled && (
          <div className="mb-5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-400">Payment was canceled. You can try again below.</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" className={inp} required />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" className={inp} required />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">TikTok Handle <span className="text-slate-700">(optional)</span></label>
            <input value={form.tiktok_handle} onChange={e => set("tiktok_handle", e.target.value)} placeholder="@yourhandle" className={inp} />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-900/30 rounded-lg p-3">
              <p className="text-xs font-mono text-red-400">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading || !form.name.trim() || !form.email.trim()}
            className="w-full flex items-center justify-center gap-2 font-black uppercase tracking-widest py-4 rounded text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Zap className="w-4 h-4" /> Pre-Order — $15/mo</>}
          </button>

          <p className="text-[10px] font-mono text-slate-700 text-center">You'll be taken to Stripe to complete payment. Cancel anytime.</p>
        </form>

        {/* Benefits */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {["AI Coaching", "Stream Strategy", "Promo Generator", "Full Analytics"].map(f => (
            <div key={f} className="bg-[#060d1f]/60 border border-cyan-900/15 rounded-lg px-3 py-2.5 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-500">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
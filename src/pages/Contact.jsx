import { useState } from "react";
import GlitchText from "../components/GlitchText";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// OPEN CHANNEL</div>
          <GlitchText text="CONTACT" className="text-5xl sm:text-6xl font-black uppercase text-white block" tag="h1" />
          <p className="text-slate-400 mt-4">Got a question, partnership idea, or creator collab? Transmit below.</p>
        </div>

        {sent ? (
          <div className="text-center bg-[#060d1f] border border-cyan-500/40 rounded-lg p-12">
            <div className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-2">// SIGNAL RECEIVED</div>
            <div className="text-white text-2xl font-black uppercase mb-2">MESSAGE TRANSMITTED</div>
            <p className="text-slate-400 text-sm">We'll respond within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8 space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">Name</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#02040f] border border-cyan-900 focus:border-cyan-400 text-white placeholder-slate-600 rounded px-4 py-3 text-sm outline-none transition-all focus:shadow-[0_0_10px_rgba(0,245,255,0.2)]" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-[#02040f] border border-cyan-900 focus:border-cyan-400 text-white placeholder-slate-600 rounded px-4 py-3 text-sm outline-none transition-all focus:shadow-[0_0_10px_rgba(0,245,255,0.2)]" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">Message</label>
              <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full bg-[#02040f] border border-cyan-900 focus:border-cyan-400 text-white placeholder-slate-600 rounded px-4 py-3 text-sm outline-none transition-all focus:shadow-[0_0_10px_rgba(0,245,255,0.2)] resize-none" placeholder="What's on your mind..." />
            </div>
            <button type="submit" className="w-full bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-4 rounded text-sm hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] transition-all">
              TRANSMIT MESSAGE
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-slate-600">// OR REACH US AT <span className="text-cyan-700">hello@altctrl.gg</span></p>
        </div>
      </div>
    </div>
  );
}
import GlitchText from "../components/GlitchText";

export default function Terms() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// LEGAL — TERMS OF SERVICE</div>
          <GlitchText text="TERMS OF SERVICE" className="text-4xl sm:text-5xl font-black uppercase text-white block" tag="h1" />
          <p className="text-slate-500 font-mono text-xs mt-2">Last updated: March 2026</p>
        </div>
        <div className="space-y-6 text-slate-400">
          {[
            { title: "ACCEPTANCE", body: "By using AltCtrl, you agree to these terms. If you don't agree, don't use the platform." },
            { title: "USE OF SERVICE", body: "AltCtrl is provided for personal creator use. You may not resell, redistribute, or use AltCtrl to build competing products." },
            { title: "ACCOUNT RESPONSIBILITY", body: "You are responsible for maintaining your account security. Keep your login credentials private. Notify us immediately of any unauthorized access." },
            { title: "CONTENT", body: "Content you create using AltCtrl (promo copy, plans, etc.) belongs to you. We may use anonymized, aggregated usage data to improve the product." },
            { title: "FOUNDING CREATOR PRICING", body: "Founding Creator pricing is locked for active, continuous subscribers. Cancelling and resubscribing later will apply current pricing at the time of resubscription." },
            { title: "TERMINATION", body: "We may suspend or terminate accounts that violate these terms or engage in abuse of the platform. We will give notice where possible." },
            { title: "DISCLAIMERS", body: "AltCtrl is provided 'as is'. We don't guarantee specific growth outcomes. Our tools provide structure and insights — results depend on your execution." },
            { title: "CONTACT", body: "For legal questions: legal@altctrl.gg" },
          ].map((s, i) => (
            <div key={i} className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// {s.title}</div>
              <p className="text-slate-300 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
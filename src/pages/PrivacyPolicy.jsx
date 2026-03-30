import GlitchText from "../components/GlitchText";

export default function PrivacyPolicy() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// LEGAL — DATA PROTOCOL</div>
          <GlitchText text="PRIVACY POLICY" className="text-4xl sm:text-5xl font-black uppercase text-white block" tag="h1" />
          <p className="text-slate-500 font-mono text-xs mt-2">Last updated: March 2026</p>
        </div>
        <div className="space-y-8 text-slate-400 leading-relaxed">
          {[
            { title: "WHAT WE COLLECT", body: "We collect information you provide directly — your name, email, TikTok handle, and stream performance data you log. We also collect standard usage data like pages visited and features used, to improve the product." },
            { title: "HOW WE USE IT", body: "Your data powers AltCtrl's coaching and analytics features. We use email to communicate product updates, feature announcements, and account information. We do not sell your data. We do not share it with third parties for advertising." },
            { title: "DATA STORAGE", body: "Data is stored securely using industry-standard encryption. We use trusted infrastructure providers with strong data protection practices." },
            { title: "YOUR RIGHTS", body: "You can request access to, correction of, or deletion of your personal data at any time by contacting us at privacy@altctrl.gg. We'll respond within 30 days." },
            { title: "COOKIES", body: "We use minimal cookies — primarily for authentication and product analytics. We don't use third-party tracking cookies." },
            { title: "CHANGES TO THIS POLICY", body: "If we make material changes to this policy, we'll notify users by email and update the date above. Continued use after changes constitutes acceptance." },
            { title: "CONTACT", body: "For privacy questions: privacy@altctrl.gg" },
          ].map((s, i) => (
            <div key={i} className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// {s.title}</div>
              <p className="text-slate-300 text-sm">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
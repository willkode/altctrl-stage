import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Shield, FileText, Clock, AlertCircle } from "lucide-react";
import GlitchText from "../components/GlitchText";

export default function TikTokAppealHelper() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, #0a1628 0%, #020408 100%)" }}>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-cyan-500/40 bg-[#020408]/70 rounded px-4 py-2 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">// FREE TOOL</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-tight mb-6 text-white">
            Get Help Writing a Better<br />
            <span style={{ color: "#00f5ff", textShadow: "0 0 30px rgba(0,245,255,0.6)" }}>TikTok Appeal</span>
          </h1>

          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-4 leading-relaxed font-semibold">
            TikTok Appeal Helper helps you organize your case, collect the right details, and generate a clear appeal after a ban, restriction, removal, or other account action.
          </p>

          <p className="text-slate-400 text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            No false promises. No shady tactics. Just a cleaner way to prepare your appeal and understand what to do next.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a href="https://appeal.altctrl.us" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all active:scale-95" style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}>
              Start Free <ArrowRight className="w-4 h-4" />
            </a>
            <a href="https://appeal.altctrl.us" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm border transition-all" style={{ borderColor: "rgba(255,0,128,0.6)", color: "#ff0080", background: "rgba(255,0,128,0.05)" }}>
              Create a Case
            </a>
          </div>

          <p className="text-xs font-mono text-slate-500">Not affiliated with TikTok. No guarantee of reinstatement.</p>
        </div>
      </section>

      {/* Quick Value */}
      <section className="py-24 px-4 bg-[#020408]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">// WHAT IT DOES</div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-6">What TikTok Appeal Helper Does</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            When TikTok takes action on your account, it is easy to panic. Most people do not know what to save, what to say, or what not to do.
          </p>
          <p className="text-slate-300 mb-8 leading-relaxed font-semibold">
            TikTok Appeal Helper gives you a simple process to:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Identify what happened",
              "Save the important details",
              "Collect your evidence",
              "Generate a better appeal draft",
              "Track your case from start to finish",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-4">Getting hit with a TikTok action is stressful</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Whether your account was banned, your video was removed, your LIVE access was restricted, or your account stopped getting recommended, the next step is usually the same: <span className="text-white font-semibold">You need to respond clearly, calmly, and with the right information.</span>
          </p>

          <p className="text-slate-300 mb-6 font-semibold">Most users:</p>
          <ul className="space-y-2 mb-8">
            {[
              "Rush the appeal",
              "Leave out important facts",
              "Forget to save screenshots",
              "Get emotional in their response",
              "Do not know how to track what they submitted",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-400">
                <span className="text-red-500 font-bold mt-1">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-slate-300 text-lg font-semibold text-cyan-400">That is where TikTok Appeal Helper comes in.</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-[#020408]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { num: "1", title: "Start a Case", desc: "Choose what happened to your TikTok account, content, or LIVE access." },
              { num: "2", title: "Add the Details", desc: "Paste the notice, describe what happened, and upload screenshots or supporting evidence." },
              { num: "3", title: "Generate Your Appeal", desc: "Get a clean draft you can review, edit, and use when submitting your appeal." },
              { num: "4", title: "Track Your Case", desc: "Save your progress, keep your records organized, and track what happens next." },
            ].map((step, i) => (
              <div key={i} className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-6">
                <div className="text-4xl font-black text-cyan-400 mb-3">{step.num}</div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a href="https://appeal.altctrl.us" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all" style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}>
              Start Your Case <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Supported Cases */}
      <section className="py-24 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-4">Built for the most common TikTok actions</h2>
          <p className="text-slate-400 mb-8">TikTok Appeal Helper can help you prepare for cases like:</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "Account bans",
              "Video removals",
              "LIVE restrictions",
              "Recommendation issues",
              "Feature restrictions",
              "Age-related actions",
              "Copyright claims",
              "Other account actions",
            ].map((item, i) => (
              <div key={i} className="bg-[#060d1f] border border-cyan-900/30 rounded-lg px-4 py-3 text-sm font-mono text-slate-400">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-[#020408]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-4">Everything you need to prepare a stronger appeal</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: FileText, title: "Case Builder", desc: "Walk through your case step by step so nothing important gets missed." },
              { icon: Shield, title: "Evidence Organizer", desc: "Keep screenshots, notes, links, and supporting details in one place." },
              { icon: FileText, title: "Appeal Draft Generator", desc: "Create a clear, respectful appeal based on the facts you provide." },
              { icon: Clock, title: "Case Tracking", desc: "Track your appeal status, follow-ups, and final outcome over time." },
              { icon: CheckCircle2, title: "Readiness Checks", desc: "See what details are missing before you submit your appeal." },
              { icon: AlertCircle, title: "Submission Guidance", desc: "Get helpful reminders on what to include, what to avoid, and what to save." },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-6">
                  <Icon className="w-6 h-6 text-cyan-400 mb-4" />
                  <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-24 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-6 text-center">Built to help, not mislead</h2>
          <p className="text-slate-400 text-center mb-8 leading-relaxed">
            TikTok Appeal Helper is designed to help users prepare better appeals. It does not help users fake evidence, evade bans, or game the system.
          </p>

          <p className="text-slate-300 text-center font-semibold mb-8">We believe appeals should be:</p>
          <div className="grid sm:grid-cols-4 gap-4 mb-12">
            {["Truthful", "Organized", "Respectful", "Based on real evidence"].map((item, i) => (
              <div key={i} className="text-center">
                <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <h3 className="font-black text-red-400 uppercase mb-4">⚠️ Important</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {[
                "Do not delete flagged content while your appeal is under review.",
                "Do not submit fake evidence.",
                "Do not spam repeated appeals.",
                "Do not create alternate accounts to get around restrictions.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Who It Is For */}
      <section className="py-24 px-4 bg-[#020408]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-8 text-center">Who This Is For</h2>

          <div className="mb-8">
            <p className="text-slate-300 font-semibold mb-4">TikTok Appeal Helper is for:</p>
            <ul className="space-y-2 mb-8">
              {[
                "Creators who got banned or restricted",
                "TikTok LIVE creators dealing with enforcement",
                "Users who want help writing a better appeal",
                "Anyone who wants a calmer, more organized process",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-slate-300 leading-relaxed">
            Whether you are a small creator or growing fast, this tool helps you slow down, gather your facts, and submit something stronger.
          </p>
        </div>
      </section>

      {/* Why Use It */}
      <section className="py-24 px-4" style={{ backgroundColor: "#050b18" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-6">Why Creators Use TikTok Appeal Helper</h2>
          <p className="text-slate-300 text-lg font-semibold mb-8">Because most people do not need more panic.<br />They need structure.</p>
          <p className="text-slate-400 mb-8">They need a place to:</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              "Understand the action taken",
              "Keep their case details organized",
              "Build a better appeal",
              "Avoid common mistakes",
              "Stay on top of the process",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-[#020408]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-12 text-center">FAQ</h2>

          <div className="space-y-6">
            {[
              { q: "Does this guarantee my TikTok account will be restored?", a: "No. TikTok Appeal Helper does not control TikTok's decisions and cannot guarantee any result. It helps you prepare a better appeal and keep your case organized." },
              { q: "Is this affiliated with TikTok?", a: "No. TikTok Appeal Helper is an independent tool and is not affiliated with TikTok." },
              { q: "Can this help with more than account bans?", a: "Yes. It can also help with removed videos, LIVE restrictions, recommendation issues, feature restrictions, age-related actions, copyright claims, and other account actions." },
              { q: "Will it write the appeal for me?", a: "Yes, it helps generate a draft based on the details you provide. You should always review and edit the final appeal before submitting it." },
              { q: "Can I use it for free?", a: "Yes. The goal is to give users a simple free way to prepare and manage their TikTok appeal." },
            ].map((item, i) => (
              <div key={i} className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-6">
                <h3 className="font-bold text-white mb-3">{item.q}</h3>
                <p className="text-slate-400 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,0,128,0.15) 0%, rgba(20,10,60,0.8) 40%, rgba(0,40,100,0.8) 100%)", backgroundColor: "#05070f" }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-4">Prepare Your TikTok Appeal the Smart Way</h2>
          <p className="text-slate-300 mb-8">Get organized, collect your evidence, and create a better appeal without the chaos.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a href="https://appeal.altctrl.us" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm transition-all" style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}>
              Start Free <ArrowRight className="w-4 h-4" />
            </a>
            <a href="https://appeal.altctrl.us" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest px-8 py-4 rounded text-sm border transition-all" style={{ borderColor: "rgba(255,0,128,0.6)", color: "#ff0080", background: "rgba(255,0,128,0.05)" }}>
              Create a Case
            </a>
          </div>

          <p className="text-sm font-mono text-slate-500">Simple. Clear. Built to help you respond better.</p>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <section className="py-12 px-4 border-t border-cyan-900/20 bg-[#020408]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-mono text-slate-600 leading-relaxed text-center">
            TikTok Appeal Helper is an independent tool created to help users organize appeal information and generate draft responses. It is not affiliated with, endorsed by, or operated by TikTok. Use of this tool does not guarantee reinstatement, reversal of enforcement, or any specific outcome. Users are responsible for the truthfulness and accuracy of any information they submit.
          </p>
        </div>
      </section>
    </div>
  );
}
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import GlitchText from "../components/GlitchText";

const faqs = [
  { q: "What exactly is AltCtrl?", a: "AltCtrl is the AI-powered operating system for TikTok LIVE gaming creators. It helps you plan your week, generate promo content before each stream, log performance, and get personalized coaching based on your actual data." },
  { q: "Who is AltCtrl for?", a: "TikTok LIVE gaming creators who want to grow with intent. If you stream games on TikTok LIVE and want structure, strategy, and real analytics — AltCtrl is for you." },
  { q: "When does it launch?", a: "We're currently in beta recruitment. Founding Creators get first access before the public launch. Join the waitlist or grab a Founding Creator spot to get in early." },
  { q: "What's the Founding Creator deal?", a: "$9/mo locked in forever. Standard pricing after beta is $29/mo. Founding Creators never pay more than $9/mo — ever. Plus you get early access, a founding badge, and direct input on the product." },
  { q: "How many Founding Creator slots are there?", a: "Limited. We haven't published the exact number, but when they're gone, they're gone. We'll close the Founding Creator tier and move to standard pricing." },
  { q: "Does AltCtrl connect to my TikTok account?", a: "For the beta launch, most features work without a direct TikTok connection — you log your performance manually. TikTok API integration is on the roadmap for full automation." },
  { q: "Is there a free trial?", a: "Founding Creator access includes a trial period before billing begins. We'll communicate the exact terms when beta opens. We're not interested in locking people into something they don't love." },
  { q: "What's the refund policy?", a: "We'll publish a full refund policy before beta opens. Our intent is to never have someone feel stuck in a product that's not working for them." },
  { q: "Can I use AltCtrl if I'm not a gaming creator?", a: "AltCtrl was built specifically for TikTok LIVE gaming creators. Some features may be useful for other creators, but the coaching, analytics, and promo engine are optimized for gaming content." },
  { q: "How is AltCtrl different from general creator tools?", a: "General creator tools are built for everyone, which means they're built for no one specific. AltCtrl is designed exclusively for TikTok LIVE gaming creators — the workflows, the language, the coaching, the analytics are all calibrated for your exact situation." },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-[#060d1f] border rounded-lg transition-all ${open ? "border-cyan-500/40" : "border-cyan-900/40"}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
        <span className="text-white font-bold text-sm">{q}</span>
        <ChevronDown className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-cyan-900/20 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// KNOWLEDGE BASE</div>
          <GlitchText text="FREQUENTLY ASKED" className="text-4xl sm:text-5xl font-black uppercase text-white block" tag="h1" />
          <h1 className="text-4xl sm:text-5xl font-black uppercase text-cyan-400">QUESTIONS.</h1>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
        </div>
      </div>
    </div>
  );
}
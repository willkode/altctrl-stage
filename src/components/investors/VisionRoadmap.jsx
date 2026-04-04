import { SectionHeader } from "./MarketOpportunity";
import { Crosshair, Tv, Radio, ShoppingBag, Globe, Layers, Rocket, Crown, ArrowRight } from "lucide-react";

const PHASES = [
  {
    year: "NOW",
    timeframe: "Year 1",
    title: "AI Creator OS",
    subtitle: "TikTok LIVE beachhead",
    color: "cyan",
    icon: Crosshair,
    items: [
      "AI coaching, scheduling, promo generation",
      "Stream strategy & challenge engine",
      "Post-live debrief & analytics",
      "Game library with structured metadata",
      "TikTok LIVE as launch platform",
    ],
    revenue: "SaaS: $19–$49/mo",
    metric: "Product-market fit on TikTok LIVE gaming",
  },
  {
    year: "2027",
    timeframe: "Year 2–3",
    title: "Multi-Platform + Broadcasting",
    subtitle: "Replace OBS, Streamlabs, StreamYard",
    color: "pink",
    icon: Tv,
    items: [
      "Native broadcasting engine (replace OBS/Streamlabs)",
      "Multi-platform: YouTube Live, Twitch, Kick, TikTok",
      "Unified cross-platform analytics",
      "AI-powered scene management & overlays",
      "Multistream routing with smart audience optimization",
      "Creator marketing suite: clips, shorts, social promo",
    ],
    revenue: "SaaS: $29–$149/mo + broadcasting tier",
    metric: "Multi-platform creators, broadcasting market share",
  },
  {
    year: "2029",
    timeframe: "Year 4–5",
    title: "The Streaming Platform",
    subtitle: "Replace Twitch, TikTok Live, Kick",
    color: "yellow",
    icon: Crown,
    items: [
      "ALT CTRL becomes the streaming destination",
      "Own the viewer relationship — not rented from platforms",
      "Creator merch storefronts (integrated e-commerce)",
      "Sponsorship marketplace & brand deals",
      "Fan subscriptions, tipping, premium content",
      "Creator agencies & team management tools",
      "AI-powered content repurposing (clips → shorts → TikTok → YouTube)",
      "Full career management: income, taxes, contracts",
    ],
    revenue: "Platform fees + SaaS + Commerce GMV + Ad revenue",
    metric: "Own the entire streaming career ecosystem",
  },
];

const MOATS = [
  { icon: Layers, title: "Data Compound Effect", desc: "Every stream, every session, every metric compounds into a creator intelligence layer no competitor can replicate." },
  { icon: Globe, title: "Platform Agnosticism → Platform Ownership", desc: "Start by integrating every platform. End by becoming the platform. The data layer is the bridge." },
  { icon: Radio, title: "Full-Stack Lock-In", desc: "When you broadcast, schedule, promote, analyze, monetize, AND sell merch in one place — switching cost becomes career risk." },
  { icon: ShoppingBag, title: "Commerce Layer", desc: "Merch, sponsorships, fan subs, and brand deals turn ALT CTRL from a cost center into a revenue amplifier for creators." },
];

export default function VisionRoadmap() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          tag="D"
          title="The 5-Year Vision"
          subtitle="From AI coaching tool → to full-stack broadcasting suite → to the streaming platform that replaces them all."
        />

        {/* Timeline */}
        <div className="mt-12 space-y-0">
          {PHASES.map((phase, i) => {
            const Icon = phase.icon;
            const borderColor = phase.color === "cyan" ? "border-cyan-500/30" : phase.color === "pink" ? "border-pink-500/30" : "border-yellow-400/30";
            const bgAccent = phase.color === "cyan" ? "bg-cyan-500/5" : phase.color === "pink" ? "bg-pink-500/5" : "bg-yellow-400/5";
            const textColor = phase.color === "cyan" ? "text-cyan-400" : phase.color === "pink" ? "text-pink-400" : "text-yellow-400";
            const glowColor = phase.color === "cyan" ? "rgba(0,245,255,0.15)" : phase.color === "pink" ? "rgba(255,0,128,0.15)" : "rgba(251,191,36,0.15)";

            return (
              <div key={phase.year} className="relative">
                {/* Connector line */}
                {i < PHASES.length - 1 && (
                  <div className="absolute left-8 top-full w-0.5 h-8 bg-gradient-to-b from-cyan-900/30 to-transparent z-0 hidden md:block" />
                )}

                <div className={`${bgAccent} border ${borderColor} rounded-xl p-6 md:p-8 relative overflow-hidden mb-6`}
                  style={{ boxShadow: `0 0 60px ${glowColor}` }}>
                  {/* Phase header */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`w-14 h-14 rounded-xl border ${borderColor} ${bgAccent} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${textColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-xs font-black uppercase px-2.5 py-1 rounded ${
                          phase.color === "cyan" ? "bg-cyan-500/10 text-cyan-400" :
                          phase.color === "pink" ? "bg-pink-500/10 text-pink-400" :
                          "bg-yellow-400/10 text-yellow-400"
                        }`}>{phase.year}</span>
                        <span className="text-[10px] font-mono uppercase text-slate-600">{phase.timeframe}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black uppercase text-white mt-1">{phase.title}</h3>
                      <p className={`text-sm font-mono ${textColor} opacity-80`}>{phase.subtitle}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-5">
                    {phase.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <ArrowRight className={`w-3 h-3 ${textColor} shrink-0 mt-1`} />
                        <p className="text-xs text-slate-300 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-6 pt-4 border-t border-white/[0.05] flex-wrap">
                    <div>
                      <p className="text-[9px] font-mono uppercase text-slate-700">Revenue Model</p>
                      <p className="text-xs font-mono text-white">{phase.revenue}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase text-slate-700">Key Metric</p>
                      <p className={`text-xs font-mono ${textColor}`}>{phase.metric}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Competitive moats */}
        <div className="mt-12">
          <h3 className="text-sm font-black uppercase text-white mb-4">Structural Moats</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {MOATS.map(m => {
              const Icon = m.icon;
              return (
                <div key={m.title} className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5 hover:border-cyan-500/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-black uppercase text-white">{m.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* The endgame */}
        <div className="mt-10 bg-gradient-to-r from-yellow-950/20 via-pink-950/10 to-cyan-950/20 border border-yellow-400/15 rounded-xl p-6 md:p-8 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-yellow-400/60 mb-2">The Endgame</p>
          <h3 className="text-xl md:text-2xl font-black uppercase text-white mb-3">
            Own the Entire Streaming Career Ecosystem
          </h3>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Today's streaming market is fragmented: OBS for broadcasting, Streamlabs for overlays, Twitch/TikTok for distribution, Fourthwall for merch, and spreadsheets for everything else. 
            ALT CTRL's vision is to <span className="text-white font-bold">collapse that entire stack into one AI-powered platform</span> — from the moment a creator decides to go live, 
            to the moment their viewer buys their merch and subscribes to their channel.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <span className="text-[10px] font-mono uppercase px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">Broadcast</span>
            <ArrowRight className="w-3 h-3 text-slate-700" />
            <span className="text-[10px] font-mono uppercase px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">Schedule</span>
            <ArrowRight className="w-3 h-3 text-slate-700" />
            <span className="text-[10px] font-mono uppercase px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">Promote</span>
            <ArrowRight className="w-3 h-3 text-slate-700" />
            <span className="text-[10px] font-mono uppercase px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">Perform</span>
            <ArrowRight className="w-3 h-3 text-slate-700" />
            <span className="text-[10px] font-mono uppercase px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">Monetize</span>
            <ArrowRight className="w-3 h-3 text-slate-700" />
            <span className="text-[10px] font-mono uppercase px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">Grow</span>
          </div>
        </div>
      </div>
    </section>
  );
}
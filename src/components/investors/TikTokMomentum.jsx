import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SectionHeader, Stat } from "./MarketOpportunity";
import { Globe, Users, Gamepad2, Gift, Shield } from "lucide-react";

const TIKTOK_GAMING_HOURS = [
  { quarter: "Q1 '25", gaming: 1.1, total: 8.0 },
  { quarter: "Q2 '25", gaming: 1.2, total: 8.6 },
  { quarter: "Q3 '25", gaming: 1.29, total: 9.2 },
  { quarter: "Q4 '25", gaming: 1.5, total: 10.0 },
];

export default function TikTokMomentum() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader tag="C" title="TikTok: The Platform Bet" subtitle="1.59B ad reach, massive young-adult audience, built-in monetization, and real gaming traction." />

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {/* Audience stats */}
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-black uppercase text-white">Audience</h3>
            </div>
            <Stat value="1.59B" label="ad reach, Jan 2025 (+2% YoY)" source="DataReportal" />
            <Stat value="136M" label="U.S. ad reach — largest market" source="DataReportal" />
            <Stat value="28.6%" label="of world's internet users reached" source="DataReportal" />
            <div className="pt-3 border-t border-white/[0.03]">
              <p className="text-[9px] font-mono uppercase text-slate-700 mb-1.5">Demographics</p>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-cyan-500/5 text-cyan-400/60">25-34 avg age</span>
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-pink-500/5 text-pink-400/60">55.7% male</span>
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-pink-500/5 text-pink-400/60">44.3% female</span>
              </div>
              <p className="text-[9px] font-mono text-slate-700 mt-2">Note: Ad-reach figures, not exact MAU. Directionally useful for sizing.</p>
            </div>
          </div>

          {/* Gaming on TikTok Live */}
          <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-black uppercase text-white">Gaming on TikTok Live</h3>
            </div>
            <div className="h-[200px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TIKTOK_GAMING_HOURS} barSize={32}>
                  <XAxis dataKey="quarter" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}B`} domain={[0, 2]} />
                  <Tooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="bg-[#060d1f] border border-pink-500/30 rounded-lg px-3 py-2 text-xs font-mono">
                      <span className="text-pink-400 font-bold">{payload[0].value}B hrs</span>
                      <span className="text-slate-500 ml-1">gaming</span>
                    </div>
                  ) : null} cursor={false} />
                  <Bar dataKey="gaming" radius={[6, 6, 0, 0]}>
                    {TIKTOK_GAMING_HOURS.map((_, i) => (
                      <Cell key={i} fill={i === TIKTOK_GAMING_HOURS.length - 1 ? "#ff0080" : "rgba(255,0,128,0.25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Stat value="14%" label="of TikTok Live watch time = gaming (Q3 '25)" source="Streams Charts" />
            <p className="text-xs text-slate-500 mt-3">TikTok is no longer just IRL/lifestyle live — gaming & esports are growing fast.</p>
          </div>

          {/* Monetization + Risk */}
          <div className="space-y-6">
            <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-black uppercase text-white">Built-in Monetization</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                TikTok LIVE Gifts let viewers send virtual gifts during streams. Creators receive Diamonds based on popularity and activity, which convert to real earnings.
              </p>
              <p className="text-[9px] font-mono text-slate-600">Available to eligible creators 18+ in supported locations. Source: TikTok official.</p>
            </div>

            <div className="bg-[#060d1f]/80 border border-yellow-900/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-black uppercase text-white">U.S. Regulatory Update</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                ByteDance finalized TikTok USDS Joint Venture LLC in January 2026 — 80.1% American-owned, 19.9% ByteDance.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                As of March 2026, the structure still faces legal challenge. <span className="text-yellow-400">Platform risk is reduced versus 2025, but not eliminated.</span>
              </p>
              <p className="text-[9px] font-mono text-slate-600">Source: Reuters (Jan 22, 2026; Mar 5, 2026)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
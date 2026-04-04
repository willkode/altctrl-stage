import { SectionHeader } from "./MarketOpportunity";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const REGIONS = [
  {
    region: "North America",
    streamers: "12M+",
    liveViewers: "~180M",
    topPlatforms: "Twitch, YouTube, TikTok, Kick",
    avgArpu: "$42",
    growth: "+14%",
    notes: "Highest monetization per creator. Twitch dominates but TikTok LIVE is fastest-growing.",
    color: "#00f5ff",
    bar: 180,
  },
  {
    region: "Europe",
    streamers: "9M+",
    liveViewers: "~150M",
    topPlatforms: "Twitch, YouTube, TikTok",
    avgArpu: "$28",
    growth: "+18%",
    notes: "Fragmented by language. Strong esports culture drives live viewership in Germany, France, Spain, Nordics.",
    color: "#06b6d4",
    bar: 150,
  },
  {
    region: "Asia-Pacific",
    streamers: "18M+",
    liveViewers: "~600M",
    topPlatforms: "TikTok/Douyin, YouTube, Bilibili, AfreecaTV",
    avgArpu: "$15",
    growth: "+22%",
    notes: "Largest viewer base globally. Mobile-first streaming. China (Douyin) and SEA (TikTok) lead volume.",
    color: "#0891b2",
    bar: 600,
  },
  {
    region: "Latin America",
    streamers: "5M+",
    liveViewers: "~120M",
    topPlatforms: "Twitch, YouTube, TikTok, Kick",
    avgArpu: "$12",
    growth: "+25%",
    notes: "Fastest-growing region by streamer count. Brazil is the #2 Twitch market globally. High mobile adoption.",
    color: "#ff0080",
    bar: 120,
  },
  {
    region: "Middle East & Africa",
    streamers: "3M+",
    liveViewers: "~80M",
    topPlatforms: "YouTube, TikTok, Twitch",
    avgArpu: "$8",
    growth: "+30%",
    notes: "Emerging market with highest growth rate. Saudi Arabia investing heavily in gaming/esports infrastructure.",
    color: "#fbbf24",
    bar: 80,
  },
];

const CHART_DATA = REGIONS.map(r => ({ name: r.region.split(" ")[0], viewers: r.bar }));

const PLATFORM_REACH = [
  { platform: "Twitch", monthlyViewers: "140M", activeStreamers: "8.5M", regions: "NA, EU, LATAM", color: "#9146ff" },
  { platform: "YouTube Live", monthlyViewers: "500M+", activeStreamers: "15M+", regions: "Global", color: "#ff0000" },
  { platform: "TikTok LIVE", monthlyViewers: "300M+", activeStreamers: "10M+", regions: "Global (excl. China)", color: "#00f5ff" },
  { platform: "Kick", monthlyViewers: "30M", activeStreamers: "1M+", regions: "NA, EU", color: "#53fc18" },
  { platform: "Douyin (China)", monthlyViewers: "400M+", activeStreamers: "12M+", regions: "China only", color: "#fe2c55" },
];

export default function RegionalStreamingData() {
  return (
    <section className="py-20 px-4 border-t border-cyan-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          tag="C"
          title="Global Streaming by Region"
          subtitle="Live streaming is a global phenomenon — and ALT CTRL's multi-platform vision addresses every major market."
        />

        {/* Regional chart + cards */}
        <div className="grid md:grid-cols-[1fr_320px] gap-8 mt-12">
          {/* Region cards */}
          <div className="space-y-3">
            {REGIONS.map(r => (
              <div key={r.region} className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5 hover:border-cyan-500/20 transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      <h3 className="text-sm font-black uppercase text-white">{r.region}</h3>
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">{r.growth} YoY</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-600 mt-1">{r.topPlatforms}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-[9px] font-mono uppercase text-slate-700">Active Streamers</p>
                    <p className="text-lg font-black text-white">{r.streamers}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase text-slate-700">Live Viewers</p>
                    <p className="text-lg font-black text-cyan-400">{r.liveViewers}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase text-slate-700">Avg ARPU (tools)</p>
                    <p className="text-lg font-black text-white">{r.avgArpu}<span className="text-xs text-slate-600">/mo</span></p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{r.notes}</p>
              </div>
            ))}
          </div>

          {/* Sidebar: chart + platform reach */}
          <div className="space-y-6">
            <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5">
              <h3 className="text-sm font-black uppercase text-white mb-1">Live Viewers by Region</h3>
              <p className="text-[9px] font-mono text-slate-700 mb-4">Millions of monthly live viewers</p>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA} barSize={28}>
                    <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#475569", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}M`} />
                    <Tooltip content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-[#060d1f] border border-cyan-500/30 rounded-lg px-3 py-2 text-xs font-mono">
                        <span className="text-cyan-400 font-bold">{payload[0].value}M viewers</span>
                      </div>
                    ) : null} cursor={false} />
                    <Bar dataKey="viewers" radius={[4, 4, 0, 0]}>
                      {CHART_DATA.map((_, i) => (
                        <Cell key={i} fill={REGIONS[i].color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform reach */}
            <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-5">
              <h3 className="text-sm font-black uppercase text-white mb-3">Platform Monthly Reach</h3>
              <div className="space-y-3">
                {PLATFORM_REACH.map(p => (
                  <div key={p.platform} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold text-white">{p.platform}</span>
                        <span className="text-xs font-black text-cyan-400">{p.monthlyViewers}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[9px] font-mono text-slate-600">{p.regions}</span>
                        <span className="text-[9px] font-mono text-slate-600">{p.activeStreamers} streamers</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total global */}
            <div className="bg-gradient-to-br from-cyan-950/20 to-[#060d1f] border border-cyan-500/15 rounded-xl p-5 text-center">
              <p className="text-[9px] font-mono uppercase text-cyan-400/60 mb-1">Total Addressable Streamers</p>
              <p className="text-3xl font-black text-white">47M+</p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">across all platforms & regions</p>
              <p className="text-[9px] font-mono text-cyan-400/40 mt-2">Sources: Streams Charts, DataReportal, Newzoo, StreamHatchet (2025 estimates)</p>
            </div>
          </div>
        </div>

        {/* Key insight */}
        <div className="mt-8 bg-gradient-to-r from-cyan-950/20 to-[#060d1f] border border-cyan-500/15 rounded-xl p-6">
          <h3 className="text-sm font-black uppercase text-cyan-400 mb-2">Why Multi-Region Matters</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Asia-Pacific has <span className="text-white font-bold">3× more live viewers</span> than North America, but North America has <span className="text-white font-bold">3× higher ARPU</span>. 
            Latin America and MENA are growing at <span className="text-white font-bold">25-30% YoY</span> — the fastest of any region. 
            ALT CTRL's multi-platform strategy captures the high-ARPU western markets first (TikTok, Twitch, YouTube, Kick), 
            then expands into high-growth emerging markets where mobile-first streaming is exploding.
          </p>
        </div>
      </div>
    </section>
  );
}
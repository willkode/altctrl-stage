import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import AppBadge from "../../components/app/AppBadge";
import EmptyState from "../../components/app/EmptyState";
import LoadingState from "../../components/app/LoadingState";
import PromoPackDisplay from "../../components/app/promo/PromoPackDisplay";
import PromoPackCard from "../../components/app/promo/PromoPackCard";
import PromoPackDrawer from "../../components/app/drawers/PromoPackDrawer";
import { useAppToast } from "../../hooks/useAppToast";
import { Zap, Radio, Clock, Gamepad2, Search, Filter, RefreshCw, AlertCircle } from "lucide-react";

const TODAY = new Date().toISOString().split("T")[0];
const NEXT_7 = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

export default function Promo() {
  const [loading, setLoading] = useState(true);
  const [upcomingStreams, setUpcomingStreams] = useState([]);
  const [packs, setPacks] = useState([]);
  const [generating, setGenerating] = useState(null); // stream id being generated
  const [generatedKit, setGeneratedKit] = useState(null);
  const [viewKit, setViewKit] = useState(null);
  const [posting, setPosting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [genError, setGenError] = useState(null);
  const toast = useAppToast();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const [streams, kitsList] = await Promise.all([
      base44.entities.ScheduledStream.filter({ created_by: user.email }),
      base44.entities.PromoKit.filter({ created_by: user.email }, "-created_date", 50),
    ]);
    const upcoming = streams
      .filter(s => s.scheduled_date >= TODAY && s.status !== "cancelled")
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
      .slice(0, 10);
    setUpcomingStreams(upcoming);
    setPacks(kitsList);
    setLoading(false);
  }

  async function generatePack(stream) {
    setGenerating(stream.id);
    setGeneratedKit(null);
    setGenError(null);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a TikTok LIVE gaming creator assistant. Generate a high-energy promo pack for a TikTok LIVE stream.

Stream details:
- Game: ${stream.game}
- Type: ${stream.stream_type || "gaming stream"}
- Date: ${stream.scheduled_date}
- Time: ${stream.start_time || "evening"}
- Title hint: ${stream.title || ""}

Generate:
1. A punchy TikTok hook (1-2 sentences, high energy, creates FOMO)
2. A caption (2-4 sentences, engaging, builds hype)
3. 8-10 relevant hashtags (no # prefix, mix of niche + broad)
4. 2 stream title options (short, punchy, uppercase style)

Make it feel authentic and creator-voice, not corporate. Gaming energy.`,
      response_json_schema: {
        type: "object",
        properties: {
          hook: { type: "string" },
          caption: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          title_options: { type: "array", items: { type: "string" } },
        },
      },
    }).catch(e => { setGenError("Generation failed. Check your connection and try again."); setGenerating(null); return null; });

    if (!result) return;

    const kit = await base44.entities.PromoKit.create({
      game: stream.game,
      stream_type: stream.stream_type,
      stream_date: stream.scheduled_date,
      scheduled_stream_id: stream.id,
      hook: result.hook,
      caption: result.caption,
      hashtags: result.hashtags,
      title_options: result.title_options,
      status: "saved",
      generation_prompt: stream.game,
    });

    setGeneratedKit(kit);
    setPacks(p => [kit, ...p]);
    setGenerating(null);
  }

  async function markPosted(kit) {
    setPosting(true);
    await base44.entities.PromoKit.update(kit.id, { status: "posted", posted_at: new Date().toISOString() });
    toast.saved("Marked as posted!");
    setPosting(false);
    if (generatedKit?.id === kit.id) setGeneratedKit(k => ({ ...k, status: "posted", posted_at: new Date().toISOString() }));
    setPacks(p => p.map(x => x.id === kit.id ? { ...x, status: "posted", posted_at: new Date().toISOString() } : x));
  }

  const filteredPacks = packs.filter(k => {
    const matchSearch = !search || k.game?.toLowerCase().includes(search.toLowerCase()) || k.caption?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === "all" || k.status === filterStatus;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="pt-16"><LoadingState message="Loading promo center..." /></div>;

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-1">// PILLAR_02 — PROMOTION</div>
        <h1 className="text-2xl font-black uppercase text-white">Promo</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">Generate your pre-stream promo pack in seconds.</p>
      </div>

      {/* ── Upcoming Streams ── */}
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// UPCOMING STREAMS</div>
        {upcomingStreams.length === 0 ? (
          <div className="bg-[#060d1f] border border-pink-900/20 rounded-lg p-5 text-center">
            <Radio className="w-5 h-5 text-slate-700 mx-auto mb-2" />
            <p className="text-xs font-mono text-slate-600">No upcoming streams scheduled. Add one in the Schedule tab.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingStreams.map(stream => {
              const alreadyHasPack = packs.some(k => k.scheduled_stream_id === stream.id);
              const isGenerating = generating === stream.id;
              const dateLabel = stream.scheduled_date === TODAY ? "Today" :
                new Date(stream.scheduled_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

              return (
                <div key={stream.id} className={`bg-[#060d1f] border rounded-lg px-4 py-3 flex items-center gap-3 transition-all ${
                  stream.scheduled_date === TODAY ? "border-pink-500/30" : "border-pink-900/20"
                }`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black uppercase text-white">{stream.game}</span>
                      {stream.stream_type && <AppBadge label={stream.stream_type} accent="pink" />}
                      {alreadyHasPack && <AppBadge label="Pack Ready" accent="cyan" dot />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={`text-xs font-mono ${stream.scheduled_date === TODAY ? "text-pink-400" : "text-slate-600"}`}>{dateLabel}</span>
                      {stream.start_time && <span className="text-xs font-mono text-slate-700">· {stream.start_time}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => generatePack(stream)}
                    disabled={!!generating}
                    className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest px-3 py-2 rounded border transition-all disabled:opacity-40 shrink-0 ${
                      alreadyHasPack
                        ? "border-cyan-900/40 text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30"
                        : "bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-pink-500/20"
                    }`}>
                    {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    {isGenerating ? "Generating…" : alreadyHasPack ? "Regenerate" : "Generate"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Generation loading state ── */}
      {generating && (
        <div className="mb-6 bg-[#060d1f] border border-pink-500/20 rounded-xl p-8 text-center"
          style={{ boxShadow: "0 0 30px rgba(255,0,128,0.04)" }}>
          <div className="w-10 h-10 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-sm font-black uppercase text-white mb-1">Generating Promo Pack</div>
          <p className="text-xs font-mono text-slate-600">Writing your hook, caption, hashtags and title options…</p>
        </div>
      )}

      {/* ── Generation error ── */}
      {genError && (
        <div className="mb-6 bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-mono text-red-400">{genError}</p>
          </div>
        </div>
      )}

      {/* ── Generated pack display ── */}
      {generatedKit && !generating && (
        <div className="mb-8">
          <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">// JUST GENERATED</div>
          <PromoPackDisplay
            kit={generatedKit}
            onMarkPosted={() => markPosted(generatedKit)}
            onRegenerate={() => {
              const stream = upcomingStreams.find(s => s.id === generatedKit.scheduled_stream_id);
              if (stream) generatePack(stream);
            }}
            posting={posting}
          />
        </div>
      )}

      {/* ── Promo Library ── */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="text-xs font-mono uppercase tracking-widest text-pink-400">// PROMO LIBRARY</div>
          <span className="text-xs font-mono text-slate-600">{packs.length} packs</span>
        </div>

        {packs.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search packs…"
                className="w-full bg-[#060d1f] border border-cyan-900/30 text-white placeholder-slate-700 rounded pl-9 pr-4 py-2 text-xs font-mono outline-none focus:border-cyan-500/30 transition-all" />
            </div>
            {/* Filter */}
            {["all", "saved", "posted"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`text-xs font-mono uppercase px-3 py-2 rounded border transition-all ${
                  filterStatus === f
                    ? "bg-pink-500/10 border-pink-500/30 text-pink-400"
                    : "border-cyan-900/30 text-slate-600 hover:text-slate-300"
                }`}>
                {f}
              </button>
            ))}
          </div>
        )}

        {filteredPacks.length === 0 ? (
          <EmptyState
            title={packs.length === 0 ? "No packs yet" : "No results"}
            message={packs.length === 0
              ? "Generate your first promo pack from an upcoming stream above."
              : "Try a different search or filter."
            }
          />
        ) : (
          <div className="space-y-2">
            {filteredPacks.map(kit => (
              <PromoPackCard
                key={kit.id}
                kit={kit}
                onView={setViewKit}
                onTogglePosted={markPosted}
              />
            ))}
          </div>
        )}
      </div>

      {/* View drawer */}
      <PromoPackDrawer
        open={!!viewKit}
        onClose={() => setViewKit(null)}
        kit={viewKit}
        onMarkedPosted={() => {
          markPosted(viewKit);
          setViewKit(null);
        }}
      />
    </PageContainer>
  );
}
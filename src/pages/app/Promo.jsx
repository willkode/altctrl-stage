import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import PromoPackDisplay from "../../components/app/promo/PromoPackDisplay";
import PromoPackCard from "../../components/app/promo/PromoPackCard";
import PromoPackDrawer from "../../components/app/drawers/PromoPackDrawer";
import { useAppToast } from "../../hooks/useAppToast";
import { Zap, Radio, Search, RefreshCw, AlertCircle, Calendar, ChevronDown, ChevronUp } from "lucide-react";

const TODAY = new Date().toISOString().split("T")[0];

export default function Promo() {
  const [loading, setLoading] = useState(true);
  const [upcomingStreams, setUpcomingStreams] = useState([]);
  const [packs, setPacks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [generatedKit, setGeneratedKit] = useState(null);
  const [viewKit, setViewKit] = useState(null);
  const [posting, setPosting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [genError, setGenError] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState({});
  const toast = useAppToast();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const user = await base44.auth.me();
    const [streams, kitsList, profiles] = await Promise.all([
      base44.entities.ScheduledStream.filter({ created_by: user.email }),
      base44.entities.PromoKit.filter({ created_by: user.email }, "-created_date", 100),
      base44.entities.CreatorProfile.filter({ created_by: user.email }),
    ]);
    const upcoming = streams
      .filter(s => s.scheduled_date >= TODAY && s.status !== "cancelled" && s.status !== "skipped")
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
      .slice(0, 10);
    setUpcomingStreams(upcoming);
    setPacks(kitsList);
    setProfile(profiles[0] || null);
    setLoading(false);
  }

  async function generatePack(stream) {
    setGenerating(stream.id);
    setGeneratedKit(null);
    setGenError(null);

    const tone = profile?.promo_tone || "hype";
    const niche = profile?.creator_niche || "variety";
    const style = profile?.content_style || "entertainment";
    const creatorName = profile?.display_name || "";
    const promoNotes = profile?.promo_notes || "";
    const versionNum = packs.filter(k => k.scheduled_stream_id === stream.id).length + 1;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a TikTok LIVE gaming creator assistant. Generate a high-energy, platform-native promo pack for a TikTok LIVE stream.

Creator profile:
- Name: ${creatorName || "the creator"}
- Niche: ${niche.replace("_", " ")}
- Promo tone: ${tone}
- Content style: ${style.replace("_", " ")}
${promoNotes ? `- Custom instructions: ${promoNotes}` : ""}

Stream details:
- Game: ${stream.game}
- Type: ${stream.stream_type?.replace("_", " ") || "gaming stream"}
- Date: ${stream.scheduled_date}
- Time: ${stream.start_time || "evening"}
${stream.title ? `- Working title: ${stream.title}` : ""}

This is version ${versionNum} — make it feel fresh, not a copy of a previous attempt.

Generate:
1. hook — 1-2 punchy sentences that create FOMO and stop the scroll. Match the creator's tone (${tone}).
2. caption — 2-4 sentences of engaging hype, platform-native, builds community anticipation.
3. hashtags — 8-10 tags: mix niche gaming tags + TikTok LIVE growth tags. No # prefix.
4. title_options — exactly 2 stream title options. Short, punchy, uppercase-friendly.

Write like a creator, not a marketer. Match TikTok LIVE gaming culture.`,
      response_json_schema: {
        type: "object",
        properties: {
          hook: { type: "string" },
          caption: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          title_options: { type: "array", items: { type: "string" } },
        },
      },
    }).catch(() => {
      setGenError("Generation failed — check your connection and try again.");
      setGenerating(null);
      return null;
    });

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
      generation_prompt: `tone:${tone} niche:${niche} style:${style} v${versionNum}`,
    });

    setGeneratedKit(kit);
    setPacks(p => [kit, ...p]);
    setGenerating(null);
  }

  async function markPosted(kit) {
    setPosting(true);
    const updated = { status: "posted", posted_at: new Date().toISOString() };
    await base44.entities.PromoKit.update(kit.id, updated);
    toast.saved("Marked as posted!");
    setPosting(false);
    const patch = k => k.id === kit.id ? { ...k, ...updated } : k;
    if (generatedKit?.id === kit.id) setGeneratedKit(patch);
    setPacks(p => p.map(patch));
    if (viewKit?.id === kit.id) setViewKit(k => ({ ...k, ...updated }));
  }

  const groupedPacks = (() => {
    const filtered = packs.filter(k => {
      const q = search.toLowerCase();
      const matchSearch = !q || k.game?.toLowerCase().includes(q) || k.stream_date?.includes(q) || k.caption?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || k.status === filterStatus;
      return matchSearch && matchStatus;
    });
    const groups = [];
    const seen = new Set();
    filtered.forEach(kit => {
      const key = kit.scheduled_stream_id || `standalone-${kit.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        const versions = filtered.filter(k => (k.scheduled_stream_id || `standalone-${k.id}`) === key);
        groups.push({ key, versions, latest: versions[0] });
      }
    });
    return groups;
  })();

  const toggleVersions = (key) => setExpandedVersions(e => ({ ...e, [key]: !e[key] }));

  if (loading) return <div className="pt-16"><LoadingState message="Loading promo center..." /></div>;

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-400/60 mb-1">Promotion</p>
        <h1 className="text-2xl font-black uppercase text-white">Promo Center</h1>
        <p className="text-xs font-mono text-slate-600 mt-1">Generate pre-stream promo packs in seconds.</p>
      </div>

      {/* Upcoming Streams */}
      <div className="mb-6">
        <p className="text-[10px] font-mono uppercase tracking-widest text-pink-400/60 mb-3">Upcoming Streams</p>

        {upcomingStreams.length === 0 ? (
          <div className="bg-gradient-to-br from-pink-950/15 to-[#060d1f] border border-pink-900/20 rounded-xl p-6 text-center">
            <p className="text-sm font-bold text-slate-400 mb-1">No streams scheduled</p>
            <p className="text-xs font-mono text-slate-600 mb-4">Schedule a stream first, then come back to generate promo.</p>
            <Link to="/app/schedule"
              className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/15 transition-all">
              <Calendar className="w-3.5 h-3.5" /> Schedule →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingStreams.map(stream => {
              const streamPacks = packs.filter(k => k.scheduled_stream_id === stream.id);
              const hasPosted = streamPacks.some(k => k.status === "posted");
              const isGenerating = generating === stream.id;
              const dateLabel = stream.scheduled_date === TODAY
                ? "Today"
                : new Date(stream.scheduled_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

              return (
                <div key={stream.id} className={`bg-[#060d1f]/80 border rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all ${
                  stream.scheduled_date === TODAY ? "border-pink-500/30" : "border-pink-900/15"
                }`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{stream.game}</span>
                      {stream.stream_type && (
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400/60">{stream.stream_type.replace("_", " ")}</span>
                      )}
                      {hasPosted ? (
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Posted ✓</span>
                      ) : streamPacks.length > 0 ? (
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400/60">{streamPacks.length} pack{streamPacks.length > 1 ? "s" : ""}</span>
                      ) : null}
                    </div>
                    <span className={`text-[10px] font-mono ${stream.scheduled_date === TODAY ? "text-pink-400/60" : "text-slate-600"}`}>
                      {dateLabel}{stream.start_time ? ` · ${stream.start_time}` : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => generatePack(stream)}
                    disabled={!!generating}
                    className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-lg border transition-all disabled:opacity-40 shrink-0 ${
                      streamPacks.length > 0
                        ? "border-cyan-900/30 text-slate-500 hover:text-cyan-400"
                        : "bg-pink-500/10 border-pink-500/20 text-pink-400 hover:bg-pink-500/15"
                    }`}>
                    {isGenerating
                      ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating…</>
                      : <><Zap className="w-3.5 h-3.5" /> {streamPacks.length > 0 ? "New Version" : "Generate"}</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading state */}
      {generating && (
        <div className="mb-6 bg-[#060d1f]/80 border border-pink-500/15 rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-pink-500/20 border-t-pink-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-white mb-0.5">Generating Promo Pack</p>
          <p className="text-[10px] font-mono text-slate-600">Hook, caption, hashtags, and titles…</p>
        </div>
      )}

      {/* Error */}
      {genError && (
        <div className="mb-6 bg-red-500/5 border border-red-500/15 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-mono text-red-400 mb-1">{genError}</p>
            <button onClick={() => setGenError(null)} className="text-[10px] font-mono text-red-400/50 hover:text-red-400 transition-colors">Dismiss</button>
          </div>
        </div>
      )}

      {/* Latest generated */}
      {generatedKit && !generating && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-pink-400/60">Just Generated</p>
            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
          </div>
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

      {/* Promo Library */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-pink-400/60">Library</p>
          <span className="text-[10px] font-mono text-slate-700">{packs.length} packs</span>
        </div>

        {packs.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-700" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[#060d1f]/80 border border-cyan-900/20 text-white placeholder-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs font-mono outline-none focus:border-cyan-500/20 transition-all" />
            </div>
            {["all", "saved", "posted"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`text-[10px] font-mono uppercase px-3 py-2 rounded-lg border transition-all ${
                  filterStatus === f ? "bg-pink-500/10 border-pink-500/20 text-pink-400" : "border-cyan-900/20 text-slate-600 hover:text-slate-400"
                }`}>
                {f}
              </button>
            ))}
          </div>
        )}

        {groupedPacks.length === 0 ? (
          <div className="bg-[#060d1f]/80 border border-pink-900/15 rounded-xl p-8 text-center">
            <Radio className="w-6 h-6 text-slate-800 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-500 mb-1">{packs.length ? "No matches" : "Library empty"}</p>
            <p className="text-xs font-mono text-slate-700">{packs.length ? "Adjust your filters." : "Generate your first pack above."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedPacks.map(({ key, versions, latest }) => (
              <div key={key}>
                <PromoPackCard kit={latest} versionLabel={versions.length > 1 ? `v${versions.length}` : null} onView={setViewKit} onTogglePosted={markPosted} />
                {versions.length > 1 && (
                  <div className="mt-1 pl-3 border-l border-pink-900/15">
                    <button onClick={() => toggleVersions(key)}
                      className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-slate-700 hover:text-slate-500 py-1 transition-colors">
                      {expandedVersions[key] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {versions.length - 1} older
                    </button>
                    {expandedVersions[key] && (
                      <div className="space-y-1.5 pb-1">
                        {versions.slice(1).map((kit, i) => (
                          <PromoPackCard key={kit.id} kit={kit} versionLabel={`v${versions.length - 1 - i}`} onView={setViewKit} onTogglePosted={markPosted} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <PromoPackDrawer open={!!viewKit} onClose={() => setViewKit(null)} kit={viewKit}
        onMarkedPosted={() => { if (viewKit) markPosted(viewKit); setViewKit(null); }} />
    </PageContainer>
  );
}
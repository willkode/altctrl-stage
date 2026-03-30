import PageContainer from "../../components/app/PageContainer";
import SectionHeader from "../../components/app/SectionHeader";
import EmptyState from "../../components/app/EmptyState";
import AppBadge from "../../components/app/AppBadge";
import { Radio, Zap } from "lucide-react";

export default function Promo() {
  return (
    <PageContainer>
      <SectionHeader
        tag="PILLAR_02"
        title="Promo"
        subtitle="Generate your pre-stream promo pack in seconds."
        accent="pink"
        action={
          <button className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded bg-pink-500/10 text-pink-400 border border-pink-500/30 hover:bg-pink-500/20 transition-all">
            <Zap className="w-3.5 h-3.5" />
            Generate Pack
          </button>
        }
      />

      {/* Generator card */}
      <div className="bg-[#060d1f] border border-pink-900/40 rounded-lg p-5 mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400 mb-4">// NEW PROMO PACK</div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">Game</label>
            <input placeholder="e.g. Fortnite, Warzone, Free Fire" className="w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-4 py-2.5 text-sm outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">Stream Type</label>
            <input placeholder="e.g. Ranked grind, chill stream, viewer games" className="w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-4 py-2.5 text-sm outline-none transition-all" />
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-pink-500 text-white font-black uppercase tracking-widest py-3 rounded text-xs hover:bg-pink-400 hover:shadow-[0_0_20px_rgba(255,0,128,0.3)] transition-all">
            <Radio className="w-4 h-4" />
            Generate Promo Pack
          </button>
        </div>
      </div>

      <SectionHeader tag="Promo Library" title="Saved Packs" accent="pink" />
      <EmptyState
        title="No packs saved yet"
        message="Generate your first promo pack to start building your library."
      />
    </PageContainer>
  );
}
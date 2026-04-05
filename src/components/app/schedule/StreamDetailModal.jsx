import { useState } from "react";
import { base44 } from "@/api/base44Client";
import AppModal from "../AppModal";
import StreamDetailInfo from "./StreamDetailInfo";
import PreStreamChecklist from "./PreStreamChecklist";
import PromoGenerator from "./PromoGenerator";
import StreamStrategyTab from "./StreamStrategyTab";
import { Info, CheckSquare, Radio, Crosshair } from "lucide-react";

const TABS = [
  { key: "details", label: "Details", icon: Info },
  { key: "checklist", label: "Checklist", icon: CheckSquare },
  { key: "promo", label: "Promo", icon: Radio },
  { key: "strategy", label: "Strategy", icon: Crosshair },
];

export default function StreamDetailModal({ stream, open, onClose }) {
  const [tab, setTab] = useState("details");

  if (!stream) return null;

  return (
    <AppModal open={open} onClose={onClose} title={stream.title || stream.game} wide>
      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-cyan-900/20 pb-3">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
              tab === key
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "details" && <StreamDetailInfo stream={stream} />}
      {tab === "checklist" && <PreStreamChecklist stream={stream} />}
      {tab === "promo" && <PromoGenerator stream={stream} />}
      {tab === "strategy" && <StreamStrategyTab stream={stream} />}
    </AppModal>
  );
}
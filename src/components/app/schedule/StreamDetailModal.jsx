import { useState, useEffect } from "react";
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
  const [liveStream, setLiveStream] = useState(stream);

  useEffect(() => {
    if (open && stream?.id) {
      base44.entities.ScheduledStream.filter({ id: stream.id }).then(res => {
        if (res?.[0]) setLiveStream(res[0]);
      });
    }
  }, [open, stream?.id]);

  if (!stream) return null;

  return (
    <AppModal open={open} onClose={onClose} title={liveStream.title || liveStream.game} wide>
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

      {tab === "details" && <StreamDetailInfo stream={liveStream} />}
      {tab === "checklist" && <PreStreamChecklist stream={liveStream} />}
      {tab === "promo" && <PromoGenerator stream={liveStream} />}
      {tab === "strategy" && <StreamStrategyTab stream={liveStream} />}
    </AppModal>
  );
}
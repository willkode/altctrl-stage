import { CheckCircle2 } from "lucide-react";

const PLATFORMS = [
  { id: "tiktok", label: "TikTok Live", icon: "🎵" },
  { id: "twitch", label: "Twitch", icon: "⚡" },
  { id: "youtube", label: "YouTube Live", icon: "🎬" },
];

export default function PlatformSelector({ selectedPlatforms, onUpdate, onNext }) {
  const togglePlatform = (platformId) => {
    onUpdate(
      selectedPlatforms.includes(platformId)
        ? selectedPlatforms.filter(p => p !== platformId)
        : [...selectedPlatforms, platformId]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black uppercase text-white mb-2">Where do you stream?</h2>
        <p className="text-sm text-slate-500 font-mono">Select all platforms you use. You can add more later.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLATFORMS.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`p-5 rounded-xl border-2 transition-all text-center ${
                isSelected
                  ? "border-cyan-500/60 bg-cyan-500/10"
                  : "border-cyan-900/30 bg-[#02040f] hover:border-cyan-500/40"
              }`}
            >
              <div className="text-3xl mb-2">{platform.icon}</div>
              <p className="font-bold text-sm text-white mb-2">{platform.label}</p>
              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-cyan-400 mx-auto" />
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={selectedPlatforms.length === 0}
        className="w-full bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3 rounded-lg hover:bg-cyan-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
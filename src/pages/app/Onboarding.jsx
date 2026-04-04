import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import GlitchText from "../../components/GlitchText";
import OnboardingChat from "../../components/app/onboarding/OnboardingChat";
import OnboardingReview from "../../components/app/onboarding/OnboardingReview";
import { Zap } from "lucide-react";

export default function Onboarding({ onComplete }) {
  const [phase, setPhase] = useState("chat"); // chat | review | connecting | done
  const [profileData, setProfileData] = useState({});
  const [resolvedGames, setResolvedGames] = useState([]);
  const [topGameIds, setTopGameIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleChatComplete = (data, games) => {
    setProfileData(data);
    setResolvedGames(games);
    // Auto-mark first game as top if there's only one
    if (games.length === 1) setTopGameIds([games[0].id]);
    setPhase("review");
  };

  const handleFinalize = async () => {
    setSaving(true);
    // Save via backend
    await base44.functions.invoke("onboardingAI", {
      action: "finalize",
      payload: {
        profile_data: profileData,
        game_ids: resolvedGames.map(g => g.id),
        top_game_ids: topGameIds,
      },
    });

    // Also update game preference titles
    for (const game of resolvedGames) {
      const prefs = await base44.entities.CreatorGamePreference.filter({ game_id: game.id });
      if (prefs[0] && !prefs[0].game_title) {
        await base44.entities.CreatorGamePreference.update(prefs[0].id, { game_title: game.title });
      }
    }

    setSaving(false);
    setPhase("done");

    // Trigger onComplete with profile data
    await onComplete(profileData);
  };

  return (
    <div className="min-h-screen bg-[#02040f] flex flex-col items-center justify-center px-4 py-8">
      {/* Scanline */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)" }} />

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/5 rounded px-3 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">// INITIALIZING</span>
          </div>
          <GlitchText text="WELCOME TO ALTCTRL" className="text-3xl font-black uppercase text-white block mb-1" tag="h1" />
          <p className="text-slate-500 text-sm font-mono">
            {phase === "chat" ? "Tell me about yourself and I'll set everything up." :
             phase === "review" ? "Review your profile before we go live." :
             "Launching your command center..."}
          </p>
        </div>

        {/* Phase: Chat */}
        {phase === "chat" && (
          <OnboardingChat onComplete={handleChatComplete} />
        )}

        {/* Phase: Review */}
        {phase === "review" && (
          <OnboardingReview
            profileData={profileData}
            games={resolvedGames}
            topGameIds={topGameIds}
            onToggleTop={(id) => setTopGameIds(prev =>
              prev.includes(id) ? prev.filter(x => x !== id) :
              prev.length < 3 ? [...prev, id] : prev
            )}
            onUpdateProfile={setProfileData}
            onConfirm={handleFinalize}
            onBack={() => setPhase("chat")}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}
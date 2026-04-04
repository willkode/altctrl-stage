import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Flame, Zap, Crown, ArrowRight, Loader2, CheckCircle2, LogOut } from "lucide-react";

export default function OGCreators() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) {
        base44.auth.redirectToLogin("/og-creators");
        return;
      }
      // They're authenticated — redirect to onboarding/dashboard
      window.location.href = "/app/dashboard";
    } catch {
      base44.auth.redirectToLogin("/og-creators");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040f] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-yellow-400/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-cyan-400/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* OG Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/30">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-yellow-400">Founding Creator</span>
        </div>

        {/* Main heading */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black uppercase text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            You're In<span className="text-yellow-400">.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            You've been approved as one of our <span className="text-yellow-400 font-bold">Founding Creators</span>. Welcome to the inner circle.
          </p>
        </div>

        {/* Perks */}
        <div className="grid gap-3 text-left">
          {[
            { icon: Flame, text: "Lifetime Founding Creator badge on your profile", accent: "yellow" },
            { icon: Zap, text: "Early access to every new feature before anyone else", accent: "cyan" },
            { icon: Crown, text: "Direct line to the dev team — your feedback shapes the product", accent: "pink" },
          ].map((perk, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                perk.accent === "yellow" ? "bg-yellow-400/10" : perk.accent === "cyan" ? "bg-cyan-400/10" : "bg-pink-400/10"
              }`}>
                <perk.icon className={`w-5 h-5 ${
                  perk.accent === "yellow" ? "text-yellow-400" : perk.accent === "cyan" ? "text-cyan-400" : "text-pink-400"
                }`} />
              </div>
              <span className="text-sm text-slate-300 font-medium">{perk.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!done ? (
          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-yellow-400 text-[#02040f] font-black uppercase tracking-widest text-sm hover:bg-yellow-300 transition-all disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Your Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-4 text-green-400 font-mono text-sm uppercase tracking-widest">
            <CheckCircle2 className="w-5 h-5" /> Account Created
          </div>
        )}

        <p className="text-xs font-mono text-slate-700 text-center">
          This invite link is exclusive to approved founding creators.
        </p>

        <button
          onClick={() => base44.auth.logout("/og-creators")}
          className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors mx-auto mt-2"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );
}
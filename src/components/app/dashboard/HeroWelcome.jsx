import { Link } from "react-router-dom";
import GlitchText from "../../GlitchText";

const GREETINGS = ["MORNING", "AFTERNOON", "EVENING"];

export default function HeroWelcome({ profile }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? GREETINGS[0] : hour < 17 ? GREETINGS[1] : GREETINGS[2];
  const name = profile?.display_name?.toUpperCase() || "";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#060d1f] via-[#060d1f] to-cyan-950/20 border border-cyan-900/30 p-6 sm:p-8">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-cyan-400/[0.03] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-pink-500/[0.03] blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/60 mb-2">{today}</p>
        <GlitchText
          text={`GOOD ${greeting}${name ? `, ${name}` : ""}.`}
          className="text-2xl sm:text-3xl font-black uppercase text-white leading-tight"
          tag="h1"
        />
        {profile?.primary_game && (
          <p className="text-xs font-mono text-slate-600 mt-2">Primary: <span className="text-slate-400">{profile.primary_game}</span></p>
        )}
      </div>
    </div>
  );
}
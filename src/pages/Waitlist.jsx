import GlitchText from "../components/GlitchText";
import WaitlistForm from "../components/WaitlistForm";
import { Link } from "react-router-dom";

export default function Waitlist() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Background glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/4 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/5 rounded px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">// WAITLIST — ACCEPTING SIGNALS</span>
            </div>
            <GlitchText text="JOIN THE WAITLIST" className="text-4xl sm:text-5xl font-black uppercase text-white block" tag="h1" />
            <p className="text-slate-400 mt-4 max-w-md mx-auto">Be first in line when AltCtrl opens. No spam. We transmit only when your access is ready.</p>
          </div>

          <div className="bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8">
            <WaitlistForm source="waitlist" founding={false} />
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Want guaranteed early access and a locked price?{" "}
              <Link to="/founding-creators" className="text-pink-400 hover:text-pink-300 font-bold transition-colors">
                See the Founding Creator deal →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
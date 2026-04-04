import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Desktop OAuth entry point.
 * Electron opens https://altctrl.us/desktop/auth in a BrowserWindow.
 * This page immediately kicks off Google OAuth, redirecting back to /desktop/callback on success.
 */
export default function DesktopAuth() {
  useEffect(() => {
    base44.auth.loginWithProvider("google", "/desktop/callback");
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#02040f] gap-4">
      <div className="w-8 h-8 border-4 border-slate-800 border-t-cyan-400 rounded-full animate-spin" />
      <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
        Connecting to Google...
      </p>
    </div>
  );
}
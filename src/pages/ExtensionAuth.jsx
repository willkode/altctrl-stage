import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * /extension-auth
 * Chrome extension opens this page. We:
 *  1. If hash already has token + creator_profile_id → show success (extension closes tab).
 *  2. If not authed → redirect to login, return here after.
 *  3. If authed → generate extension token, get profile, set hash → page reloads with hash.
 */
export default function ExtensionAuth() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState(null);

  useEffect(() => {
    // Step 1: already have hash params? Show success immediately.
    const hash = new URLSearchParams(window.location.hash.replace("#", ""));
    if (hash.get("token") && hash.get("creator_profile_id")) {
      setStatus("success");
      return;
    }

    // Step 2 & 3: auth check then build hash
    async function run() {
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        if (!isAuthed) {
          sessionStorage.setItem("post_login_redirect", "/extension-auth");
          base44.auth.redirectToLogin("/app/dashboard");
          return;
        }

        const user = await base44.auth.me();

        // Generate extension token
        const tokenRes = await base44.functions.invoke("extensionAuthV2", { action: "generate" });
        const token = tokenRes.data?.token;
        if (!token) throw new Error("Failed to generate token");

        // Get creator profile
        const profiles = await base44.entities.CreatorProfile.filter({ created_by: user.email });
        const profile = profiles[0];
        if (!profile) throw new Error("Creator profile not found. Please complete onboarding first.");

        const displayName = profile.display_name || user.full_name || user.email;

        // Set hash — this triggers the extension listener
        window.location.hash = `token=${encodeURIComponent(token)}&creator_profile_id=${encodeURIComponent(profile.id)}&display_name=${encodeURIComponent(displayName)}`;
        setStatus("success");
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
        setStatus("error");
      }
    }

    run();
  }, []);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#02040f] gap-4">
        <div className="w-8 h-8 border-4 border-slate-800 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Connecting extension...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#02040f] gap-4 px-6">
        <p className="text-xs font-mono uppercase tracking-widest text-red-400">Connection Failed</p>
        <p className="text-xs font-mono text-slate-500 max-w-sm text-center">{error}</p>
        <a
          href="/extension-auth"
          className="text-xs font-mono uppercase tracking-widest text-cyan-400 border border-cyan-900 px-4 py-2 rounded hover:bg-cyan-900/20 transition-all"
        >
          Try Again
        </a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#02040f] gap-4">
      <div className="text-cyan-400 text-4xl">✓</div>
      <p className="text-sm font-black uppercase tracking-widest text-white">
        Connected!
      </p>
      <p className="text-xs font-mono text-slate-500">
        You can close this tab — the extension is now linked to your account.
      </p>
    </div>
  );
}
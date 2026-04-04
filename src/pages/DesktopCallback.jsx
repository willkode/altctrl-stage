import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Desktop OAuth callback.
 * After Google OAuth, Base44 redirects here.
 * We grab the access_token + user, then redirect to the Electron deep-link:
 *   altctrl-desktop://callback?access_token=TOKEN&user=ENCODED_JSON
 * Electron intercepts that URL scheme to complete login.
 */
export default function DesktopCallback() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState(null);

  useEffect(() => {
    async function finish() {
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        if (!isAuthed) {
          setError("Authentication did not complete. Please try again.");
          setStatus("error");
          return;
        }

        const user = await base44.auth.me();

        // Base44 stores the access_token in localStorage after OAuth
        const access_token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("session_token") ||
          localStorage.getItem("token");

        if (!access_token) {
          setError("Could not retrieve access token. Please try again.");
          setStatus("error");
          return;
        }

        const encodedUser = encodeURIComponent(JSON.stringify({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        }));

        // Redirect to Electron via custom URL scheme
        window.location.href = `altctrl-desktop://callback?access_token=${access_token}&user=${encodedUser}`;
        setStatus("success");
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
        setStatus("error");
      }
    }

    finish();
  }, []);

  if (status === "success") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#02040f] gap-4">
        <div className="text-cyan-400 text-3xl">✓</div>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
          Login complete — you can close this window.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#02040f] gap-4">
        <p className="text-xs font-mono uppercase tracking-widest text-red-400">Login Failed</p>
        <p className="text-xs font-mono text-slate-500 max-w-sm text-center">{error}</p>
        <a
          href="/desktop/auth"
          className="text-xs font-mono uppercase tracking-widest text-cyan-400 border border-cyan-900 px-4 py-2 rounded hover:bg-cyan-900/20 transition-all"
        >
          Try Again
        </a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#02040f] gap-4">
      <div className="w-8 h-8 border-4 border-slate-800 border-t-cyan-400 rounded-full animate-spin" />
      <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
        Completing login...
      </p>
    </div>
  );
}
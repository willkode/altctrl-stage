import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function TikTokCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const errorParam = params.get("error");

        if (errorParam) {
          setError(`TikTok auth failed: ${errorParam} (${params.get("error_type") || ""})`);
          setLoading(false);
          return;
        }

        if (!code) {
          setError("No authorization code received from TikTok");
          setLoading(false);
          return;
        }

        // Check if user is authenticated
        const isAuthed = await base44.auth.isAuthenticated();
        if (!isAuthed) {
          // Store code/state so we can resume after login
          sessionStorage.setItem("tiktok_oauth_code", code);
          sessionStorage.setItem("tiktok_oauth_state", state || "");
          // Redirect to login, then back here
          base44.auth.redirectToLogin("/tiktok-callback?resumed=1");
          return;
        }

        // Check if resuming after login
        let finalCode = code;
        let finalState = state;
        if (params.get("resumed") === "1") {
          finalCode = sessionStorage.getItem("tiktok_oauth_code") || code;
          finalState = sessionStorage.getItem("tiktok_oauth_state") || state;
          sessionStorage.removeItem("tiktok_oauth_code");
          sessionStorage.removeItem("tiktok_oauth_state");
        }

        // Call backend to exchange code for token
        const response = await base44.functions.invoke("tiktokOAuthCallback", {
          code: finalCode,
          state: finalState,
        });

        if (response.data.success) {
          navigate("/app/dashboard", { replace: true });
        } else {
          setError(response.data.error || "Failed to complete TikTok connection");
        }
      } catch (err) {
        setError(err.message || "An error occurred during TikTok authentication");
      } finally {
        setLoading(false);
      }
    }

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-mono text-slate-400">Completing TikTok connection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-lg font-black uppercase text-red-400 mb-2">Connection Failed</h1>
          <p className="text-sm font-mono text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/app/settings", { replace: true })}
            className="px-6 py-2 rounded text-xs font-mono uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            Return to Settings
          </button>
        </div>
      </div>
    );
  }

  return null;
}
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function TikTokCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleCallback() {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          setError(`TikTok auth failed: ${errorParam}`);
          return;
        }

        if (!code) {
          setError("No authorization code received from TikTok");
          return;
        }

        // Call backend function to exchange code for token and store connection
        const response = await base44.functions.invoke("handleTikTokCallback", {
          code,
          state,
        });

        if (response.data.success) {
          // Redirect to app dashboard or profile page
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
  }, [searchParams, navigate]);

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
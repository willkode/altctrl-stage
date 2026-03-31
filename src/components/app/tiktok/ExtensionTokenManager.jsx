import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Copy, RotateCw, Trash2, Check, Eye, EyeOff } from "lucide-react";
import { useAppToast } from "../../../hooks/useAppToast";

export default function ExtensionTokenManager() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newToken, setNewToken] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useAppToast();

  useEffect(() => {
    loadTokens();
  }, []);

  async function loadTokens() {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const extTokens = await base44.entities.ExtensionToken.filter(
        { created_by: user.email },
        "-generated_at",
        10
      );
      setTokens(extTokens);
    } catch (error) {
      console.error("Failed to load tokens:", error);
      toast.error("Failed to load tokens");
    }
    setLoading(false);
  }

  async function handleGenerateToken() {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke("extensionAuthV2", {
        action: "generate",
      });
      setNewToken({
        token: response.token,
        expires_at: response.expires_at,
        id: response.token_id,
      });
      toast.saved("Token generated");
      await loadTokens();
    } catch (error) {
      console.error("Failed to generate token:", error);
      toast.error("Failed to generate token");
    }
    setGenerating(false);
  }

  async function handleRevoke(tokenId) {
    if (!confirm("Revoke this token? The Chrome extension will need to be re-authenticated.")) return;
    try {
      await base44.functions.invoke("extensionAuthV2", {
        action: "revoke",
        revoke_id: tokenId,
      });
      toast.deleted("Token revoked");
      await loadTokens();
    } catch (error) {
      console.error("Failed to revoke token:", error);
      toast.error("Failed to revoke token");
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(newToken.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <div className="text-xs font-mono text-slate-600">Loading tokens...</div>;
  }

  return (
    <div className="space-y-4">
      {/* New Token Display */}
      {newToken && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-2">
            ⚠ New Token Generated
          </div>
          <p className="text-xs text-slate-300 mb-3">
            Copy this token now. You won't see it again. Paste it into your Chrome extension settings.
          </p>
          <div className="relative">
            <div className="bg-[#02040f] border border-yellow-500/40 rounded p-3 font-mono text-xs break-all text-slate-400 mb-2">
              {showToken ? newToken.token : "•".repeat(newToken.token.length)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowToken(!showToken)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded hover:bg-yellow-500/20 transition-all"
              >
                {showToken ? (
                  <>
                    <EyeOff className="w-3 h-3" /> Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" /> Show
                  </>
                )}
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-500/20 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-[9px] text-slate-600 mt-2">
              Expires: {new Date(newToken.expires_at).toLocaleDateString()} at{" "}
              {new Date(newToken.expires_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {/* Generate Token Button */}
      <button
        onClick={handleGenerateToken}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono uppercase text-xs hover:bg-cyan-500/20 disabled:opacity-40 transition-all"
      >
        <RotateCw className="w-3.5 h-3.5" /> {generating ? "Generating..." : "Generate New Token"}
      </button>

      {/* Active Tokens */}
      {tokens.length > 0 && (
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-2">
            Active & Revoked Tokens
          </div>
          <div className="space-y-2">
            {tokens.map(token => (
              <div
                key={token.id}
                className={`rounded border p-3 ${
                  token.status === "active"
                    ? "bg-[#02040f] border-cyan-900/30"
                    : "bg-[#02040f] border-slate-700/30 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-slate-300">{token.name}</span>
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                      token.status === "active"
                        ? "bg-green-500/10 text-green-400 border border-green-500/30"
                        : "bg-slate-500/10 text-slate-500 border border-slate-500/30"
                    }`}
                  >
                    {token.status}
                  </span>
                </div>
                <div className="text-[9px] text-slate-600 space-y-1 mb-3">
                  <div>Generated: {new Date(token.generated_at).toLocaleDateString()}</div>
                  <div>Expires: {new Date(token.expires_at).toLocaleDateString()}</div>
                  {token.last_used_at && (
                    <div>Last used: {new Date(token.last_used_at).toLocaleDateString()}</div>
                  )}
                  {token.total_syncs > 0 && (
                    <div>
                      Syncs: {token.total_syncs} ({token.total_sessions_imported} sessions)
                    </div>
                  )}
                </div>
                {token.status === "active" && (
                  <button
                    onClick={() => handleRevoke(token.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono uppercase bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-3 h-3" /> Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help */}
      <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
        <div className="text-[10px] font-mono uppercase text-cyan-400 mb-2">How to use</div>
        <ol className="text-[9px] text-slate-600 space-y-1">
          <li>1. Generate a token here</li>
          <li>2. Copy the token to your clipboard</li>
          <li>3. Open Chrome extension settings and paste it</li>
          <li>4. Extension will sync using this token (no login needed)</li>
        </ol>
      </div>
    </div>
  );
}
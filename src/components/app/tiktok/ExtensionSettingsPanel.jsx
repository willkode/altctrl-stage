import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Copy,
  RotateCw,
  Trash2,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  Link as LinkIcon,
  Zap,
  HelpCircle,
} from "lucide-react";
import { useAppToast } from "../../../hooks/useAppToast";

export default function ExtensionSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [activeToken, setActiveToken] = useState(null);
  const [allTokens, setAllTokens] = useState([]);
  const [recentSync, setRecentSync] = useState(null);
  const [profile, setProfile] = useState(null);
  const [newTokenDisplay, setNewTokenDisplay] = useState(null);
  const [showFullToken, setShowFullToken] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(null);
  const [copied, setCopied] = useState(null);
  const toast = useAppToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const [tokens, syncLogs, profiles] = await Promise.all([
        base44.entities.ExtensionToken.filter({ created_by: user.email }, "-generated_at", 10),
        base44.entities.ImportSyncLog.filter({ created_by: user.email }, "-sync_timestamp", 5),
        base44.entities.CreatorProfile.filter({ created_by: user.email }),
      ]);
      setAllTokens(tokens);
      setActiveToken(tokens.find(t => t.status === "active") || null);
      setRecentSync(syncLogs[0] || null);
      setProfile(profiles[0] || null);
    } catch (error) {
      console.error("Failed to load extension data:", error);
      toast.error("Failed to load extension settings");
    }
    setLoading(false);
  }

  async function handleGenerateToken() {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke("extensionAuthV2", {
        action: "generate",
      });
      setNewTokenDisplay({
        token: response.token,
        expires_at: response.expires_at,
        id: response.token_id,
      });
      setShowFullToken(true);
      toast.saved("Token generated successfully");
      await loadData();
    } catch (error) {
      console.error("Failed to generate token:", error);
      toast.error("Failed to generate token");
    }
    setGenerating(false);
  }

  async function handleRegenerateToken() {
    if (!confirm("Regenerate token? The old token will be revoked immediately.")) return;
    setGenerating(true);
    try {
      const response = await base44.functions.invoke("extensionAuthV2", {
        action: "regenerate",
      });
      setNewTokenDisplay({
        token: response.token,
        expires_at: response.expires_at,
        id: response.token_id,
      });
      setShowFullToken(true);
      toast.saved("Token regenerated. Old token revoked.");
      await loadData();
    } catch (error) {
      console.error("Failed to regenerate token:", error);
      toast.error("Failed to regenerate token");
    }
    setGenerating(false);
  }

  async function handleRevokeToken(tokenId) {
    if (!confirm("Revoke this token? The extension will no longer be able to sync.")) return;
    setRevoking(tokenId);
    try {
      await base44.functions.invoke("extensionAuthV2", {
        action: "revoke",
        revoke_id: tokenId,
      });
      toast.deleted("Token revoked");
      setNewTokenDisplay(null);
      await loadData();
    } catch (error) {
      console.error("Failed to revoke token:", error);
      toast.error("Failed to revoke token");
    }
    setRevoking(null);
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.saved(`${label} copied`);
    setTimeout(() => setCopied(null), 2000);
  }

  function maskToken(token) {
    return token.substring(0, 8) + "..." + token.substring(token.length - 4);
  }

  const appBaseUrl = window.location.origin;
  const extensionIntegrationId = activeToken?.id || "no-token";

  if (loading) {
    return (
      <div className="text-xs font-mono text-slate-600 py-8 text-center">
        Loading extension settings...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ─── 1. EXTENSION STATUS ─────────────────────────────────────────── */}
      <StatusSection
        activeToken={activeToken}
        recentSync={recentSync}
        onRegenerateClick={handleRegenerateToken}
      />

      {/* ─── 2. TOKEN MANAGEMENT ────────────────────────────────────────── */}
      {newTokenDisplay && (
        <TokenDisplayCard
          token={newTokenDisplay.token}
          expiresAt={newTokenDisplay.expires_at}
          showFull={showFullToken}
          onShowFull={() => setShowFullToken(!showFullToken)}
          onCopy={() => copyToClipboard(newTokenDisplay.token, "Token")}
          copied={copied === "Token"}
        />
      )}

      <TokenManagementSection
        activeToken={activeToken}
        onGenerate={handleGenerateToken}
        onRegenerate={handleRegenerateToken}
        onRevoke={handleRevokeToken}
        generating={generating}
        revoking={revoking}
        allTokens={allTokens}
      />

      {/* ─── 3. CONNECTION DETAILS ──────────────────────────────────────── */}
      <ConnectionDetailsSection
        baseUrl={appBaseUrl}
        profileId={profile?.id || "not-set"}
        integrationId={extensionIntegrationId}
        onCopy={copyToClipboard}
        copied={copied}
      />

      {/* ─── 4. SECURITY GUIDANCE ───────────────────────────────────────── */}
      <SecurityGuidanceSection />

      {/* ─── 5. RECENT SYNC SUMMARY ─────────────────────────────────────── */}
      {recentSync && <RecentSyncSection sync={recentSync} />}

      {/* ─── 6. TROUBLESHOOTING ─────────────────────────────────────────── */}
      <TroubleshootingSection activeToken={activeToken} recentSync={recentSync} />
    </div>
  );
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

function StatusSection({ activeToken, recentSync, onRegenerateClick }) {
  const isConnected = !!activeToken && activeToken.status === "active";
  const lastUsed = activeToken?.last_used_at
    ? new Date(activeToken.last_used_at).toLocaleDateString()
    : "never";
  const lastSyncStatus = recentSync?.status || "unknown";

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-4">
        // Extension Status
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Connection</div>
          <div className={`flex items-center gap-1.5 ${isConnected ? "text-green-400" : "text-red-400"}`}>
            {isConnected ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span className="font-black text-sm">{isConnected ? "Active" : "Inactive"}</span>
          </div>
        </div>

        <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Last Sync</div>
          <div className="text-xs font-mono text-slate-400">
            {recentSync
              ? new Date(recentSync.sync_timestamp).toLocaleDateString()
              : "never"}
          </div>
        </div>

        <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Sync Status</div>
          <div
            className={`text-xs font-black ${
              lastSyncStatus === "success"
                ? "text-green-400"
                : lastSyncStatus === "partial_success"
                  ? "text-yellow-400"
                  : "text-red-400"
            }`}
          >
            {lastSyncStatus}
          </div>
        </div>

        <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">Last Used</div>
          <div className="text-xs font-mono text-slate-400">{lastUsed}</div>
        </div>
      </div>

      {activeToken && (
        <div className="text-[9px] text-slate-600">
          Token generated {new Date(activeToken.generated_at).toLocaleDateString()} · Expires{" "}
          {new Date(activeToken.expires_at).toLocaleDateString()} · {activeToken.total_syncs} syncs ·{" "}
          {activeToken.total_sessions_imported} sessions imported
        </div>
      )}

      {isConnected && (
        <button
          onClick={onRegenerateClick}
          className="mt-3 flex items-center gap-2 text-xs font-mono uppercase px-4 py-2 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all"
        >
          <RotateCw className="w-3 h-3" /> Regenerate Token
        </button>
      )}
    </div>
  );
}

function TokenDisplayCard({ token, expiresAt, showFull, onShowFull, onCopy, copied }) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
      <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-2">
        ⚠ New Token Generated
      </div>
      <p className="text-xs text-slate-300 mb-3">
        Copy this token now and add it to your Chrome extension. You won't see it again.
      </p>
      <div className="bg-[#02040f] border border-yellow-500/40 rounded p-3 font-mono text-xs break-all text-slate-400 mb-2 min-h-12 flex items-center">
        {showFull ? token : "•".repeat(token.length)}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onShowFull}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded hover:bg-yellow-500/20 transition-all"
        >
          {showFull ? (
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
          onClick={onCopy}
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
        Expires: {new Date(expiresAt).toLocaleDateString()} at{" "}
        {new Date(expiresAt).toLocaleTimeString()}
      </p>
    </div>
  );
}

function TokenManagementSection({ activeToken, onGenerate, onRegenerate, onRevoke, generating, revoking, allTokens }) {
  if (!activeToken && allTokens.length === 0) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">
          // Token Management
        </div>
        <div className="bg-[#02040f] border border-cyan-900/20 rounded p-4 text-center mb-4">
          <div className="text-sm font-black uppercase text-slate-400 mb-2">No Token Generated</div>
          <p className="text-xs text-slate-600 mb-4">
            Generate a token to connect your Chrome extension to AltCtrl.
          </p>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-2.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono uppercase text-xs hover:bg-cyan-500/20 disabled:opacity-40 transition-all"
          >
            <Zap className="w-3.5 h-3.5" /> Generate First Token
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-4">
        // Token Management
      </div>

      {activeToken && (
        <div className="bg-[#02040f] border border-green-900/20 rounded p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-300">Active Token</span>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30">
              active
            </span>
          </div>
          <div className="text-[9px] text-slate-600 space-y-1 mb-3">
            <div>Generated: {new Date(activeToken.generated_at).toLocaleDateString()}</div>
            <div>Expires: {new Date(activeToken.expires_at).toLocaleDateString()}</div>
            {activeToken.last_used_at && (
              <div>Last used: {new Date(activeToken.last_used_at).toLocaleDateString()}</div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRegenerate}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono uppercase bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded hover:bg-yellow-500/20 disabled:opacity-40 transition-all"
            >
              <RotateCw className="w-3 h-3" /> Regenerate
            </button>
            <button
              onClick={() => onRevoke(activeToken.id)}
              disabled={revoking === activeToken.id}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono uppercase bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 disabled:opacity-40 transition-all"
            >
              <Trash2 className="w-3 h-3" /> Revoke
            </button>
          </div>
        </div>
      )}

      {allTokens.filter(t => t.status === "revoked").length > 0 && (
        <div>
          <div className="text-[9px] font-mono uppercase text-slate-600 mb-2">Revoked Tokens</div>
          <div className="space-y-1">
            {allTokens
              .filter(t => t.status === "revoked")
              .map(token => (
                <div key={token.id} className="bg-[#02040f] border border-slate-700/30 rounded p-2 opacity-60">
                  <div className="text-[9px] text-slate-600">
                    Revoked {new Date(token.revoked_at).toLocaleDateString()} · Created{" "}
                    {new Date(token.generated_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {!activeToken && allTokens.length > 0 && (
        <button
          onClick={onGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono uppercase text-xs hover:bg-cyan-500/20 disabled:opacity-40 transition-all"
        >
          <Zap className="w-3.5 h-3.5" /> Generate New Token
        </button>
      )}
    </div>
  );
}

function ConnectionDetailsSection({ baseUrl, profileId, integrationId, onCopy, copied }) {
  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-4">
        // Connection Details
      </div>
      <div className="space-y-3">
        <ConnectionDetail
          label="App Base URL"
          value={baseUrl}
          onCopy={() => onCopy(baseUrl, "URL")}
          copied={copied === "URL"}
        />
        <ConnectionDetail
          label="Creator Profile ID"
          value={profileId}
          onCopy={() => onCopy(profileId, "Profile ID")}
          copied={copied === "Profile ID"}
        />
        <ConnectionDetail
          label="Integration ID"
          value={integrationId}
          onCopy={() => onCopy(integrationId, "Integration ID")}
          copied={copied === "Integration ID"}
        />
      </div>
    </div>
  );
}

function ConnectionDetail({ label, value, onCopy, copied }) {
  return (
    <div className="bg-[#02040f] border border-cyan-900/20 rounded p-3">
      <div className="text-[9px] font-mono uppercase text-slate-600 mb-1">{label}</div>
      <div className="flex items-center gap-2 justify-between">
        <code className="text-xs text-slate-400 break-all flex-1">{value}</code>
        <button
          onClick={onCopy}
          className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase rounded transition-all shrink-0 ${
            copied
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}

function SecurityGuidanceSection() {
  return (
    <div className="bg-[#060d1f] border border-pink-900/30 rounded-lg p-5">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-pink-400 mb-2">
            Security Guidelines
          </div>
          <ul className="text-[9px] space-y-2 text-slate-400">
            <li className="flex gap-2">
              <span className="text-pink-400 shrink-0">•</span>
              <span>Your token acts like a password for the extension. Keep it secret.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-pink-400 shrink-0">•</span>
              <span>Never share your token in screenshots, emails, or with others.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-pink-400 shrink-0">•</span>
              <span>If exposed, revoke immediately from this panel and generate a new one.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-pink-400 shrink-0">•</span>
              <span>Revoked tokens stop working instantly. The extension will need re-auth.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-pink-400 shrink-0">•</span>
              <span>Tokens expire after 30 days. Regenerate regularly for security.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function RecentSyncSection({ sync }) {
  const statusColor =
    sync.status === "success"
      ? "text-green-400 bg-green-500/10"
      : sync.status === "partial_success"
        ? "text-yellow-400 bg-yellow-500/10"
        : "text-red-400 bg-red-500/10";

  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-4">
        // Most Recent Sync
      </div>
      <div className={`rounded border p-3 mb-3 ${statusColor}`}>
        <div className="flex items-center gap-2 mb-2">
          {sync.status === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : sync.status === "partial_success" ? (
            <Clock className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span className="font-black text-xs uppercase">{sync.status}</span>
          <span className="text-[9px] text-slate-600 ml-auto">
            {new Date(sync.sync_timestamp).toLocaleDateString()}{" "}
            {new Date(sync.sync_timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px]">
          <div>
            <span className="opacity-75">Created:</span> {sync.sessions_created}
          </div>
          <div>
            <span className="opacity-75">Updated:</span> {sync.sessions_updated}
          </div>
          <div>
            <span className="opacity-75">Skipped:</span> {sync.sessions_skipped}
          </div>
          <div>
            <span className="opacity-75">Failed:</span> {sync.sessions_failed}
          </div>
        </div>
      </div>
      {sync.error_code && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded p-2 text-[9px]">
          <span className="font-mono font-black">{sync.error_code}:</span> {sync.error_message}
        </div>
      )}
    </div>
  );
}

function TroubleshootingSection({ activeToken, recentSync }) {
  const issues = [];

  if (!activeToken) {
    issues.push({
      title: "No Active Token",
      desc: "Generate a token to connect your extension.",
      fix: "See Token Management section above.",
    });
  }

  if (activeToken && !recentSync) {
    issues.push({
      title: "Never Synced",
      desc: "Token generated but extension hasn't synced yet.",
      fix: "Paste the token into your Chrome extension and try syncing manually.",
    });
  }

  if (recentSync?.error_code === "INVALID_TOKEN") {
    issues.push({
      title: "Invalid Token",
      desc: "Extension token is rejected. It may be expired or malformed.",
      fix: "Regenerate a new token and update the extension.",
    });
  }

  if (recentSync?.token_issue === "revoked") {
    issues.push({
      title: "Token Revoked",
      desc: "This token was revoked. Extension cannot sync.",
      fix: "Generate a new token and add it to the extension.",
    });
  }

  if (recentSync?.sessions_failed > 0) {
    issues.push({
      title: "Some Sessions Failed",
      desc: `${recentSync.sessions_failed} sessions had validation errors in the last sync.`,
      fix: "Check the extension for malformed data (bad dates, negative numbers). Fix in extension settings.",
    });
  }

  if (!issues.length) {
    return (
      <div className="bg-[#060d1f] border border-green-900/30 rounded-lg p-5">
        <div className="flex items-center gap-2 text-green-400 mb-2">
          <CheckCircle2 className="w-4 h-4" />
          <div className="text-[10px] font-mono uppercase tracking-widest">All Systems Nominal</div>
        </div>
        <p className="text-[9px] text-slate-600">
          Extension is connected and syncing normally. No issues detected.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#060d1f] border border-yellow-900/30 rounded-lg p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 mb-4">
        // Troubleshooting
      </div>
      <div className="space-y-3">
        {issues.map((issue, i) => (
          <div key={i} className="bg-[#02040f] border border-yellow-900/20 rounded p-3">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[9px] font-mono font-black uppercase text-yellow-400">
                  {issue.title}
                </div>
                <p className="text-[9px] text-slate-500 mt-1">{issue.desc}</p>
              </div>
            </div>
            <div className="text-[9px] text-cyan-400 pl-6">→ {issue.fix}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
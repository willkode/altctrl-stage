import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import { Crown, Check, Loader2, ExternalLink, Zap } from "lucide-react";

const PRO_FEATURES = [
  "Full access to all 5 core modules",
  "AI-powered coaching",
  "Stream strategy generator",
  "Advanced analytics & trends",
  "Promo kit generator",
  "Weekly plans & experiments",
  "Game intel & challenges",
  "Priority support",
];

export default function Billing() {
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const justPurchased = urlParams.get("success") === "true";

  useEffect(() => { loadSubscription(); }, []);

  async function loadSubscription() {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("stripeCheckout", { action: "status" });
      setSub(res.data);
    } catch (e) {
      console.error("Failed to load subscription status:", e);
      setSub({ plan: "free", status: "none" });
    }
    setLoading(false);
  }

  async function handleUpgrade() {
    setCheckoutLoading(true);
    const res = await base44.functions.invoke("stripeCheckout", { action: "checkout" });
    if (res.data?.url) window.location.href = res.data.url;
    else setCheckoutLoading(false);
  }

  async function handleManage() {
    setPortalLoading(true);
    const res = await base44.functions.invoke("stripeCheckout", { action: "portal" });
    if (res.data?.url) window.location.href = res.data.url;
    else setPortalLoading(false);
  }

  const isPro = sub?.plan === "pro" && sub?.status === "active";
  const isCanceling = isPro && sub?.cancel_at_period_end;

  if (loading) return <PageContainer><LoadingState message="Loading billing..." /></PageContainer>;

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// BILLING</div>
        <h1 className="text-2xl font-black uppercase text-white">Subscription</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">Manage your ALT CTRL plan.</p>
      </div>

      {justPurchased && (
        <div className="mb-5 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-400">Welcome to Pro!</p>
            <p className="text-xs font-mono text-green-400/60">Your subscription is now active. All features are unlocked.</p>
          </div>
        </div>
      )}

      {/* Current plan status */}
      {isPro && (
        <div className="mb-6 bg-gradient-to-r from-yellow-950/30 to-[#060d1f] border border-yellow-500/20 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-black uppercase text-yellow-400">Pro Plan Active</span>
          </div>
          {sub?.current_period_end && (
            <p className="text-xs font-mono text-slate-500">
              {isCanceling ? "Access until" : "Next billing date"}:{" "}
              <span className="text-slate-400">{new Date(sub.current_period_end).toLocaleDateString()}</span>
            </p>
          )}
          {isCanceling && (
            <p className="text-xs font-mono text-yellow-400/70 mt-1">Your plan will downgrade to Free at the end of this period.</p>
          )}
          <button onClick={handleManage} disabled={portalLoading}
            className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-lg border border-cyan-900/30 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all disabled:opacity-50">
            {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
            Manage Subscription
          </button>
        </div>
      )}

      {/* Plan card */}
      <div className="max-w-md">
        <div className={`bg-[#060d1f] border rounded-xl p-6 relative overflow-hidden ${isPro ? "border-yellow-500/30" : "border-cyan-500/30"}`}>
          {isPro && (
            <div className="absolute top-0 right-0 bg-yellow-500 text-[#02040f] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg">
              Active
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black uppercase text-white">Pro</h3>
                <Crown className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-black text-white mt-1">$25<span className="text-sm font-normal text-slate-500">/mo</span></p>
            </div>
          </div>
          <ul className="space-y-2.5 mb-6">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                <Check className="w-3.5 h-3.5 text-yellow-400 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          {!isPro && (
            <button onClick={handleUpgrade} disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3.5 rounded-lg text-sm hover:bg-cyan-300 transition-all disabled:opacity-50">
              {checkoutLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Zap className="w-4 h-4" /> Upgrade to Pro</>}
            </button>
          )}
          {isPro && (
            <button onClick={handleManage} disabled={portalLoading}
              className="w-full flex items-center justify-center gap-2 border border-cyan-900/30 text-slate-400 font-mono uppercase tracking-widest py-3 rounded-lg text-xs hover:text-cyan-400 hover:border-cyan-500/30 transition-all disabled:opacity-50">
              {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
              Manage in Stripe
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
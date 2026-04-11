import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function AppAuthGate() {
  const [status, setStatus] = useState("loading"); // loading | approved | pending | past_due
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle post-login redirects (e.g. extension-auth flow)
    const redirect = sessionStorage.getItem("post_login_redirect");
    if (redirect) {
      sessionStorage.removeItem("post_login_redirect");
      window.location.replace(redirect);
      return;
    }
    base44.auth.me().then(async (user) => {
      if (!user) {
        setStatus("pending");
        return;
      }
      // Allow billing page always so users can fix payment
      const isBillingPage = location.pathname === "/app/billing";
      if (isBillingPage) {
        setStatus("approved");
        return;
      }
      // Check subscription status
        try {
          const res = await base44.functions.invoke("stripeCheckout", { action: "status" });
          const { plan, status: subStatus } = res.data || {};
          if (subStatus === "past_due") {
            setStatus("past_due");
            return;
          }
          if (plan !== "pro" || subStatus !== "active") {
            setStatus("no_subscription");
            return;
          }
        } catch (e) {
          console.warn("Subscription status check failed:", e);
        }
        setStatus("approved");
        // Redirect to dashboard on first login if at /app root
        if (location.pathname === "/app" || location.pathname === "/app/") {
          navigate("/app/dashboard", { replace: true });
        }
    }).catch(() => setStatus("pending"));
  }, []);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-cyan-900 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "no_subscription") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#020408] px-4">
        <div className="max-w-md w-full text-center">
          <div className="relative z-10 bg-[#060d1f] border border-cyan-500/30 rounded-xl p-10"
            style={{ boxShadow: "0 0 40px rgba(0,245,255,0.06)" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60 rounded-t-xl" />
            <div className="inline-flex items-center gap-2 border border-cyan-400/30 bg-cyan-400/5 rounded px-3 py-1.5 mb-6">
              <span className="w-2 h-2 bg-cyan-400 rounded-full" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">// SUBSCRIPTION REQUIRED</span>
            </div>
            <h1 className="text-3xl font-black uppercase text-white mb-3">Get Full Access</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              AltCtrl requires an active <span className="text-cyan-400 font-semibold">Pro subscription</span> to access the creator dashboard. Subscribe to unlock all features.
            </p>
            <div className="space-y-3">
              <Link to="/app/billing"
                className="block w-full font-black uppercase tracking-widest py-3.5 rounded text-sm text-center transition-all"
                style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408" }}>
                Subscribe — $25/mo
              </Link>
              <button onClick={() => base44.auth.logout("/")}
                className="block w-full font-mono uppercase tracking-widest py-3 rounded text-xs text-center border border-cyan-900/40 text-slate-500 hover:text-slate-300 transition-all">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "past_due") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#020408] px-4">
        <div className="max-w-md w-full text-center">
          <div className="relative z-10 bg-[#060d1f] border border-red-500/30 rounded-xl p-10"
            style={{ boxShadow: "0 0 40px rgba(255,0,0,0.06)" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 rounded-t-xl" />
            <div className="inline-flex items-center gap-2 border border-red-500/30 bg-red-500/5 rounded px-3 py-1.5 mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-red-400">// PAYMENT FAILED</span>
            </div>
            <h1 className="text-3xl font-black uppercase text-white mb-3">Subscription Paused</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your last payment failed. Please update your payment method to continue using AltCtrl.
            </p>
            <div className="space-y-3">
              <Link to="/app/billing"
                className="block w-full font-black uppercase tracking-widest py-3.5 rounded text-sm text-center transition-all"
                style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408" }}>
                Update Payment Method
              </Link>
              <button onClick={() => base44.auth.logout("/")}
                className="block w-full font-mono uppercase tracking-widest py-3 rounded text-xs text-center border border-cyan-900/40 text-slate-500 hover:text-slate-300 transition-all">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#020408] px-4">
        <div className="max-w-md w-full text-center">
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,0,128,0.08) 0%, transparent 70%)" }} />

          <div className="relative z-10 bg-[#060d1f] border border-pink-500/30 rounded-xl p-10"
            style={{ boxShadow: "0 0 40px rgba(255,0,128,0.06)" }}>
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-60 rounded-t-xl" />

            <div className="inline-flex items-center gap-2 border border-yellow-400/30 bg-yellow-400/5 rounded px-3 py-1.5 mb-6">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-yellow-400">// APPLICATION PENDING</span>
            </div>

            <h1 className="text-3xl font-black uppercase text-white mb-3">Access Restricted</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              AltCtrl is currently in <span className="text-pink-400 font-semibold">closed beta</span>. Your account is awaiting approval from our team.
            </p>
            <p className="text-slate-500 text-xs font-mono mb-8">
              Once approved, you'll get full access to the creator dashboard. We review applications manually and will notify you by email.
            </p>

            <div className="space-y-3">
              <Link to="/founding-creators"
                className="block w-full font-black uppercase tracking-widest py-3.5 rounded text-sm text-center transition-all"
                style={{ background: "linear-gradient(135deg, #00f5ff 0%, #0099aa 100%)", color: "#020408" }}>
                View Founding Creator Info
              </Link>
              <button onClick={() => base44.auth.logout("/")}
                className="block w-full font-mono uppercase tracking-widest py-3 rounded text-xs text-center border border-cyan-900/40 text-slate-500 hover:text-slate-300 transition-all">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
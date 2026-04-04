import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Radio, TrendingUp, Brain, Bell, User, Menu, X, Zap, Settings as Settings2Icon, PlayCircle, ClipboardList, Film, Users, FlaskConical, ShieldAlert, Sparkles, Crosshair } from "lucide-react";
import GlitchText from "./GlitchText";
import { useCreatorBootstrap } from "../hooks/useCreatorBootstrap";
import { base44 } from "@/api/base44Client";
import Onboarding from "../pages/app/Onboarding";
import LoadingState from "./app/LoadingState";
import AppToaster from "./app/AppToaster";
import QuickActions from "./app/QuickActions";
import StreamDrawer from "./app/drawers/StreamDrawer";
import LogSessionDrawer from "./app/drawers/LogSessionDrawer";

const navItems = [
  { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/schedule", label: "Schedule", icon: Calendar },
  { path: "/app/promo", label: "Promo", icon: Radio },
  { path: "/app/analytics", label: "Analytics", icon: TrendingUp },
  { path: "/app/coach", label: "Coach", icon: Brain },
  { path: "/app/strategy", label: "Strategy", icon: Crosshair },
  { path: "/app/golive", label: "Go Live", icon: PlayCircle },
  { path: "/app/debrief", label: "Debrief", icon: ClipboardList },
  { path: "/app/replay", label: "Replay", icon: Film },
  { path: "/app/audience", label: "Audience", icon: Users },
  { path: "/app/experiments", label: "Experiments", icon: FlaskConical },
];

const pageTitles = {
  "/app/dashboard": "DASHBOARD",
  "/app/schedule": "SCHEDULE",
  "/app/promo": "PROMO",
  "/app/analytics": "ANALYTICS",
  "/app/coach": "COACH",
  "/app/notifications": "NOTIFICATIONS",
  "/app/profile": "PROFILE",
  "/app/settings": "SETTINGS",
  "/app/golive": "GO LIVE OPS",
  "/app/debrief": "POST-LIVE DEBRIEF",
  "/app/strategy": "STREAM STRATEGY",
  "/app/replay": "REPLAY REVIEW",
  "/app/audience": "AUDIENCE & MONETIZATION",
  "/app/experiments": "EXPERIMENTS",
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = pageTitles[location.pathname] || "ALTCTRL";
  const { profile, loading, completeOnboarding } = useCreatorBootstrap();
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => {
      setIsAdmin(user.role === 'admin');
      base44.entities.PerformanceAlert.filter({ created_by: user.email, dismissed: false, read: false }, '-created_date', 50)
        .then(alerts => setUnreadCount(alerts.length))
        .catch(() => {});
    }).catch(() => {});
  }, [location.pathname]);

  const handleQuickAction = (event) => {
    if (event === "add-stream") setActiveDrawer("stream");
    else if (event === "log-session") setActiveDrawer("session");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040f] flex items-center justify-center">
        <LoadingState message="Initializing system..." />
      </div>
    );
  }

  if (profile && !profile.onboarding_completed) {
    return <Onboarding onComplete={async (data) => { await completeOnboarding(data); navigate("/app/dashboard"); }} />;
  }

  return (
    <div className="min-h-screen bg-[#02040f] text-white flex flex-col">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)",
      }} />

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-cyan-900/40 bg-[#02040f]/95 backdrop-blur-sm flex items-center px-4 gap-4">
        {/* Mobile menu toggle */}
        <button className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo — desktop */}
        <Link to="/app/dashboard" className="hidden md:flex items-center shrink-0 w-56">
          <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/9e338f22f_altctrl-logo2.png" alt="AltCtrl" className="h-7 w-auto" />
        </Link>

        {/* Page title */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-cyan-400 font-mono text-xs hidden md:inline">// </span>
          <GlitchText text={pageTitle} className="text-sm font-black uppercase tracking-widest text-white" tag="span" />
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/app/admin/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded border border-red-900/40 hover:border-red-500/40 text-red-500 hover:text-red-400 transition-all"
              title="Admin Panel">
              <ShieldAlert className="w-4 h-4" />
            </Link>
          )}
          <Link to="/app/notifications"
            className="relative w-9 h-9 flex items-center justify-center rounded border border-cyan-900/40 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 transition-all">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-pink-500 rounded-full" style={{ boxShadow: "0 0 4px #ff0080" }} />
            )}
          </Link>
          <Link to="/app/profile"
            className="w-9 h-9 flex items-center justify-center rounded border border-cyan-900/40 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 transition-all">
            <User className="w-4 h-4" />
          </Link>
          <Link to="/app/settings"
            className="hidden md:flex w-9 h-9 items-center justify-center rounded border border-cyan-900/40 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 transition-all">
            <Settings2Icon className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col fixed top-16 left-0 bottom-0 w-56 border-r border-cyan-900/40 bg-[#02040f] z-30">
          <nav className="flex-1 py-4 space-y-1 px-3">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link key={path} to={path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-mono uppercase tracking-widest transition-all ${
                    active
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}>
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-cyan-400" : ""}`} />
                  {label}
                  {active && <span className="ml-auto w-1 h-1 rounded-full bg-cyan-400" style={{ boxShadow: "0 0 4px #00f5ff" }} />}
                </Link>
              );
            })}
          </nav>


          <div className="px-3 pb-6 mt-2">
            <div className="border border-cyan-900/30 rounded p-3 text-xs font-mono text-slate-600">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3 h-3 text-cyan-900" />
                <span className="text-cyan-900 uppercase tracking-widest">Beta</span>
              </div>
              <span>Signal active. System nominal.</span>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed top-16 left-0 bottom-0 w-64 bg-[#02040f] border-r border-cyan-900/40 z-40 md:hidden flex flex-col">
              <nav className="flex-1 py-4 space-y-1 px-3">
                {navItems.map(({ path, label, icon: Icon }) => {
                  const active = location.pathname === path;
                  return (
                    <Link key={path} to={path} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded text-sm font-mono uppercase tracking-widest transition-all ${
                        active ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-500 hover:text-white border border-transparent"
                      }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 md:ml-56 min-h-full pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-cyan-900/40 bg-[#02040f]/95 backdrop-blur-sm flex">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-mono uppercase transition-all ${
                active ? "text-cyan-400" : "text-slate-600 hover:text-slate-400"
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] tracking-widest">{label}</span>
              {active && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Global shared tools */}
      <QuickActions onAction={handleQuickAction} />
      <AppToaster />
      <StreamDrawer open={activeDrawer === "stream"} onClose={() => setActiveDrawer(null)} />
      <LogSessionDrawer open={activeDrawer === "session"} onClose={() => setActiveDrawer(null)} />
    </div>
  );
}
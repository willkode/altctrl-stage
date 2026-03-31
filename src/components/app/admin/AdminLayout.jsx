import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Zap, Activity, AlertCircle, CheckSquare, Database, Settings, Users, Menu, X } from "lucide-react";

const ADMIN_NAV = [
  { label: "Dashboard", path: "/app/admin/dashboard", icon: LayoutDashboard },
  { label: "Extensions", path: "/app/admin/extensions", icon: Zap },
  { label: "Import Logs", path: "/app/admin/imports", icon: Activity },
  { label: "Manual Review", path: "/app/admin/review", icon: CheckSquare },
  { label: "Session Inspection", path: "/app/admin/sessions", icon: Database },
  { label: "Error Center", path: "/app/admin/errors", icon: AlertCircle },
  { label: "Creator Support", path: "/app/admin/support", icon: Users },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1 hover:bg-muted rounded transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                // ADMIN CENTER
              </div>
              <h1 className="text-lg font-black uppercase text-foreground">AltCtrl Admin</h1>
            </div>
          </div>
          <Link
            to="/app/dashboard"
            className="text-xs font-mono px-4 py-2 rounded border border-border hover:bg-muted transition-colors"
          >
            ← Creator App
          </Link>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 min-h-screen bg-card border-r border-border p-4 space-y-2 fixed lg:relative z-30 lg:z-auto left-0 top-16 lg:top-0">
            <nav className="space-y-1">
              {ADMIN_NAV.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded transition-all text-sm font-mono uppercase text-xs ${
                      isActive
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : "text-muted-foreground hover:bg-muted border border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 min-h-screen">
          {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="lg:hidden fixed inset-0 z-20 bg-black/20" />}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
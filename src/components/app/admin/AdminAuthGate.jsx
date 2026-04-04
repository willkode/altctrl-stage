import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { AlertTriangle } from "lucide-react";

export default function AdminAuthGate({ children }) {
  const [authorized, setAuthorized] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setAuthorized(currentUser?.role === "admin");
    } catch (error) {
      setAuthorized(false);
    }
  }

  if (authorized === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-4">
            You do not have permission to access the Admin Center. Only admins can view this area.
          </p>
          <a
            href="/app/dashboard"
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
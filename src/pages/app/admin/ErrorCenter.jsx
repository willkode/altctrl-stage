import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../../../components/app/admin/AdminLayout";

export default function ErrorCenter() {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadErrors();
  }, []);

  async function loadErrors() {
    setLoading(true);
    try {
      const logs = await base44.asServiceRole.entities.ImportSyncLog.list("-sync_timestamp", 500);
      const errorMap = {};
      
      logs.forEach(log => {
        if (log.error_code) {
          if (!errorMap[log.error_code]) {
            errorMap[log.error_code] = {
              code: log.error_code,
              count: 0,
              message: log.error_message,
              lastSeen: log.sync_timestamp,
              recentLogs: [],
            };
          }
          errorMap[log.error_code].count++;
          errorMap[log.error_code].recentLogs.push({
            timestamp: log.sync_timestamp,
            creator: log.created_by,
            message: log.error_message,
          });
        }
      });

      // Limit recent logs per error
      Object.values(errorMap).forEach(err => {
        err.recentLogs = err.recentLogs.slice(0, 5);
      });

      setErrors(errorMap);
    } catch (error) {
      console.error("Failed to load errors:", error);
    }
    setLoading(false);
  }

  const sortedErrors = Object.values(errors).sort((a, b) => b.count - a.count);

  const errorCategories = {
    "Authentication": ["INVALID_TOKEN", "AUTH_FAILED", "TOKEN_EXPIRED", "TOKEN_REVOKED"],
    "Validation": ["MISSING_FIELD", "INVALID_PAYLOAD", "MALFORMED_ROW", "VALIDATION_ERROR"],
    "Data Quality": ["invalid_date", "field_validation_failed"],
    "System": ["INTERNAL_ERROR"],
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Analyzing errors...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black uppercase mb-2">Error Center</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Clustered view of recurring ingestion issues and error patterns.
          </p>
        </div>

        {sortedErrors.length === 0 ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 text-center">
            <div className="text-green-400 font-black uppercase text-sm mb-2">No Errors</div>
            <p className="text-sm text-green-400/60">System is running smoothly.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(errorCategories).map(([category, codes]) => {
              const categoryErrors = sortedErrors.filter(e => codes.includes(e.code));
              if (categoryErrors.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="font-black uppercase text-sm text-foreground mb-3">{category}</h2>
                  <div className="space-y-3">
                    {categoryErrors.map(error => (
                      <div key={error.code} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <code className="text-sm font-mono text-red-400">{error.code}</code>
                            <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-foreground">{error.count}</div>
                            <p className="text-[9px] text-muted-foreground">occurrences</p>
                          </div>
                        </div>

                        {error.recentLogs.length > 0 && (
                          <div className="bg-muted/50 rounded p-2 mt-3">
                            <p className="text-[9px] font-mono uppercase text-muted-foreground mb-2">Recent</p>
                            <div className="space-y-1 text-[9px] font-mono text-muted-foreground">
                              {error.recentLogs.map((log, i) => (
                                <div key={i} className="flex justify-between">
                                  <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                                  <span className="text-slate-500">{log.creator.substring(0, 20)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
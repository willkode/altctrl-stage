/**
 * ============================================================
 * DEBUG PANEL — components/app/DebugPanel.jsx
 * ============================================================
 * 
 * Admin-only floating debug panel for inspecting:
 *   - Recent errors & warnings
 *   - Breadcrumbs (user actions before crash)
 *   - Current route, user, env info
 *   - Failed requests
 * 
 * Toggle with keyboard shortcut: Ctrl+Shift+D
 * Only renders for admin users in debug mode.
 * 
 * Error details can be copied to clipboard for bug reports.
 * ============================================================
 */

import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";
import { base44 } from "@/api/base44Client";
import { X, Copy, Trash2, Bug, ChevronDown, ChevronRight } from "lucide-react";

function Badge({ color, children }) {
  const colors = {
    red: "bg-red-500/15 text-red-400 border-red-500/30",
    yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    slate: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  };
  return (
    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
}

function ErrorEntry({ entry, idx }) {
  const [expanded, setExpanded] = useState(false);
  const ts = entry.timestamp?.slice(11, 19) || '';
  const levelColor = entry.level === 'error' ? 'red' : entry.level === 'warn' ? 'yellow' : 'cyan';

  const copyEntry = () => {
    const text = JSON.stringify(entry, null, 2);
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="border-b border-slate-800/50 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-3 py-2 hover:bg-white/[0.02] transition-colors flex items-start gap-2"
      >
        {expanded ? <ChevronDown className="w-3 h-3 text-slate-600 mt-0.5 shrink-0" /> : <ChevronRight className="w-3 h-3 text-slate-600 mt-0.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge color={levelColor}>{entry.level}</Badge>
            <span className="text-[9px] font-mono text-slate-700">{ts}</span>
          </div>
          <p className="text-[11px] font-mono text-slate-300 truncate">{entry.message}</p>
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 pl-8 space-y-2">
          {entry.route && (
            <div><span className="text-[9px] font-mono text-slate-600">Route:</span> <span className="text-[10px] font-mono text-slate-400">{entry.route}</span></div>
          )}
          {entry.error?.stack && (
            <pre className="text-[9px] font-mono text-slate-600 whitespace-pre-wrap break-all max-h-32 overflow-y-auto bg-[#02040f] rounded p-2 border border-slate-800">
              {entry.error.stack}
            </pre>
          )}
          {entry.context && Object.keys(entry.context).length > 0 && (
            <pre className="text-[9px] font-mono text-slate-600 whitespace-pre-wrap break-all max-h-32 overflow-y-auto bg-[#02040f] rounded p-2 border border-slate-800">
              {JSON.stringify(entry.context, null, 2)}
            </pre>
          )}
          <button onClick={copyEntry} className="flex items-center gap-1 text-[9px] font-mono uppercase text-cyan-400 hover:text-cyan-300">
            <Copy className="w-3 h-3" /> Copy
          </button>
        </div>
      )}
    </div>
  );
}

export default function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('errors');
  const [isAdmin, setIsAdmin] = useState(false);
  const [history, setHistory] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check admin status on mount
  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin')).catch(() => {});
  }, []);

  // Only available in debug mode for admin users
  const canShow = isAdmin && logger.isDebug();

  // Keyboard shortcut: Ctrl+Shift+D
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      if (canShow) setOpen(o => !o);
    }
  }, [canShow]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Refresh data when panel opens
  useEffect(() => {
    if (open) {
      setHistory(logger.getHistory());
      setBreadcrumbs(logger.getBreadcrumbs());
    }
  }, [open, refreshKey]);

  if (!canShow) return null;

  const errors = history.filter(h => h.level === 'error');
  const warnings = history.filter(h => h.level === 'warn');

  const copyAll = () => {
    const payload = {
      errors: history,
      breadcrumbs,
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      correlationId: logger.getCorrelationId(),
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  };

  return (
    <>
      {/* FAB trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 md:bottom-4 left-4 z-[70] w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all shadow-lg"
          title="Debug Panel (Ctrl+Shift+D)"
        >
          <Bug className="w-4 h-4" />
          {errors.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
              {errors.length > 9 ? '9+' : errors.length}
            </span>
          )}
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-y-0 left-0 w-full max-w-md z-[80] bg-[#060d1f] border-r border-cyan-900/40 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-900/30">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">Debug Panel</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setRefreshKey(k => k + 1)} className="text-[9px] font-mono uppercase text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded border border-cyan-900/30 hover:border-cyan-500/30 transition-all">
                Refresh
              </button>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Environment info */}
          <div className="px-4 py-2 border-b border-cyan-900/20 grid grid-cols-2 gap-2 text-[9px] font-mono">
            <div><span className="text-slate-600">Route:</span> <span className="text-cyan-400">{window.location.pathname}</span></div>
            <div><span className="text-slate-600">Correlation:</span> <span className="text-slate-400">{logger.getCorrelationId().slice(0, 10)}</span></div>
            <div><span className="text-slate-600">Errors:</span> <span className="text-red-400">{errors.length}</span></div>
            <div><span className="text-slate-600">Warnings:</span> <span className="text-yellow-400">{warnings.length}</span></div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-cyan-900/20">
            {[
              { key: 'errors', label: `Errors (${errors.length})` },
              { key: 'all', label: `All (${history.length})` },
              { key: 'breadcrumbs', label: `Trail (${breadcrumbs.length})` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-2 text-[9px] font-mono uppercase tracking-widest transition-all border-b-2 ${
                  tab === t.key ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-600 hover:text-slate-400'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {tab === 'errors' && (
              errors.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-600">No errors captured yet</div>
              ) : (
                errors.slice().reverse().map((e, i) => <ErrorEntry key={e.id || i} entry={e} idx={i} />)
              )
            )}
            {tab === 'all' && (
              history.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-600">No logs captured yet</div>
              ) : (
                history.slice().reverse().map((e, i) => <ErrorEntry key={e.id || i} entry={e} idx={i} />)
              )
            )}
            {tab === 'breadcrumbs' && (
              breadcrumbs.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-600">No breadcrumbs yet</div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {breadcrumbs.slice().reverse().map((b, i) => (
                    <div key={i} className="px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-mono text-slate-700">{b.timestamp?.slice(11, 19)}</span>
                        <span className="text-[10px] font-mono text-slate-300">{b.action}</span>
                      </div>
                      {b.route && <span className="text-[9px] font-mono text-slate-600">{b.route}</span>}
                      {b.data && (
                        <pre className="text-[9px] font-mono text-slate-600 mt-1 truncate">{JSON.stringify(b.data)}</pre>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Footer actions */}
          <div className="px-4 py-3 border-t border-cyan-900/30 flex gap-2">
            <button onClick={copyAll}
              className="flex-1 flex items-center justify-center gap-1.5 text-[9px] font-mono uppercase tracking-widest px-3 py-2 rounded border border-cyan-900/30 text-cyan-400 hover:bg-cyan-500/10 transition-all">
              <Copy className="w-3 h-3" /> Copy All
            </button>
            <button onClick={() => { logger.clearHistory(); setRefreshKey(k => k + 1); }}
              className="flex items-center justify-center gap-1.5 text-[9px] font-mono uppercase tracking-widest px-3 py-2 rounded border border-red-900/30 text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>
      )}
    </>
  );
}
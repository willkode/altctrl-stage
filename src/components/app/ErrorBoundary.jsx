/**
 * ============================================================
 * ERROR BOUNDARY — components/app/ErrorBoundary.jsx
 * ============================================================
 * 
 * Catches React render errors so a broken component doesn't crash
 * the entire app. Shows a clean fallback UI.
 * 
 * In debug mode, shows an expandable stack trace section.
 * Logs the crash via the centralized logger + persists to ErrorLog.
 * 
 * Usage:
 *   <ErrorBoundary name="Dashboard">
 *     <Dashboard />
 *   </ErrorBoundary>
 * ============================================================
 */

import { Component } from "react";
import { logger } from "@/lib/logger";
import { logErrorToDb } from "@/lib/errorLogger";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const componentName = this.props.name || 'Unknown';
    const { message, stack } = logger.normalizeError(error);

    logger.error(`[ErrorBoundary:${componentName}] Component crashed: ${message}`, {
      source: 'ErrorBoundary',
      componentName,
      componentStack: errorInfo?.componentStack?.slice(0, 1500),
      stack,
    });

    logErrorToDb(`Component crash in ${componentName}: ${message}`, {
      stack,
      errorType: 'component_crash',
      severity: 'error',
      extra: {
        componentName,
        componentStack: errorInfo?.componentStack?.slice(0, 1500),
      },
    });

    this.setState({ errorInfo });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, errorInfo } = this.state;
    const isDebug = logger.isDebug();
    const componentName = this.props.name || 'Component';

    return (
      <div className="p-6 max-w-2xl mx-auto mt-12">
        <div className="bg-[#0a0f1f] border border-red-500/30 rounded-xl p-6 space-y-4">
          {/* User-friendly message */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-lg">
              ⚠
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-red-400">
                Something went wrong
              </h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                {componentName} encountered an error. Try refreshing the page.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest hover:bg-cyan-500/15 transition-all"
            >
              Refresh Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="px-4 py-2 rounded bg-slate-500/10 border border-slate-500/30 text-slate-400 text-xs font-mono uppercase tracking-widest hover:bg-slate-500/15 transition-all"
            >
              Try Again
            </button>
          </div>

          {/* Debug details — only in debug mode */}
          {isDebug && error && (
            <details className="mt-4">
              <summary className="text-[10px] font-mono uppercase tracking-widest text-slate-600 cursor-pointer hover:text-slate-400 transition-colors">
                Developer Details
              </summary>
              <div className="mt-3 space-y-3">
                <div className="bg-[#02040f] rounded-lg p-3 border border-red-900/30">
                  <p className="text-[10px] font-mono uppercase text-red-400 mb-1">Error</p>
                  <p className="text-xs font-mono text-slate-300 break-all">{error.message || String(error)}</p>
                </div>
                {error.stack && (
                  <div className="bg-[#02040f] rounded-lg p-3 border border-slate-800">
                    <p className="text-[10px] font-mono uppercase text-slate-600 mb-1">Stack Trace</p>
                    <pre className="text-[10px] font-mono text-slate-500 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div className="bg-[#02040f] rounded-lg p-3 border border-slate-800">
                    <p className="text-[10px] font-mono uppercase text-slate-600 mb-1">Component Stack</p>
                    <pre className="text-[10px] font-mono text-slate-500 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }
}
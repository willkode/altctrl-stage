import ReactMarkdown from "react-markdown";
import { Brain } from "lucide-react";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  if (!message.content) return null;

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-lg bg-yellow-400/10 flex items-center justify-center shrink-0 mt-0.5">
          <Brain className="w-3 h-3 text-yellow-400" />
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? "order-first" : ""}`}>
        <div className={`rounded-2xl px-4 py-2.5 ${
          isUser
            ? "bg-cyan-500/10 border border-cyan-500/20 text-white"
            : "bg-[#02040f] border border-white/[0.04] text-slate-300"
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                p: ({ children }) => <p className="my-1.5 leading-relaxed text-slate-300">{children}</p>,
                strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                ul: ({ children }) => <ul className="my-1.5 ml-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="my-1.5 ml-3 space-y-1 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="text-slate-400 text-sm leading-relaxed">
                  <span className="text-cyan-400/40 mr-1">•</span>{children}
                </li>,
                h1: ({ children }) => <h1 className="text-base font-black text-white my-2 uppercase">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-white my-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold text-slate-300 my-1.5">{children}</h3>,
                code: ({ inline, children }) => inline
                  ? <code className="px-1.5 py-0.5 rounded bg-cyan-900/20 text-cyan-400 text-xs font-mono">{children}</code>
                  : <pre className="bg-[#060d1f] border border-cyan-900/20 rounded-lg p-3 my-2 overflow-x-auto"><code className="text-xs font-mono text-slate-400">{children}</code></pre>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-yellow-400/30 pl-3 my-2 text-slate-500 italic">{children}</blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Tool calls */}
        {message.tool_calls?.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {message.tool_calls.map((tc, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#02040f] border border-cyan-900/10 text-[10px] font-mono text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/30" />
                {tc.name?.split(".").pop() || "function"} {tc.status === "completed" ? "✓" : tc.status === "running" ? "…" : ""}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
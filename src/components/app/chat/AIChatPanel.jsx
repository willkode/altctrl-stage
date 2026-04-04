import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Loader2, Brain, Trash2 } from "lucide-react";
import ChatMessage from "./ChatMessage";

export default function AIChatPanel({ open, onClose }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);
  const [contextLoaded, setContextLoaded] = useState(false);
  const [contextSummary, setContextSummary] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open) loadConversations();
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadConversations() {
    setLoadingConv(true);
    const list = await base44.agents.listConversations({ agent_name: "AI_COACH" });
    setConversations(list || []);
    if (list?.length > 0) {
      await loadConversation(list[0].id);
    }
    setLoadingConv(false);
  }

  async function loadConversation(convId) {
    const conv = await base44.agents.getConversation(convId);
    setActiveConv(conv);
    setMessages(conv.messages || []);
  }

  async function startNewConversation() {
    const conv = await base44.agents.createConversation({
      agent_name: "AI_COACH",
      metadata: { name: `Chat ${new Date().toLocaleDateString()}` },
    });
    setActiveConv(conv);
    setMessages([]);
    setConversations(c => [conv, ...c]);
    setContextLoaded(false);
    setContextSummary(null);
  }

  async function loadContext() {
    if (contextLoaded) return;
    setContextLoaded(true);
    const res = await base44.functions.invoke("buildCreatorContext", { scope: "full" });
    const ctx = res.data;
    setContextSummary({
      sessions: ctx.confidence?.sessions_available || 0,
      confidence: ctx.confidence?.overall || "none",
      tiktok: ctx.connection_health?.tiktok_connected ? "connected" : "disconnected",
    });

    // Inject context as a system-style user message
    const contextMsg = buildContextMessage(ctx);
    if (activeConv && (!messages || messages.length === 0)) {
      await base44.agents.addMessage(activeConv, {
        role: "user",
        content: contextMsg,
      });
    }
  }

  function buildContextMessage(ctx) {
    const parts = ["Here is my current creator data context. Use this to answer my questions:\n"];

    if (ctx.profile) {
      parts.push(`**Profile:** ${ctx.profile.display_name || "Unknown"}, primary game: ${ctx.profile.primary_game || "not set"}, goal: ${ctx.profile.stream_goal || "not set"}, weekly target: ${ctx.profile.weekly_stream_target || 3} streams`);
    }

    if (ctx.baselines) {
      parts.push(`**Baselines (median of last 10):** Avg viewers: ${ctx.baselines.avg_viewers_median ?? "—"}, Peak: ${ctx.baselines.peak_viewers_median ?? "—"}, Followers/session: ${ctx.baselines.followers_gained_median ?? "—"}, Duration: ${ctx.baselines.duration_median ?? "—"}min`);
    }

    if (ctx.recent_5?.length) {
      parts.push(`**Last 5 sessions:**`);
      ctx.recent_5.forEach(s => {
        parts.push(`- ${s.stream_date} | ${s.game || "?"} | avg:${s.avg_viewers ?? "?"} peak:${s.peak_viewers ?? "?"} | score:${s.session_score ?? "?"} | ${s.promo_posted ? "promo ✓" : "no promo"}`);
      });
    }

    if (ctx.patterns?.by_game) {
      const games = Object.entries(ctx.patterns.by_game)
        .filter(([, v]) => v.sample_size >= 2)
        .sort(([, a], [, b]) => (b.median_session_score || 0) - (a.median_session_score || 0))
        .slice(0, 5);
      if (games.length) {
        parts.push(`**Game patterns:**`);
        games.forEach(([g, d]) => {
          parts.push(`- ${g}: score ${d.median_session_score?.toFixed(2) || "?"}, ${d.sample_size}× sessions, avg viewers ${d.median_avg_viewers ?? "?"} (${d.confidence})`);
        });
      }
    }

    if (ctx.patterns?.by_weekday) {
      const days = Object.entries(ctx.patterns.by_weekday)
        .filter(([, v]) => v.sample_size >= 2)
        .sort(([, a], [, b]) => (b.median_session_score || 0) - (a.median_session_score || 0));
      if (days.length) {
        parts.push(`**Day patterns:**`);
        days.forEach(([d, data]) => {
          parts.push(`- ${d}: score ${data.median_session_score?.toFixed(2) || "?"}, ${data.sample_size}× (${data.confidence})`);
        });
      }
    }

    if (ctx.goals?.length) {
      parts.push(`**Active goals:**`);
      ctx.goals.forEach(g => {
        parts.push(`- ${g.title || g.goal_type}: ${g.current_value || 0}/${g.target_value} ${g.unit || ""} (${g.period})`);
      });
    }

    if (ctx.weekly_plan) {
      parts.push(`**This week's plan:** Target ${ctx.weekly_plan.stream_target || "?"} streams, focus: ${ctx.weekly_plan.focus_note || "not set"}`);
    }

    if (ctx.upcoming_streams?.length) {
      parts.push(`**Upcoming streams:**`);
      ctx.upcoming_streams.slice(0, 5).forEach(s => {
        parts.push(`- ${s.scheduled_date} ${s.start_time || ""} | ${s.game} (${s.stream_type})`);
      });
    }

    if (ctx.active_experiments?.length) {
      parts.push(`**Active experiments:**`);
      ctx.active_experiments.forEach(e => {
        parts.push(`- ${e.title}: testing ${e.variable_tested}, ${e.variant_a} vs ${e.variant_b}`);
      });
    }

    parts.push(`\n**Confidence:** ${ctx.confidence?.overall || "none"} (${ctx.confidence?.sessions_available || 0} sessions). TikTok: ${ctx.connection_health?.tiktok_connected ? "connected" : "not connected"}.`);
    parts.push(`\nBased on this data, I'm ready to ask questions. Please acknowledge you've loaded my data briefly.`);

    return parts.join("\n");
  }

  async function handleSend() {
    if (!input.trim() || sending) return;

    // Auto-create conversation if none exists
    let conv = activeConv;
    if (!conv) {
      conv = await base44.agents.createConversation({
        agent_name: "AI_COACH",
        metadata: { name: `Chat ${new Date().toLocaleDateString()}` },
      });
      setActiveConv(conv);
      setConversations(c => [conv, ...c]);
    }

    // Load context on first real message
    if (!contextLoaded && messages.filter(m => m.role === "user").length === 0) {
      await loadContext();
    }

    const userMsg = input.trim();
    setInput("");
    setSending(true);

    // Optimistic add
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);

    // Subscribe to streaming response
    const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
    });

    await base44.agents.addMessage(conv, { role: "user", content: userMsg });

    // Wait a bit for streaming, then cleanup
    setTimeout(() => {
      unsubscribe();
      setSending(false);
    }, 500);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-end sm:justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:w-[420px] h-[85vh] sm:h-[75vh] sm:mr-4 sm:mb-4 bg-[#060d1f] border border-cyan-900/30 sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400/20 to-cyan-400/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">AI Coach</p>
            <p className="text-[10px] font-mono text-slate-600">
              {contextSummary
                ? `${contextSummary.sessions} sessions · ${contextSummary.confidence} confidence`
                : "Ask about strategy, goals, schedule…"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={startNewConversation}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
              title="New chat">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loadingConv ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>
          ) : messages.filter(m => !m.content?.startsWith("Here is my current creator data context")).length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-10 h-10 text-slate-800 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500 mb-1">Ask me anything</p>
              <p className="text-xs font-mono text-slate-700 max-w-xs mx-auto leading-relaxed">
                I have access to your sessions, goals, schedule, TikTok data, and performance patterns. Try:
              </p>
              <div className="mt-4 space-y-2">
                {[
                  "What game should I focus on this week?",
                  "Am I on track with my goals?",
                  "What time slots work best for me?",
                  "Give me a pre-stream brief for tonight",
                ].map((q, i) => (
                  <button key={i} onClick={() => { setInput(q); }}
                    className="block w-full text-left text-xs font-mono text-slate-500 hover:text-cyan-400 px-3 py-2 rounded-lg bg-[#02040f] border border-cyan-900/15 hover:border-cyan-500/20 transition-all">
                    → {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages
              .filter(m => !m.content?.startsWith("Here is my current creator data context"))
              .map((msg, i) => <ChatMessage key={i} message={msg} />)
          )}

          {sending && (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[10px] font-mono text-slate-600">Thinking...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/[0.05] shrink-0">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask your AI coach..."
              className="flex-1 bg-[#02040f] border border-cyan-900/20 focus:border-cyan-500/30 text-white placeholder-slate-700 rounded-xl px-4 py-3 text-sm font-mono outline-none transition-all"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
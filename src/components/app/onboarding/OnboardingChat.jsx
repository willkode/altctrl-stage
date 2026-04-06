import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Sparkles, Gamepad2, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import GameSelector from "./GameSelector";

const INITIAL_MESSAGE = {
  role: "ai",
  content: `Hey! I'm your ALT CTRL setup assistant. 👋

Tell me about yourself — **who you are, what you stream, and what you're trying to achieve.** The more you share, the better I can set things up.

For example:
> *"I'm Nex, I stream Fortnite and Warzone on TikTok. I usually go live 4 nights a week around 8pm. I've got about 500 followers and I'm trying to grow my audience and get more consistent."*

Just type naturally — I'll figure out the rest.`,
};

export default function OnboardingChat({ onComplete }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [resolvedGames, setResolvedGames] = useState(null);
  const [phase, setPhase] = useState("intro"); // intro | follow_up | resolving_games | game_selection | ready
  const [selectedGames, setSelectedGames] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, processing]);

  useEffect(() => {
    if (!processing) inputRef.current?.focus();
  }, [processing]);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || processing) return;
    setInput("");
    addMessage("user", text);
    setProcessing(true);

    if (phase === "intro" || phase === "follow_up") {
      // Combine all user messages for context
      const allUserText = [...messages.filter(m => m.role === "user").map(m => m.content), text].join("\n");

      const res = await base44.functions.invoke("onboardingAI", {
        action: "analyze_intro",
        payload: { intro_text: allUserText },
      });

      const data = res.data?.profile_data;
      if (!data) {
        addMessage("ai", "Sorry, I had trouble understanding that. Could you try again?");
        setProcessing(false);
        return;
      }

      setProfileData(prev => ({ ...prev, ...data }));

      if (data.confidence === "needs_more" && phase === "intro") {
        addMessage("ai", data.ai_follow_up || "Could you tell me a bit more? What games do you play, and how often do you stream?");
        setPhase("follow_up");
        setProcessing(false);
        return;
      }

      // We have enough info — resolve games
      const gameTitles = data.games_mentioned || [];
      if (data.primary_game && !gameTitles.includes(data.primary_game)) {
        gameTitles.unshift(data.primary_game);
      }

      if (gameTitles.length === 0) {
        addMessage("ai", (data.ai_follow_up || "Got it!") + "\n\nOne thing though — **what games do you play?** I need at least one to set up your dashboard properly.");
        setPhase("follow_up");
        setProcessing(false);
        return;
      }

      // Move to game selection
      addMessage("ai", (data.ai_follow_up || "Great!") + "\n\n**Now let's add the games you own.** Search our library or add custom games to build your collection.");
      setPhase("game_selection");
      setProcessing(false);
      return;
    }

    setProcessing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContinue = () => {
    if (profileData && resolvedGames) {
      onComplete(profileData, resolvedGames);
    }
  };

  const handleGameSelectionComplete = async (selectedGameList) => {
    setSelectedGames(selectedGameList);
    addMessage("system", `📚 Processing ${selectedGameList.length} game${selectedGameList.length !== 1 ? "s" : ""}...`);
    setProcessing(true);

    try {
      // Resolve/create games
      const gamesRes = await base44.functions.invoke("onboardingAI", {
        action: "resolve_games",
        payload: { 
          game_titles: selectedGameList.filter(g => g.source === "custom").map(g => g.title),
          library_game_ids: selectedGameList.filter(g => g.source === "library").map(g => g.id),
        },
      });

      const games = gamesRes.data?.games || [];
      setResolvedGames(games);

      addMessage("ai", "✅ Games added successfully! Click **Continue** to review your profile.");
      setPhase("ready");
    } catch (err) {
      addMessage("ai", "❌ There was an error processing your games. Please try again.");
    }
    setProcessing(false);
  };

  return (
    <div className="bg-[#060d1f] border border-cyan-900/40 rounded-xl overflow-hidden flex flex-col" style={{ height: "min(600px, 70dvh)" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
        {processing && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            </div>
            <div className="bg-[#02040f] border border-cyan-900/20 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono text-slate-500">
                  {phase === "resolving_games" ? "Researching games..." : "Thinking..."}
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Game selection phase */}
      {phase === "game_selection" && (
        <div className="border-t border-cyan-900/20 p-4">
          <GameSelector onComplete={handleGameSelectionComplete} />
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-cyan-900/20 p-4">
        {phase === "ready" ? (
          <button onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-4 rounded-lg text-sm hover:bg-cyan-300 transition-all">
            <CheckCircle2 className="w-4 h-4" /> Continue to Review
          </button>
        ) : (
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={phase === "intro" ? "Tell me about yourself..." : "Add more details..."}
              rows={2}
              disabled={processing}
              className="flex-1 bg-[#02040f] border border-cyan-900/30 focus:border-cyan-500/30 text-white placeholder-slate-700 rounded-lg px-4 py-3 text-sm outline-none transition-all resize-none font-mono disabled:opacity-50"
            />
            <button onClick={handleSend} disabled={!input.trim() || processing}
              className="w-12 h-12 flex items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed self-end">
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const { role, content } = message;

  if (role === "system") {
    return (
      <div className="flex justify-center">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 bg-[#02040f] px-3 py-1.5 rounded-full border border-cyan-900/15">
          {content}
        </div>
      </div>
    );
  }

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-cyan-500/10 border border-cyan-500/15 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
      </div>
      <div className="max-w-[85%] bg-[#02040f] border border-cyan-900/20 rounded-2xl rounded-tl-sm px-4 py-3">
        <ReactMarkdown
          className="text-sm text-slate-300 leading-relaxed prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          components={{
            p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
            strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-cyan-500/30 pl-3 my-2 text-slate-400 italic">{children}</blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
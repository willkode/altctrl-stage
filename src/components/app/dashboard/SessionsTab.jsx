import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { loadAllSessions } from "../../../utils/sessionLoader";
import LoadingState from "../LoadingState";
import LogSessionDrawer from "../drawers/LogSessionDrawer";
import SourceBadge from "../SourceBadge";
import { ArrowLeft, Zap, Users, TrendingUp, Clock, Heart, MessageCircle, Gift, Share2, Star, Loader2, Plus, ChevronRight } from "lucide-react";

function MetricPill({ label, value, accent = "cyan" }) {
  const colors = {
    cyan: "border-cyan-900/30 text-cyan-400",
    pink: "border-pink-900/30 text-pink-400",
    yellow: "border-yellow-900/30 text-yellow-400",
    green: "border-green-900/30 text-green-400",
  };
  return (
    <div className={`bg-[#060d1f] border ${colors[accent]} rounded-lg px-4 py-3`}>
      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600 mb-1">{label}</div>
      <div className={`text-xl font-black ${colors[accent].split(" ")[1]}`}>{value ?? "—"}</div>
    </div>
  );
}

function SessionDetail({ session, onBack, onEdit }) {
  const [debrief, setDebrief] = useState(null);
  const [loadingDebrief, setLoadingDebrief] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function generateDebrief() {
    setLoadingDebrief(true);
    const res = await base44.functions.invoke("generateAutoDebrief", { session_id: session.id });
    if (res.data?.debrief) {
      setDebrief(res.data.debrief);
      setGenerated(true);
    }
    setLoadingDebrief(false);
  }

  const duration = session.duration_minutes
    ? `${Math.floor(session.duration_minutes / 60) > 0 ? Math.floor(session.duration_minutes / 60) + "h " : ""}${session.duration_minutes % 60}m`
    : null;

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="mt-1 text-slate-500 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-black uppercase text-white">{session.game}</h2>
            <SourceBadge source={session.source} size="sm" />
          </div>
          <p className="text-xs font-mono text-slate-500">
            {session.stream_date}
            {session.stream_type ? ` · ${session.stream_type.replace(/_/g, " ")}` : ""}
            {duration ? ` · ${duration}` : ""}
          </p>
        </div>
        <button onClick={() => onEdit(session)} className="text-[10px] font-mono uppercase text-slate-500 hover:text-cyan-400 border border-cyan-900/20 hover:border-cyan-500/30 px-3 py-1.5 rounded transition-all">
          Edit
        </button>
      </div>

      {/* Core metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricPill label="Avg Viewers" value={session.avg_viewers} accent="cyan" />
        <MetricPill label="Peak Viewers" value={session.peak_viewers} accent="pink" />
        <MetricPill label="Followers +" value={session.followers_gained != null ? `+${session.followers_gained}` : null} accent="green" />
        <MetricPill label="Duration" value={duration} accent="yellow" />
      </div>

      {/* Engagement metrics */}
      {(session.diamonds > 0 || session.gifters > 0 || session.comments > 0 || session.shares > 0 || session.likes_received > 0) && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">// Engagement</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {session.diamonds > 0 && <MetricPill label="Diamonds" value={session.diamonds?.toLocaleString()} accent="yellow" />}
            {session.gifters > 0 && <MetricPill label="Gifters" value={session.gifters} accent="pink" />}
            {session.comments > 0 && <MetricPill label="Comments" value={session.comments?.toLocaleString()} accent="cyan" />}
            {session.shares > 0 && <MetricPill label="Shares" value={session.shares} accent="cyan" />}
            {session.likes_received > 0 && <MetricPill label="Likes" value={session.likes_received?.toLocaleString()} accent="pink" />}
          </div>
        </div>
      )}

      {/* Advanced metrics (desktop sessions) */}
      {(session.total_unique_viewers > 0 || session.return_viewers > 0 || session.unique_chatters > 0) && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">// Audience</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {session.total_unique_viewers > 0 && <MetricPill label="Unique Viewers" value={session.total_unique_viewers?.toLocaleString()} accent="cyan" />}
            {session.return_viewers > 0 && <MetricPill label="Return Viewers" value={session.return_viewers?.toLocaleString()} accent="green" />}
            {session.unique_chatters > 0 && <MetricPill label="Chatters" value={session.unique_chatters?.toLocaleString()} accent="cyan" />}
          </div>
        </div>
      )}

      {/* Creator notes */}
      {(session.notes || session.best_moment || session.weakest_moment || session.spike_reason || session.drop_off_reason) && (
        <div className="bg-[#060d1f] border border-cyan-900/20 rounded-xl p-5 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">// Creator Notes</p>
          {session.notes && (
            <div>
              <p className="text-[9px] font-mono uppercase text-slate-600 mb-1">Notes</p>
              <p className="text-sm text-slate-300">{session.notes}</p>
            </div>
          )}
          {session.best_moment && (
            <div>
              <p className="text-[9px] font-mono uppercase text-slate-600 mb-1">Best Moment</p>
              <p className="text-sm text-slate-300">{session.best_moment}</p>
            </div>
          )}
          {session.weakest_moment && (
            <div>
              <p className="text-[9px] font-mono uppercase text-slate-600 mb-1">Weakest Moment</p>
              <p className="text-sm text-slate-300">{session.weakest_moment}</p>
            </div>
          )}
          {session.spike_reason && (
            <div>
              <p className="text-[9px] font-mono uppercase text-slate-600 mb-1">Spike Reason</p>
              <p className="text-sm text-slate-300">{session.spike_reason}</p>
            </div>
          )}
          {session.drop_off_reason && (
            <div>
              <p className="text-[9px] font-mono uppercase text-slate-600 mb-1">Drop-Off Reason</p>
              <p className="text-sm text-slate-300">{session.drop_off_reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Flags */}
      <div className="flex gap-2 flex-wrap">
        {session.promo_posted && (
          <span className="text-[10px] font-mono uppercase px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400">✓ Promo Posted</span>
        )}
        {session.went_as_planned === true && (
          <span className="text-[10px] font-mono uppercase px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400">✓ Went as Planned</span>
        )}
        {session.went_as_planned === false && (
          <span className="text-[10px] font-mono uppercase px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400">✕ Didn't Go as Planned</span>
        )}
        {session.energy_level && (
          <span className="text-[10px] font-mono uppercase px-3 py-1.5 rounded-full border border-cyan-900/30 bg-cyan-900/10 text-slate-400">Energy: {session.energy_level}</span>
        )}
      </div>

      {/* AI Debrief */}
      <div className="bg-[#060d1f] border border-yellow-900/30 rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-yellow-400">// AI Debrief & Recommendations</p>
          <button
            onClick={generateDebrief}
            disabled={loadingDebrief}
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/15 transition-all disabled:opacity-50"
          >
            {loadingDebrief ? <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing…</> : <><Zap className="w-3 h-3" /> {generated ? "Regenerate" : "Generate Debrief"}</>}
          </button>
        </div>

        {debrief ? (
          <div className="space-y-3 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {typeof debrief === "string" ? debrief : JSON.stringify(debrief, null, 2)}
          </div>
        ) : (
          <p className="text-xs font-mono text-slate-600">
            Click "Generate Debrief" to get AI-powered insights and actionable recommendations for this session.
          </p>
        )}
      </div>
    </div>
  );
}

export default function SessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editSession, setEditSession] = useState(null);
  const [logOpen, setLogOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const all = await loadAllSessions(200);
    setSessions(all);
    setLoading(false);
  }

  const filtered = sessions.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.game?.toLowerCase().includes(q) || s.stream_date?.includes(q) || s.stream_type?.toLowerCase().includes(q);
  });

  if (selected) {
    return (
      <div>
        <SessionDetail
          session={selected}
          onBack={() => setSelected(null)}
          onEdit={s => { setEditSession(s); setSelected(null); }}
        />
        <LogSessionDrawer open={!!editSession} onClose={() => setEditSession(null)} session={editSession} onSaved={() => { loadData(); setSelected(null); }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search sessions…"
          className="flex-1 bg-[#060d1f] border border-cyan-900/20 focus:border-cyan-500/20 text-white placeholder-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono outline-none transition-all"
        />
        <button onClick={() => setLogOpen(true)}
          className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15 transition-all shrink-0">
          <Plus className="w-3.5 h-3.5" /> Log
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading sessions..." />
      ) : sessions.length === 0 ? (
        <div className="bg-[#060d1f]/80 border border-cyan-900/20 rounded-xl p-10 text-center">
          <p className="text-sm font-bold text-slate-400 mb-1">No sessions yet</p>
          <p className="text-xs font-mono text-slate-600 mb-4">Log your first stream to get started.</p>
          <button onClick={() => setLogOpen(true)}
            className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-5 py-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15 transition-all">
            <Plus className="w-3.5 h-3.5" /> Log First Session
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-3">{filtered.length} session{filtered.length !== 1 ? "s" : ""}</p>
          {filtered.map(s => (
            <button key={s.id} onClick={() => setSelected(s)}
              className="w-full text-left bg-[#060d1f] border border-cyan-900/20 hover:border-cyan-500/30 rounded-xl px-5 py-4 transition-all group">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-black text-white truncate">{s.game}</span>
                    <SourceBadge source={s.source} size="sm" />
                    {s.promo_posted && <span className="text-[9px] font-mono text-pink-400 border border-pink-900/30 rounded px-1.5 py-0.5">PROMO</span>}
                  </div>
                  <p className="text-[10px] font-mono text-slate-600">
                    {s.stream_date}
                    {s.stream_type ? ` · ${s.stream_type.replace(/_/g, " ")}` : ""}
                    {s.duration_minutes ? ` · ${s.duration_minutes}m` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {s.avg_viewers != null && s.avg_viewers > 0 && (
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-black text-cyan-400">{s.avg_viewers}</div>
                      <div className="text-[9px] font-mono text-slate-700">avg</div>
                    </div>
                  )}
                  {s.peak_viewers != null && s.peak_viewers > 0 && (
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-black text-pink-400">{s.peak_viewers}</div>
                      <div className="text-[9px] font-mono text-slate-700">peak</div>
                    </div>
                  )}
                  {s.followers_gained != null && s.followers_gained > 0 && (
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-black text-green-400">+{s.followers_gained}</div>
                      <div className="text-[9px] font-mono text-slate-700">follows</div>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <LogSessionDrawer open={logOpen} onClose={() => setLogOpen(false)} onSaved={loadData} />
      <LogSessionDrawer open={!!editSession} onClose={() => setEditSession(null)} session={editSession} onSaved={loadData} />
    </div>
  );
}
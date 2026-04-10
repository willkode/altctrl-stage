import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import TimestampedNotes from "../../components/app/replay/TimestampedNotes";
import { Zap, Check, Video } from "lucide-react";
import { inp, textarea, lbl } from "../../lib/formStyles";
import { loadAllSessions } from "../../utils/sessionLoader";

export default function ReplayReview() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [review, setReview] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const all = await loadAllSessions(30);
    setSessions(all);
    setLoading(false);
  }

  async function selectSession(id) {
    setSelectedId(id);
    const sess = sessions.find(s => s.id === id);
    if (!sess) return;

    const reviews = await base44.entities.ReplayReview.filter({ live_session_id: id });
    if (reviews[0]) {
      setReview(reviews[0]);
      setForm({
        replay_url: reviews[0].replay_url || "",
        strongest_opening: reviews[0].strongest_opening || "",
        strongest_engagement: reviews[0].strongest_engagement || "",
        dead_zones: reviews[0].dead_zones || "",
        clip_worthy: reviews[0].clip_worthy || "",
        timestamp_notes: reviews[0].timestamp_notes || "[]",
        lessons: reviews[0].lessons || "",
        overall_rating: reviews[0].overall_rating || 5,
        reviewed: reviews[0].reviewed || false,
      });
    } else {
      setReview(null);
      setForm({
        replay_url: "",
        strongest_opening: "",
        strongest_engagement: "",
        dead_zones: "",
        clip_worthy: "",
        timestamp_notes: "[]",
        lessons: "",
        overall_rating: 5,
        reviewed: false,
      });
    }
  }

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    const data = {
      ...form,
      live_session_id: selectedId,
      reviewed_at: new Date().toISOString(),
    };

    if (review?.id) {
      await base44.entities.ReplayReview.update(review.id, data);
    } else {
      await base44.entities.ReplayReview.create(data);
    }

    setSaved(true);
    setSaving(false);
    await selectSession(selectedId);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <PageContainer><LoadingState message="Loading sessions..." /></PageContainer>;

  const currentSession = sessions.find(s => s.id === selectedId);

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// REPLAY_REVIEW</div>
        <h1 className="text-2xl font-black uppercase text-white">Replay Review</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">Analyze your stream replay and capture learnings.</p>
      </div>

      {/* Session selector */}
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-4 mb-4">
        <label className={lbl}>Select Session to Review</label>
        <select value={selectedId} onChange={e => selectSession(e.target.value)} className={inp + " appearance-none"}>
          <option value="">— Choose a session —</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>
              {s.stream_date} · {s.game} {s.replay_reviewed ? "✓" : ""}
            </option>
          ))}
        </select>
      </div>

      {!selectedId ? (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-12 text-center">
          <Video className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <div className="text-sm font-black uppercase text-slate-500 mb-2">No session selected</div>
          <p className="text-xs font-mono text-slate-600">Pick a stream to start reviewing its replay.</p>
        </div>
      ) : !currentSession ? (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-12 text-center">
          <div className="text-sm font-black uppercase text-slate-500">Session not found</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Session info */}
          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-600">Date</div>
                <div className="text-white font-black mt-1">{currentSession.stream_date}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-600">Game</div>
                <div className="text-white font-black mt-1">{currentSession.game}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-600">Type</div>
                <div className="text-cyan-400 font-black mt-1">{currentSession.stream_type}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-600">Status</div>
                <div className={`font-black mt-1 ${form.reviewed ? "text-green-400" : "text-slate-500"}`}>
                  {form.reviewed ? "Reviewed ✓" : "Pending"}
                </div>
              </div>
            </div>
          </div>

          {/* Replay URL */}
          <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl p-5 space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-pink-400">// Replay URL</div>
            <input
              type="url"
              value={form.replay_url}
              onChange={e => setForm(f => ({ ...f, replay_url: e.target.value }))}
              placeholder="https://www.tiktok.com/@username/live/..."
              className={inp}
            />
            {form.replay_url && (
              <a href={form.replay_url} target="_blank" rel="noopener noreferrer"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors">
                → Open replay in new tab
              </a>
            )}
          </div>

          {/* Key moments */}
          <div className="bg-[#060d1f] border border-yellow-900/30 rounded-xl p-5 space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-400">// Key Moments</div>

            <div>
              <label className={lbl}>Strongest Opening</label>
              <textarea
                value={form.strongest_opening}
                onChange={e => setForm(f => ({ ...f, strongest_opening: e.target.value }))}
                placeholder="What was the best part of your opening? Hook? Hype? How long?"
                rows={2}
                className={textarea}
              />
            </div>

            <div>
              <label className={lbl}>Strongest Engagement Moment</label>
              <textarea
                value={form.strongest_engagement}
                onChange={e => setForm(f => ({ ...f, strongest_engagement: e.target.value }))}
                placeholder="When did chat go crazy? Big play? Funny moment? Interaction?"
                rows={2}
                className={textarea}
              />
            </div>

            <div>
              <label className={lbl}>Dead Zones / Slow Periods</label>
              <textarea
                value={form.dead_zones}
                onChange={e => setForm(f => ({ ...f, dead_zones: e.target.value }))}
                placeholder="Where was chat quiet? Where did engagement dip? When and why?"
                rows={2}
                className={textarea}
              />
            </div>

            <div>
              <label className={lbl}>Clip-Worthy Moments</label>
              <textarea
                value={form.clip_worthy}
                onChange={e => setForm(f => ({ ...f, clip_worthy: e.target.value }))}
                placeholder="Timestamps of moments worth clipping. Why? Emotional? Shocking? Funny?"
                rows={2}
                className={textarea}
              />
            </div>
          </div>

          {/* Timestamped notes */}
          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">// Timestamped Notes</div>
            <p className="text-xs font-mono text-slate-600">Capture specific moments as you review. MM:SS format.</p>
            <TimestampedNotes
              notes={form.timestamp_notes}
              onChange={notes => setForm(f => ({ ...f, timestamp_notes: notes }))}
            />
          </div>

          {/* Lessons */}
          <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl p-5 space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-pink-400">// Lessons for Next Time</div>
            <textarea
              value={form.lessons}
              onChange={e => setForm(f => ({ ...f, lessons: e.target.value }))}
              placeholder="What will you do differently next stream? What worked? What didn't? New ideas to test?"
              rows={3}
              className={textarea}
            />
          </div>

          {/* Overall rating */}
          <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 space-y-3">
            <label className={lbl}>Overall Stream Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setForm(f => ({ ...f, overall_rating: n }))}
                  className={`flex-1 py-3 rounded border text-lg font-black transition-all ${
                    form.overall_rating === n
                      ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                      : "bg-[#02040f] border-cyan-900/30 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs font-mono text-slate-600">1 = needs work, 5 = excellent</p>
          </div>

          {/* Reviewed checkbox */}
          <div className="bg-[#060d1f] border border-green-900/30 rounded-xl p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.reviewed}
                onChange={e => setForm(f => ({ ...f, reviewed: e.target.checked }))}
                className="w-5 h-5 rounded border border-green-900/40 bg-[#02040f] accent-green-400 cursor-pointer"
              />
              <span className="text-sm font-mono uppercase text-white">Mark replay as reviewed</span>
            </label>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || !form.reviewed}
            className={`w-full flex items-center justify-center gap-2 font-black uppercase tracking-widest py-4 rounded text-sm transition-all disabled:opacity-40 ${
              saved ? "bg-green-400 text-[#02040f]" : "bg-cyan-400 text-[#02040f] hover:bg-cyan-300"
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Review Saved!
              </>
            ) : saving ? (
              "Saving…"
            ) : (
              <>
                <Zap className="w-4 h-4" /> Save Replay Review
              </>
            )}
          </button>
        </div>
      )}
    </PageContainer>
  );
}
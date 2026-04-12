import { useState, useEffect, useRef } from "react";
import AppModal from "../AppModal";
import { base44 } from "@/api/base44Client";
import { useAppToast } from "../../../hooks/useAppToast";
import { RefreshCw, Trash2, Sparkles, Loader2, Swords } from "lucide-react";
import GameContextPanel from "../games/GameContextPanel";
import { getISOWeek } from "../../../utils/dateHelpers";
import { inp, lbl, err } from "../../../lib/formStyles";

const STREAM_TYPES = ["ranked", "chill", "viewer_games", "challenge", "collab", "special", "other"];
const STATUSES = ["planned", "live", "completed", "skipped", "cancelled"];
const DURATIONS = [30, 45, 60, 90, 120, 180];

const empty = () => ({
  title: "",
  game: "",
  stream_type: "ranked",
  scheduled_date: new Date().toISOString().split("T")[0],
  start_time: "19:00",
  target_duration_minutes: 60,
  notes: "",
  recurring: false,
  status: "planned",
  primary_game_id: "",
  challenge_mode_enabled: false,
  selected_challenge_style: "",
});

export default function StreamDrawer({ open, onClose, stream = null, onSaved }) {
  const [form, setForm] = useState(empty());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [gameSuggestions, setGameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredGames, setFilteredGames] = useState([]);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const gameRef = useRef(null);
  const toast = useAppToast();
  const isEdit = !!stream?.id;

  const [gameLibrary, setGameLibrary] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    if (!open) return;
    base44.auth.me().then(user => {
      Promise.all([
        base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 50),
        base44.entities.GameLibrary.filter({ is_active: true, pc_supported: true }, "sort_priority", 200),
        base44.entities.CreatorGamePreference.filter({ created_by: user.email }),
      ]).then(([sessions, library, prefs]) => {
        const games = [...new Set(sessions.map(s => s.game).filter(Boolean))];
        setGameSuggestions(games);
        const prefIds = new Set(prefs.map(p => p.game_id));
        library.sort((a, b) => {
          const aP = prefIds.has(a.id) ? 0 : 1;
          const bP = prefIds.has(b.id) ? 0 : 1;
          if (aP !== bP) return aP - bP;
          return (a.sort_priority || 100) - (b.sort_priority || 100);
        });
        setGameLibrary(library);
        if (stream?.primary_game_id) {
          setSelectedGame(library.find(g => g.id === stream.primary_game_id) || null);
        }
      });
    });
  }, [open]);

  useEffect(() => {
    if (stream) setForm({ ...empty(), ...stream });
    else setForm(empty());
    setErrors({});
    setConfirmDelete(false);
  }, [stream, open]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.game?.trim()) e.game = "Game is required";
    if (!form.scheduled_date) e.scheduled_date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const d = new Date(form.scheduled_date);
    const data = { ...form, week_number: getISOWeek(d), year: d.getFullYear() };
    if (isEdit) {
      await base44.entities.ScheduledStream.update(stream.id, data);
      toast.saved("Stream updated");
    } else {
      await base44.entities.ScheduledStream.create(data);
      toast.saved("Stream scheduled");
    }
    setSaving(false);
    onSaved?.();
    onClose();
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await base44.entities.ScheduledStream.delete(stream.id);
    toast.deleted("Stream removed");
    setDeleting(false);
    onSaved?.();
    onClose();
  };

  // Dynamic search across history + library
  useEffect(() => {
    if (!form.game.trim()) {
      setFilteredGames([]);
      return;
    }
    const q = form.game.toLowerCase();
    const fromHistory = gameSuggestions.filter(g =>
      g.toLowerCase().includes(q) && g.toLowerCase() !== q
    ).map(title => ({ title, score: null }));
    const fromLibrary = gameLibrary
      .filter(g => g.title.toLowerCase().includes(q) && g.title.toLowerCase() !== q)
      .map(g => ({ title: g.title, score: g.sort_priority ? Math.max(0, Math.min(100, 100 - g.sort_priority)) : 50 }));
    const combined = [];
    const seen = new Set();
    [...fromLibrary, ...fromHistory].forEach(item => {
      if (!seen.has(item.title.toLowerCase())) {
        combined.push(item);
        seen.add(item.title.toLowerCase());
      }
    });
    setFilteredGames(combined.slice(0, 12));
  }, [form.game, gameSuggestions, gameLibrary]);

  const dayLabel = form.scheduled_date
    ? new Date(form.scheduled_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    : "";

  const libraryFiltered = form.game.trim()
    ? gameLibrary.filter(g => g.title.toLowerCase().includes(form.game.toLowerCase()))
    : gameLibrary.slice(0, 20);

  return (
    <AppModal open={open} onClose={() => { setConfirmDelete(false); onClose(); }}
      title={isEdit ? "Edit Stream" : "Schedule Stream"} accent="cyan">
      <div className="space-y-4">

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Date *</label>
            <input type="date" value={form.scheduled_date}
              onChange={e => set("scheduled_date", e.target.value)}
              className={`${inp} ${errors.scheduled_date ? "border-red-500/60" : ""}`} />
            {errors.scheduled_date && <p className={err}>{errors.scheduled_date}</p>}
          </div>
          <div>
            <label className={lbl}>Start Time</label>
            <input type="time" value={form.start_time}
              onChange={e => set("start_time", e.target.value)} className={inp} />
          </div>
        </div>

        {dayLabel && (
          <div className="text-xs font-mono text-cyan-400/70 -mt-2">📅 {dayLabel}</div>
        )}

        {/* Game with suggestions */}
        <div className="relative" ref={gameRef}>
          <label className={lbl}>Game *</label>
          <input value={form.game}
            onChange={e => { set("game", e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="e.g. Fortnite, Warzone…"
            className={`${inp} ${errors.game ? "border-red-500/60" : ""}`} />
          {errors.game && <p className={err}>{errors.game}</p>}
          {showSuggestions && filteredGames.length > 0 && (
            <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-[#060d1f] border border-cyan-900/40 rounded-lg overflow-hidden shadow-xl max-h-52 overflow-y-auto">
              {filteredGames.map(item => (
                <button key={item.title} onMouseDown={() => { set("game", item.title); setShowSuggestions(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-mono text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all flex items-center justify-between gap-2">
                  <span>{item.title}</span>
                  {item.score !== null && <span className="text-[10px] text-cyan-400/60 shrink-0">★ {item.score}</span>}
                </button>
              ))}
            </div>
          )}
          {gameSuggestions.length > 0 && !form.game && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {gameSuggestions.slice(0, 4).map(g => (
                <button key={g} onClick={() => set("game", g)}
                  className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-cyan-500/5 border border-cyan-900/30 text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={lbl + " mb-0"}>Stream Title <span className="text-slate-700 normal-case tracking-normal">(optional)</span></label>
            <button
              onClick={async () => {
                if (!form.game?.trim() || generatingTitle) return;
                setGeneratingTitle(true);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `Generate a short, catchy TikTok LIVE stream title for a gaming stream. Game: ${form.game}. Stream type: ${form.stream_type}. Keep it under 60 characters, engaging, and hype. Return ONLY the title text, nothing else.`,
                });
                set("title", res.trim());
                setGeneratingTitle(false);
              }}
              disabled={!form.game?.trim() || generatingTitle}
              className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {generatingTitle ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {generatingTitle ? "Generating…" : "AI Generate"}
            </button>
          </div>
          <input value={form.title} onChange={e => set("title", e.target.value)}
            placeholder="Custom stream title" className={inp} />
        </div>

        {/* Stream type */}
        <div>
          <label className={lbl}>Stream Type</label>
          <div className="grid grid-cols-4 gap-1.5">
            {STREAM_TYPES.map(t => (
              <button key={t} onClick={() => set("stream_type", t)}
                className={`py-2 rounded text-xs font-mono uppercase transition-all ${
                  form.stream_type === t
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                    : "bg-[#02040f] border border-cyan-900/30 text-slate-600 hover:text-slate-300"
                }`}>
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className={lbl}>Target Duration</label>
          <div className="flex flex-wrap gap-1.5">
            {DURATIONS.map(d => (
              <button key={d} onClick={() => set("target_duration_minutes", d)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  form.target_duration_minutes === d
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                    : "bg-[#02040f] border border-cyan-900/30 text-slate-600 hover:text-slate-300"
                }`}>
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center justify-between py-3 px-4 bg-[#02040f] border border-cyan-900/30 rounded-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Recurring Stream</span>
          </div>
          <button onClick={() => set("recurring", !form.recurring)}
            className={`w-10 h-5 rounded-full transition-all relative ${form.recurring ? "bg-cyan-500" : "bg-cyan-900/40"}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.recurring ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>

        {/* Status (edit only) */}
        {isEdit && (
          <div>
            <label className={lbl}>Status</label>
            <div className="grid grid-cols-5 gap-1.5">
              {STATUSES.map(s => (
                <button key={s} onClick={() => set("status", s)}
                  className={`py-2 rounded text-[10px] font-mono uppercase transition-all ${
                    form.status === s
                      ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                      : "bg-[#02040f] border border-cyan-900/30 text-slate-600 hover:text-slate-300"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Game from library — filters dynamically as you type */}
        {gameLibrary.length > 0 && (
          <div>
            <label className={lbl}>Select from Library <span className="text-slate-700 normal-case tracking-normal">(recommended)</span></label>
            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
              {libraryFiltered.map(g => (
                <button key={g.id} onClick={() => { set("game", g.title); set("primary_game_id", g.id); setSelectedGame(g); }}
                  className={`text-[10px] font-mono uppercase px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                    form.primary_game_id === g.id
                      ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                      : "border-cyan-900/20 text-slate-600 hover:text-slate-300"
                  }`}>
                  {g.challenge_friendly && <Swords className="w-2.5 h-2.5 text-pink-400/60" />}
                  {g.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Challenge mode toggle */}
        <div className="flex items-center justify-between py-3 px-4 bg-[#02040f] border border-pink-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Swords className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Challenge Mode</span>
          </div>
          <button onClick={() => set("challenge_mode_enabled", !form.challenge_mode_enabled)}
            className={`w-10 h-5 rounded-full transition-all relative ${form.challenge_mode_enabled ? "bg-pink-500" : "bg-cyan-900/40"}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.challenge_mode_enabled ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>

        {/* Game context panel */}
        {selectedGame && (
          <GameContextPanel
            game={selectedGame}
            challengeEnabled={form.challenge_mode_enabled}
            selectedStyle={form.selected_challenge_style}
            onStyleSelect={(style) => set("selected_challenge_style", style)}
          />
        )}

        {/* Notes */}
        <div>
          <label className={lbl}>Notes <span className="text-slate-700 normal-case tracking-normal">(optional)</span></label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
            rows={2} placeholder="Goals, reminders, game plan…"
            className={inp + " resize-none"} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {isEdit && (
            <button onClick={handleDelete} disabled={deleting}
              className={`flex items-center gap-1.5 px-4 py-3 rounded text-xs font-mono uppercase tracking-widest transition-all disabled:opacity-40 ${
                confirmDelete
                  ? "bg-red-500/20 border border-red-500/50 text-red-400"
                  : "bg-red-500/5 border border-red-900/30 text-red-500/60 hover:text-red-400 hover:border-red-500/40"
              }`}>
              <Trash2 className="w-3 h-3" />
              {deleting ? "Deleting…" : confirmDelete ? "Confirm?" : "Delete"}
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3 rounded text-xs hover:bg-cyan-300 transition-all disabled:opacity-40">
            {saving ? "Saving…" : isEdit ? "Update Stream" : "Schedule Stream"}
          </button>
        </div>

        {confirmDelete && (
          <p className="text-xs font-mono text-red-400 text-center">Tap "Confirm?" to permanently remove this stream.</p>
        )}
      </div>
    </AppModal>
  );
}
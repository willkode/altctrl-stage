import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../../../components/app/admin/AdminLayout";
import GameDetailDrawer from "../../../components/app/games/GameDetailDrawer";
import { Plus, Search, Upload, Loader2, Trash2, Edit, Swords, ToggleLeft, ToggleRight, Database, Sparkles } from "lucide-react";
import AppModal from "../../../components/app/AppModal";

const inp = "w-full bg-[#02040f] border border-cyan-900/20 focus:border-cyan-500/20 text-white placeholder-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono outline-none transition-all";
const lbl = "block text-[9px] font-mono uppercase text-slate-600 mb-1.5";

const MULTIPLAYER = ["single_player", "co_op", "online_multiplayer", "mmo", "battle_royale", "mixed"];
const PACING = ["slow", "medium", "fast", "mixed"];
const SESSION = ["short_runs", "long_sessions", "sandbox", "mission_based", "endless", "mixed"];
const DIFFICULTY = ["casual", "competitive", "punishing", "mixed"];
const CAMERA = ["first_person", "third_person", "top_down", "side_scroller", "isometric", "mixed"];

const emptyGame = () => ({
  title: "", description_short: "", description_full: "", cover_image: "", banner_image: "",
  developer: "", publisher: "", release_date: "", franchise: "",
  genres: [], tags: [], game_modes: [],
  multiplayer_type: "mixed", gameplay_pacing: "medium", session_style: "mixed",
  challenge_friendly: false, difficulty_style: "mixed", camera_style: "mixed",
  core_objective: "", win_conditions: "", fail_conditions: "",
  challenge_notes: "", safety_notes: "", ai_summary: "",
  is_active: true, sort_priority: 100, pc_supported: true,
});

export default function GameLibraryAdmin() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editGame, setEditGame] = useState(null);
  const [viewGame, setViewGame] = useState(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const all = await base44.entities.GameLibrary.list("sort_priority", 500);
    setGames(all);
    setLoading(false);
  }

  async function seedLibrary() {
    setSeeding(true);
    await base44.functions.invoke("seedGameLibrary", { force: false });
    await load();
    setSeeding(false);
  }

  async function saveGame() {
    setSaving(true);
    const data = {
      ...editGame,
      normalized_title: editGame.title?.toLowerCase(),
      slug: editGame.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    };
    if (editGame.id) {
      await base44.entities.GameLibrary.update(editGame.id, data);
    } else {
      await base44.entities.GameLibrary.create(data);
    }
    setSaving(false);
    setEditGame(null);
    load();
  }

  async function toggleActive(game) {
    await base44.entities.GameLibrary.update(game.id, { is_active: !game.is_active });
    setGames(g => g.map(x => x.id === game.id ? { ...x, is_active: !x.is_active } : x));
  }

  async function deleteGame(game) {
    if (!confirm(`Delete "${game.title}"?`)) return;
    await base44.entities.GameLibrary.delete(game.id);
    load();
  }

  async function enrichWithAI() {
    setEnriching(true);
    // Get stubs (games with empty genres or description containing 'pending')
    const stubs = games.filter(g =>
      !g.genres || g.genres.length === 0 || (g.description_short || '').includes('pending')
    ).slice(0, 20);
    if (stubs.length === 0) {
      setEnriching(false);
      setEnrichProgress('All games already enriched!');
      return;
    }
    setEnrichProgress(`Enriching ${stubs.length} games...`);
    const res = await base44.functions.invoke('enrichGameMetadata', {
      game_ids: stubs.map(g => g.id),
      limit: stubs.length,
    });
    await load();
    setEnriching(false);
    setEnrichProgress(`Done! ${res.data?.count || 0} games enriched.`);
    setTimeout(() => setEnrichProgress(null), 5000);
  }

  async function bulkUploadGames(file) {
    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      for (const name of lines) {
        await base44.entities.GameLibrary.create({
          ...emptyGame(),
          title: name,
          normalized_title: name.toLowerCase(),
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          is_active: true,
          sort_priority: 100,
        });
      }
      await load();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  async function generateGames() {
    setGenerating(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 5 popular PC games that are currently trending (as of 2026). For each game, provide in JSON format with these exact fields:
{
  "title": "Game Name",
  "description_short": "One sentence description",
  "description_full": "2-3 sentences with gameplay details",
  "developer": "Developer Name",
  "publisher": "Publisher Name",
  "genres": ["Genre1", "Genre2"],
  "tags": ["tag1", "tag2"],
  "game_modes": ["mode1", "mode2"],
  "multiplayer_type": "online_multiplayer or single_player",
  "gameplay_pacing": "fast or medium",
  "session_style": "short_runs or long_sessions",
  "difficulty_style": "casual or competitive",
  "camera_style": "first_person or third_person",
  "challenge_friendly": true or false,
  "core_objective": "Main objective description",
  "pc_supported": true,
  "cover_image": "A stock photo URL or game image description"
}
Return as a JSON array of 5 games.`,
      response_json_schema: {
        type: "object",
        properties: {
          games: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description_short: { type: "string" },
                description_full: { type: "string" },
                developer: { type: "string" },
                publisher: { type: "string" },
                genres: { type: "array", items: { type: "string" } },
                tags: { type: "array", items: { type: "string" } },
                game_modes: { type: "array", items: { type: "string" } },
                multiplayer_type: { type: "string" },
                gameplay_pacing: { type: "string" },
                session_style: { type: "string" },
                difficulty_style: { type: "string" },
                camera_style: { type: "string" },
                challenge_friendly: { type: "boolean" },
                core_objective: { type: "string" },
                pc_supported: { type: "boolean" },
                cover_image: { type: "string" },
              },
            },
          },
        },
      },
    });
    if (res.data?.games?.length > 0) {
      for (const game of res.data.games) {
        await base44.entities.GameLibrary.create({
          ...emptyGame(),
          ...game,
          is_active: true,
          sort_priority: 50,
          normalized_title: game.title?.toLowerCase(),
          slug: game.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        });
      }
      await load();
    }
    setGenerating(false);
  }

  const filtered = games.filter(g => {
    if (!search) return true;
    const q = search.toLowerCase();
    return g.title?.toLowerCase().includes(q) || g.developer?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase">Game Library</h1>
            <p className="text-sm text-muted-foreground font-mono">{games.length} games in library</p>
          </div>
          <div className="flex gap-2">
            <button onClick={enrichWithAI} disabled={enriching}
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase px-3 py-2 rounded-lg border border-yellow-900/30 text-slate-500 hover:text-yellow-400 transition-all disabled:opacity-50">
              {enriching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {enriching ? `Enriching...` : "AI Enrich (20)"}
            </button>
            <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase px-3 py-2 rounded-lg border border-purple-900/30 text-slate-500 hover:text-purple-400 transition-all cursor-pointer disabled:opacity-50">
              <input
                type="file"
                accept=".txt,.csv"
                onChange={e => e.target.files?.[0] && bulkUploadGames(e.target.files[0])}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? 'Uploading…' : '📤 Bulk Upload'}
            </label>
            <button onClick={() => generateGames()} disabled={generating}
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase px-3 py-2 rounded-lg border border-pink-900/30 text-slate-500 hover:text-pink-400 transition-all disabled:opacity-50">
              {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Swords className="w-3 h-3" />}
              {generating ? "Generating…" : "AI Generate Games"}
            </button>
            <button onClick={seedLibrary} disabled={seeding}
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase px-3 py-2 rounded-lg border border-cyan-900/30 text-slate-500 hover:text-cyan-400 transition-all disabled:opacity-50">
              {seeding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
              {seeding ? "Seeding…" : "Seed Default Games"}
            </button>
            <button onClick={() => setEditGame(emptyGame())}
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/15 transition-all">
              <Plus className="w-3 h-3" /> Add Game
            </button>
          </div>
        </div>

        {enrichProgress && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 text-xs font-mono text-yellow-400">
            {enrichProgress}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search games…" className={inp + " pl-10"} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">No games found. Seed the library or add games manually.</div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] font-mono uppercase text-muted-foreground">
                  <th className="text-left py-3 px-4">Game</th>
                  <th className="text-left py-3 px-2 hidden md:table-cell">Genres</th>
                  <th className="text-center py-3 px-2 hidden md:table-cell">Challenge</th>
                  <th className="text-center py-3 px-2">Active</th>
                  <th className="text-center py-3 px-2">Priority</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <tr key={g.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4">
                      <button onClick={() => setViewGame(g)} className="text-left hover:text-cyan-400 transition-colors">
                        <span className="font-bold">{g.title}</span>
                        <span className="text-xs text-muted-foreground block">{g.developer}</span>
                      </button>
                    </td>
                    <td className="py-2.5 px-2 hidden md:table-cell">
                      <span className="text-[10px] font-mono text-muted-foreground">{g.genres?.slice(0, 2).join(", ")}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center hidden md:table-cell">
                      {g.challenge_friendly && <Swords className="w-3.5 h-3.5 text-pink-400 inline" />}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button onClick={() => toggleActive(g)} className="inline-flex">
                        {g.is_active ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-slate-600" />}
                      </button>
                    </td>
                    <td className="py-2.5 px-2 text-center text-xs font-mono text-muted-foreground">{g.sort_priority}</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditGame({ ...g })} className="p-1.5 hover:text-cyan-400 transition-colors text-muted-foreground"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteGame(g)} className="p-1.5 hover:text-red-400 transition-colors text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AppModal open={!!editGame} onClose={() => setEditGame(null)} title={editGame?.id ? "Edit Game" : "Add Game"} accent="cyan">
        {editGame && <GameEditForm game={editGame} onChange={setEditGame} onSave={saveGame} saving={saving} />}
      </AppModal>

      <GameDetailDrawer game={viewGame} onClose={() => setViewGame(null)} />
    </AdminLayout>
  );
}

function GameEditForm({ game, onChange, onSave, saving }) {
  const set = (k, v) => onChange({ ...game, [k]: v });
  const setArray = (k, val) => set(k, val.split(",").map(s => s.trim()).filter(Boolean));

  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
      <div><label className={lbl}>Title *</label><input value={game.title} onChange={e => set("title", e.target.value)} className={inp} /></div>
      <div><label className={lbl}>Short Description</label><input value={game.description_short} onChange={e => set("description_short", e.target.value)} className={inp} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={lbl}>Developer</label><input value={game.developer} onChange={e => set("developer", e.target.value)} className={inp} /></div>
        <div><label className={lbl}>Publisher</label><input value={game.publisher} onChange={e => set("publisher", e.target.value)} className={inp} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={lbl}>Cover Image URL</label><input value={game.cover_image} onChange={e => set("cover_image", e.target.value)} className={inp} /></div>
        <div><label className={lbl}>Banner Image URL</label><input value={game.banner_image} onChange={e => set("banner_image", e.target.value)} className={inp} /></div>
      </div>
      <div><label className={lbl}>Genres (comma-separated)</label><input value={game.genres?.join(", ")} onChange={e => setArray("genres", e.target.value)} className={inp} placeholder="FPS, Battle Royale" /></div>
      <div><label className={lbl}>Tags (comma-separated)</label><input value={game.tags?.join(", ")} onChange={e => setArray("tags", e.target.value)} className={inp} placeholder="pvp, team_based, tactical" /></div>
      <div><label className={lbl}>Game Modes (comma-separated)</label><input value={game.game_modes?.join(", ")} onChange={e => setArray("game_modes", e.target.value)} className={inp} placeholder="ranked, casual, custom_match" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={lbl}>Multiplayer</label><select value={game.multiplayer_type} onChange={e => set("multiplayer_type", e.target.value)} className={inp}>{MULTIPLAYER.map(v => <option key={v} value={v}>{v.replace("_", " ")}</option>)}</select></div>
        <div><label className={lbl}>Pacing</label><select value={game.gameplay_pacing} onChange={e => set("gameplay_pacing", e.target.value)} className={inp}>{PACING.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={lbl}>Session Style</label><select value={game.session_style} onChange={e => set("session_style", e.target.value)} className={inp}>{SESSION.map(v => <option key={v} value={v}>{v.replace("_", " ")}</option>)}</select></div>
        <div><label className={lbl}>Difficulty</label><select value={game.difficulty_style} onChange={e => set("difficulty_style", e.target.value)} className={inp}>{DIFFICULTY.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
      </div>
      <div><label className={lbl}>Camera</label><select value={game.camera_style} onChange={e => set("camera_style", e.target.value)} className={inp}>{CAMERA.map(v => <option key={v} value={v}>{v.replace("_", " ")}</option>)}</select></div>
      <div><label className={lbl}>Core Objective</label><textarea value={game.core_objective} onChange={e => set("core_objective", e.target.value)} rows={2} className={inp + " resize-none"} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={lbl}>Win Conditions</label><textarea value={game.win_conditions} onChange={e => set("win_conditions", e.target.value)} rows={2} className={inp + " resize-none"} /></div>
        <div><label className={lbl}>Fail Conditions</label><textarea value={game.fail_conditions} onChange={e => set("fail_conditions", e.target.value)} rows={2} className={inp + " resize-none"} /></div>
      </div>
      <div><label className={lbl}>Challenge Notes</label><textarea value={game.challenge_notes} onChange={e => set("challenge_notes", e.target.value)} rows={2} className={inp + " resize-none"} /></div>
      <div><label className={lbl}>Safety Notes</label><input value={game.safety_notes} onChange={e => set("safety_notes", e.target.value)} className={inp} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={lbl}>Sort Priority</label><input type="number" value={game.sort_priority} onChange={e => set("sort_priority", +e.target.value)} className={inp} /></div>
        <div className="flex items-end gap-3 pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={game.challenge_friendly} onChange={e => set("challenge_friendly", e.target.checked)} className="accent-pink-400" />
            <span className="text-xs font-mono text-pink-400">Challenge Friendly</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={game.is_active} onChange={e => set("is_active", e.target.checked)} className="accent-green-400" />
            <span className="text-xs font-mono text-green-400">Active</span>
          </label>
        </div>
      </div>
      <button onClick={onSave} disabled={saving || !game.title}
        className="w-full bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3 rounded text-xs hover:bg-cyan-300 transition-all disabled:opacity-40">
        {saving ? "Saving…" : game.id ? "Update Game" : "Create Game"}
      </button>
    </div>
  );
}
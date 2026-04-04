import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Swords, ArrowLeft, Zap, Loader2, Edit2, Check, ExternalLink, CheckCircle } from "lucide-react";

const GOALS = {
  grow_followers: "Grow Followers",
  increase_viewers: "Increase Viewers",
  improve_consistency: "Improve Consistency",
  build_community: "Build Community",
  monetize: "Monetize",
};

const TONES = {
  hype: "🔥 Hype",
  chill: "😎 Chill",
  competitive: "⚡ Competitive",
  funny: "😂 Funny",
  serious: "🎯 Serious",
  community: "🤝 Community",
};

const NICHES = {
  fps: "FPS", battle_royale: "Battle Royale", rpg: "RPG", sports: "Sports",
  mobile: "Mobile", variety: "Variety", horror: "Horror", retro: "Retro", other: "Other",
};

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

const CONNECTOR_ID = "69c7e25af1fbef3a6d3efd4d";

export default function OnboardingReview({ profileData, games, topGameIds, onToggleTop, onUpdateProfile, onConfirm, onBack, saving }) {
  const [editField, setEditField] = useState(null);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [connectingTikTok, setConnectingTikTok] = useState(false);

  const set = (key, value) => onUpdateProfile({ ...profileData, [key]: value });

  const connectTikTok = async () => {
    setConnectingTikTok(true);
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, "_blank");
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnectingTikTok(false);
        base44.functions.invoke("syncTikTokProfile", {}).then(() => setTiktokConnected(true)).catch(() => setTiktokConnected(true));
      }
    }, 500);
  };

  const chip = (active, label, onClick) => (
    <button onClick={onClick}
      className={`text-[10px] font-mono uppercase px-2.5 py-2 rounded-lg border transition-all ${
        active ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "border-cyan-900/20 text-slate-600 hover:text-slate-300"
      }`}>
      {label}
    </button>
  );

  return (
    <div className="bg-[#060d1f] border border-cyan-900/40 rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">// Review Your Profile</div>
      </div>

      {/* Identity */}
      <Section title="Identity">
        <EditableField label="Creator Name" value={profileData.display_name} onChange={v => set("display_name", v)} />
        <EditableField label="TikTok Handle" value={profileData.tiktok_handle} placeholder="@handle" onChange={v => set("tiktok_handle", v)} />
      </Section>

      {/* Games */}
      <Section title="Your Games">
        <p className="text-[10px] font-mono text-slate-700 mb-2">Click ★ to mark your top games (up to 3)</p>
        <div className="space-y-1.5">
          {games.map(game => {
            const isTop = topGameIds.includes(game.id);
            return (
              <div key={game.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                  isTop ? "border-yellow-400/20 bg-yellow-400/[0.03]" : "border-cyan-900/15"
                }`}>
                <button onClick={() => onToggleTop(game.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    isTop ? "bg-yellow-400 text-[#02040f]" : "bg-[#02040f] border border-cyan-900/30 text-slate-700 hover:text-yellow-400"
                  }`}>
                  <Star className={`w-3 h-3 ${isTop ? "fill-current" : ""}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-white">{game.title}</span>
                  <span className="text-[10px] font-mono text-slate-600 ml-2">{game.genres?.slice(0, 2).join(" · ")}</span>
                </div>
                {game.challenge_friendly && <Swords className="w-3.5 h-3.5 text-pink-400/60 shrink-0" />}
                {game.source === "ai_created" && (
                  <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400/60 shrink-0">AI Added</span>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Goal & Style */}
      <Section title="Goal & Style">
        <div>
          <label className="text-[9px] font-mono uppercase text-slate-600 block mb-1.5">Stream Goal</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(GOALS).map(([k, v]) => chip(profileData.stream_goal === k, v, () => set("stream_goal", k)))}
          </div>
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase text-slate-600 block mb-1.5">Promo Tone</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(TONES).map(([k, v]) => chip(profileData.promo_tone === k, v, () => set("promo_tone", k)))}
          </div>
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase text-slate-600 block mb-1.5">Niche</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(NICHES).map(([k, v]) => chip(profileData.creator_niche === k, v, () => set("creator_niche", k)))}
          </div>
        </div>
      </Section>

      {/* Schedule */}
      <Section title="Schedule">
        <div>
          <label className="text-[9px] font-mono uppercase text-slate-600 block mb-1.5">Weekly Target</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map(n => chip(profileData.weekly_stream_target === n, `${n}×`, () => set("weekly_stream_target", n)))}
          </div>
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase text-slate-600 block mb-1.5">Preferred Days</label>
          <div className="flex gap-1.5">
            {DAYS.map(d => chip(
              (profileData.preferred_stream_days || []).includes(d),
              DAY_LABELS[d],
              () => set("preferred_stream_days",
                (profileData.preferred_stream_days || []).includes(d)
                  ? (profileData.preferred_stream_days || []).filter(x => x !== d)
                  : [...(profileData.preferred_stream_days || []), d]
              )
            ))}
          </div>
        </div>
        <EditableField label="Preferred Time" value={profileData.preferred_stream_time} placeholder="19:00" onChange={v => set("preferred_stream_time", v)} type="time" />
      </Section>

      {/* TikTok connect */}
      <Section title="Connect TikTok (Optional)">
        <p className="text-xs font-mono text-slate-500 leading-relaxed mb-3">
          Imports your profile stats, follower count, and video library automatically.
        </p>
        {tiktokConnected ? (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-mono text-green-400">TikTok connected!</span>
          </div>
        ) : (
          <button onClick={connectTikTok} disabled={connectingTikTok}
            className="w-full flex items-center justify-center gap-2 bg-pink-500/10 border border-pink-500/40 text-pink-400 font-black uppercase tracking-widest py-3 rounded-lg text-xs hover:bg-pink-500/20 transition-all disabled:opacity-50">
            <ExternalLink className="w-4 h-4" />
            {connectingTikTok ? "Connecting…" : "Connect TikTok"}
          </button>
        )}
      </Section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-3.5 rounded-lg border border-cyan-900/40 text-slate-500 text-xs font-mono uppercase tracking-widest hover:text-slate-300 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button onClick={onConfirm} disabled={saving || !profileData.display_name}
          className="flex-1 flex items-center justify-center gap-2 bg-cyan-400 text-[#02040f] font-black uppercase tracking-widest py-3.5 rounded-lg text-sm hover:bg-cyan-300 transition-all disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</> : <><Zap className="w-4 h-4" /> Launch AltCtrl</>}
        </button>
      </div>

      <p className="text-center text-[10px] font-mono text-slate-700">// You can change all settings later in your profile.</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-400/60 border-b border-white/[0.03] pb-1">{title}</div>
      {children}
    </div>
  );
}

function EditableField({ label, value, placeholder, onChange, type = "text" }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value || "");

  const save = () => { onChange(temp); setEditing(false); };

  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="min-w-0">
        <label className="text-[9px] font-mono uppercase text-slate-600 block">{label}</label>
        {editing ? (
          <div className="flex items-center gap-1.5 mt-0.5">
            <input type={type} value={temp} onChange={e => setTemp(e.target.value)} autoFocus
              onKeyDown={e => e.key === "Enter" && save()}
              onBlur={save}
              className="bg-[#02040f] border border-cyan-500/30 text-white rounded px-2 py-1 text-sm outline-none font-mono w-full" />
          </div>
        ) : (
          <span className={`text-sm ${value ? "text-white font-bold" : "text-slate-600"}`}>{value || placeholder || "—"}</span>
        )}
      </div>
      {!editing && (
        <button onClick={() => { setTemp(value || ""); setEditing(true); }}
          className="p-1.5 text-slate-700 hover:text-cyan-400 transition-colors shrink-0">
          <Edit2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
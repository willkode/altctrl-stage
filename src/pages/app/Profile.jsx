import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import { Camera, Check, Zap, LogOut } from "lucide-react";
import { useAppToast } from "../../hooks/useAppToast";

const NICHES = ["fps","battle_royale","rpg","sports","mobile","variety","horror","retro","other"];
const STYLES = ["solo_grind","community_focused","educational","entertainment","competitive"];
const TIMEZONES = [
  "UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
  "America/Sao_Paulo","Europe/London","Europe/Paris","Europe/Berlin","Europe/Moscow",
  "Asia/Dubai","Asia/Kolkata","Asia/Bangkok","Asia/Tokyo","Asia/Seoul","Asia/Shanghai",
  "Australia/Sydney","Pacific/Auckland",
];
const REGIONS = [
  "North America","South America","Europe","Middle East","South Asia",
  "Southeast Asia","East Asia","Oceania","Africa","Other",
];

const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-3 py-2.5 text-sm outline-none transition-all font-mono";
const lbl = "block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5";
const sel = inp + " appearance-none";

function ChipSelect({ options, value, onChange, accent = "cyan" }) {
  const colors = {
    cyan:   { active: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",   inactive: "bg-[#02040f] border-cyan-900/30 text-slate-600 hover:text-slate-300" },
    yellow: { active: "bg-yellow-400/10 border-yellow-400/30 text-yellow-400", inactive: "bg-[#02040f] border-cyan-900/30 text-slate-600 hover:text-slate-300" },
  };
  const c = colors[accent] || colors.cyan;
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded border text-[11px] font-mono uppercase transition-all ${value === o ? c.active : c.inactive}`}>
          {o.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 space-y-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 pb-1 border-b border-white/5">{title}</div>
      {children}
    </div>
  );
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [languageInput, setLanguageInput] = useState("");
  const fileRef = useRef(null);
  const toast = useAppToast();

  const [form, setForm] = useState({
    display_name: "", tiktok_handle: "", avatar_url: "", bio: "",
    creator_niche: "variety", content_style: "entertainment",
    region: "", timezone: "UTC", languages: [],
    avg_viewers: "", follower_count: "",
  });

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    setLoading(true);
    const user = await base44.auth.me();
    const profiles = await base44.entities.CreatorProfile.filter({ created_by: user.email });
    if (profiles[0]) {
      const p = profiles[0];
      setProfileId(p.id);
      setForm({
        display_name: p.display_name || "",
        tiktok_handle: p.tiktok_handle || "",
        avatar_url: p.avatar_url || "",
        bio: p.bio || "",
        creator_niche: p.creator_niche || "variety",
        content_style: p.content_style || "entertainment",
        region: p.region || "",
        timezone: p.timezone || "UTC",
        languages: p.languages || [],
        avg_viewers: p.avg_viewers ?? "",
        follower_count: p.follower_count ?? "",
      });
    }
    setLoading(false);
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("avatar_url", file_url);
    setUploadingAvatar(false);
  }

  function addLanguage() {
    const lang = languageInput.trim();
    if (!lang || form.languages.includes(lang)) return;
    set("languages", [...form.languages, lang]);
    setLanguageInput("");
  }

  function removeLanguage(lang) {
    set("languages", form.languages.filter(l => l !== lang));
  }

  async function handleSave() {
    if (!form.display_name?.trim()) return;
    setSaving(true);
    const data = {
      ...form,
      avg_viewers: form.avg_viewers === "" ? null : Number(form.avg_viewers),
      follower_count: form.follower_count === "" ? null : Number(form.follower_count),
    };
    if (profileId) {
      await base44.entities.CreatorProfile.update(profileId, data);
    } else {
      const created = await base44.entities.CreatorProfile.create(data);
      setProfileId(created.id);
    }
    setSaved(true);
    setSaving(false);
    toast.saved("Profile updated!");
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <PageContainer><LoadingState message="Loading profile..." /></PageContainer>;

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// CREATOR_PROFILE</div>
          <h1 className="text-2xl font-black uppercase text-white">Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-mono">Your identity and baseline stats.</p>
        </div>
        <button onClick={() => base44.auth.logout()}
          className="flex items-center gap-1.5 text-xs font-mono uppercase text-slate-700 hover:text-red-400 transition-colors mt-1">
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>

      <div className="space-y-5">
        {/* Avatar + Identity */}
        <Section title="// Identity">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-xl border-2 border-cyan-900/40 overflow-hidden bg-[#02040f] flex items-center justify-center">
                {form.avatar_url
                  ? <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  : <span className="text-3xl font-black text-slate-700">{form.display_name?.[0]?.toUpperCase() || "?"}</span>
                }
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-all">
                {uploadingAvatar ? <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <label className={lbl}>Display Name *</label>
                <input value={form.display_name} onChange={e => set("display_name", e.target.value)} placeholder="YourName" className={inp} />
              </div>
              <div>
                <label className={lbl}>TikTok Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-sm">@</span>
                  <input value={form.tiktok_handle} onChange={e => set("tiktok_handle", e.target.value)} placeholder="yourhandle" className={inp + " pl-7"} />
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className={lbl}>Bio</label>
            <textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3}
              placeholder="Tell the system who you are as a creator…"
              className={inp + " resize-none"} />
          </div>
        </Section>

        {/* Content Style */}
        <Section title="// Content Style">
          <div>
            <label className={lbl}>Creator Niche</label>
            <ChipSelect options={NICHES} value={form.creator_niche} onChange={v => set("creator_niche", v)} accent="cyan" />
          </div>
          <div>
            <label className={lbl}>Content Style</label>
            <ChipSelect options={STYLES} value={form.content_style} onChange={v => set("content_style", v)} accent="yellow" />
          </div>
        </Section>

        {/* Location & Language */}
        <Section title="// Location & Language">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Region</label>
              <select value={form.region} onChange={e => set("region", e.target.value)} className={sel}>
                <option value="">Select region…</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Timezone</label>
              <select value={form.timezone} onChange={e => set("timezone", e.target.value)} className={sel}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={lbl}>Languages</label>
            <div className="flex gap-2">
              <input value={languageInput} onChange={e => setLanguageInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addLanguage()}
                placeholder="English, Spanish…" className={inp} />
              <button onClick={addLanguage}
                className="px-4 rounded border border-cyan-900/40 text-cyan-400 hover:border-cyan-500/40 text-xs font-mono uppercase transition-all shrink-0">
                Add
              </button>
            </div>
            {form.languages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.languages.map(l => (
                  <span key={l} className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    {l}
                    <button onClick={() => removeLanguage(l)} className="text-cyan-600 hover:text-white transition-colors ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Baseline Stats */}
        <Section title="// Baseline Stats">
          <p className="text-xs font-mono text-slate-600 -mt-1">Used by the AI coach to calibrate recommendations.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Average Viewers</label>
              <input type="number" min={0} value={form.avg_viewers} onChange={e => set("avg_viewers", e.target.value)}
                placeholder="e.g. 42" className={inp} />
            </div>
            <div>
              <label className={lbl}>Follower Count</label>
              <input type="number" min={0} value={form.follower_count} onChange={e => set("follower_count", e.target.value)}
                placeholder="e.g. 1500" className={inp} />
            </div>
          </div>
        </Section>

        {/* Save */}
        <button onClick={handleSave} disabled={saving || !form.display_name?.trim()}
          className={`w-full flex items-center justify-center gap-2 font-black uppercase tracking-widest py-4 rounded text-sm transition-all disabled:opacity-40 ${
            saved ? "bg-green-400 text-[#02040f]" : "bg-cyan-400 text-[#02040f] hover:bg-cyan-300"
          }`}>
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? "Saving…" : <><Zap className="w-4 h-4" /> Save Profile</>}
        </button>
      </div>
    </PageContainer>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageContainer from "../../components/app/PageContainer";
import LoadingState from "../../components/app/LoadingState";
import { Check, Zap, ExternalLink, AlertTriangle, Download } from "lucide-react";
import { useAppToast } from "../../hooks/useAppToast";

const PROMO_TONES = ["hype","chill","competitive","funny","serious","community"];
const STREAM_DAYS = ["mon","tue","wed","thu","fri","sat","sun"];
const STREAM_TYPES = ["ranked","chill","viewer_games","challenge","collab","special","other"];
const DURATIONS = [30, 45, 60, 90, 120, 180, 240];

const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-3 py-2.5 text-sm outline-none transition-all font-mono";
const lbl = "block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5";

function Section({ title, accent = "cyan", children }) {
  const colors = { cyan: "text-cyan-400 border-cyan-900/20", yellow: "text-yellow-400 border-yellow-900/20", pink: "text-pink-400 border-pink-900/20", red: "text-red-400 border-red-900/20" };
  return (
    <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl p-5 space-y-4">
      <div className={`text-[10px] font-mono uppercase tracking-widest pb-2 border-b ${colors[accent] || colors.cyan}`}>{title}</div>
      {children}
    </div>
  );
}

function Toggle({ label, sublabel, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
      <div>
        <div className="text-sm text-white font-mono">{label}</div>
        {sublabel && <div className="text-[11px] text-slate-600 font-mono mt-0.5">{sublabel}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-all shrink-0 ${checked ? "bg-cyan-500" : "bg-slate-800 border border-cyan-900/40"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function ChipSelect({ options, value, onChange, multi = false }) {
  const isActive = (o) => multi ? (value || []).includes(o) : value === o;
  const handleClick = (o) => {
    if (multi) {
      const arr = value || [];
      onChange(arr.includes(o) ? arr.filter(x => x !== o) : [...arr, o]);
    } else {
      onChange(o);
    }
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button key={o} type="button" onClick={() => handleClick(o)}
          className={`px-3 py-1.5 rounded border text-[11px] font-mono uppercase transition-all ${
            isActive(o)
              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
              : "bg-[#02040f] border-cyan-900/30 text-slate-600 hover:text-slate-300"
          }`}>
          {o.toString().replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}

function SaveBar({ saving, saved, onSave, dirty }) {
  if (!dirty && !saved) return null;
  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#060d1f] border border-cyan-500/30 rounded-xl px-5 py-3 shadow-2xl shadow-black/60">
      {saved
        ? <span className="flex items-center gap-2 text-sm font-mono text-green-400"><Check className="w-4 h-4" /> Settings saved</span>
        : <span className="text-sm font-mono text-slate-400">Unsaved changes</span>}
      {!saved && (
        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-1.5 text-xs font-mono uppercase px-4 py-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-40">
          <Zap className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
        </button>
      )}
    </div>
  );
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [notifId, setNotifId] = useState(null);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const toast = useAppToast();

  const CONNECTOR_ID = "69c7e25af1fbef3a6d3efd4d";

  // Promo + streaming prefs (CreatorProfile)
  const [promo, setPromo] = useState({
    promo_tone: "hype",
    promo_notes: "",
    weekly_stream_target: 3,
    preferred_stream_time: "",
    preferred_stream_days: [],
    preferred_duration_minutes: 60,
    stream_type_preferences: [],
  });

  // Notification prefs (NotificationPrefs)
  const [notif, setNotif] = useState({
    pre_stream_reminder: true,
    promo_reminder: true,
    daily_coaching_card: true,
    weekly_plan_reminder: true,
    weekly_recap_notification: true,
    goal_alerts: true,
    performance_alerts: true,
    milestone_notifications: true,
    email_weekly_recap: false,
    email_performance_alerts: false,
    notification_email: "",
  });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const user = await base44.auth.me();
    const [profiles, notifs] = await Promise.all([
      base44.entities.CreatorProfile.filter({ created_by: user.email }),
      base44.entities.NotificationPrefs.filter({ created_by: user.email }),
    ]);
    if (profiles[0]) {
      const p = profiles[0];
      setProfileId(p.id);
      setPromo({
        promo_tone: p.promo_tone || "hype",
        promo_notes: p.promo_notes || "",
        weekly_stream_target: p.weekly_stream_target || 3,
        preferred_stream_time: p.preferred_stream_time || "",
        preferred_stream_days: p.preferred_stream_days || [],
        preferred_duration_minutes: p.preferred_duration_minutes || 60,
        stream_type_preferences: p.stream_type_preferences || [],
      });
    }
    if (notifs[0]) {
      setNotifId(notifs[0].id);
      setNotif({ ...notif, ...notifs[0] });
    }
    // Check TikTok connection
    try {
      await base44.connectors.connectAppUser(CONNECTOR_ID);
      // If no error thrown it means we can attempt — check via try/catch on a fetch
    } catch {}
    setLoading(false);
  }

  const setP = (k, v) => { setPromo(f => ({ ...f, [k]: v })); setDirty(true); setSaved(false); };

  async function savePromo() {
    if (!profileId) return;
    setSaving(true);
    await base44.entities.CreatorProfile.update(profileId, {
      promo_tone: promo.promo_tone,
      promo_notes: promo.promo_notes,
      weekly_stream_target: Number(promo.weekly_stream_target),
      preferred_stream_time: promo.preferred_stream_time,
      preferred_stream_days: promo.preferred_stream_days,
      preferred_duration_minutes: promo.preferred_duration_minutes,
      stream_type_preferences: promo.stream_type_preferences,
    });
    setSaving(false);
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 2500);
  }

  async function saveNotif(updated) {
    const data = { ...notif, ...updated };
    setNotif(data);
    if (notifId) {
      await base44.entities.NotificationPrefs.update(notifId, updated);
    } else {
      const created = await base44.entities.NotificationPrefs.create(data);
      setNotifId(created.id);
    }
  }

  async function handleExport() {
    const user = await base44.auth.me();
    const [sessions, streams, goals, recaps] = await Promise.all([
      base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 500),
      base44.entities.ScheduledStream.filter({ created_by: user.email }, "-scheduled_date", 500),
      base44.entities.GrowthGoal.filter({ created_by: user.email }, "-created_date", 100),
      base44.entities.WeeklyRecap.filter({ created_by: user.email }, "-week_number", 52),
    ]);
    const blob = new Blob([JSON.stringify({ sessions, streams, goals, recaps }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "altctrl-export.json"; a.click();
    URL.revokeObjectURL(url);
    toast.saved("Data exported!");
  }

  async function handleDeleteAllSessions() {
    if (!confirm("Delete ALL your session data? This cannot be undone.")) return;
    const user = await base44.auth.me();
    const sessions = await base44.entities.LiveSession.filter({ created_by: user.email }, "-stream_date", 500);
    await Promise.all(sessions.map(s => base44.entities.LiveSession.delete(s.id)));
    toast.deleted("All sessions deleted");
  }

  async function connectTikTok() {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, "_blank");
    const timer = setInterval(() => {
      if (!popup || popup.closed) { clearInterval(timer); setTiktokConnected(true); }
    }, 500);
  }

  if (loading) return <PageContainer><LoadingState message="Loading settings..." /></PageContainer>;

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">// SYSTEM_CONFIG</div>
        <h1 className="text-2xl font-black uppercase text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">Configure your creator operating system.</p>
      </div>

      <div className="space-y-5">
        {/* Promo Settings */}
        <Section title="// Promo Settings" accent="cyan">
          <div>
            <label className={lbl}>Promo Voice / Tone</label>
            <ChipSelect options={PROMO_TONES} value={promo.promo_tone} onChange={v => setP("promo_tone", v)} />
          </div>
          <div>
            <label className={lbl}>Custom Promo Instructions</label>
            <textarea value={promo.promo_notes} onChange={e => setP("promo_notes", e.target.value)}
              rows={3} placeholder="Always mention my Discord. Use emojis. Keep it under 100 words…"
              className={inp + " resize-none"} />
            <p className="text-[10px] font-mono text-slate-700 mt-1">These notes are injected into every AI promo kit generation.</p>
          </div>
        </Section>

        {/* Streaming Preferences */}
        <Section title="// Streaming Preferences" accent="yellow">
          <div>
            <label className={lbl}>Weekly Stream Target</label>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={14} value={promo.weekly_stream_target}
                onChange={e => setP("weekly_stream_target", Number(e.target.value))}
                className="flex-1 accent-cyan-400" />
              <span className="text-white font-black font-mono text-lg w-8 text-right">{promo.weekly_stream_target}</span>
            </div>
          </div>

          <div>
            <label className={lbl}>Preferred Stream Days</label>
            <ChipSelect options={STREAM_DAYS} value={promo.preferred_stream_days} onChange={v => setP("preferred_stream_days", v)} multi />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Preferred Start Time</label>
              <input type="time" value={promo.preferred_stream_time}
                onChange={e => setP("preferred_stream_time", e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Preferred Duration</label>
              <div className="flex flex-wrap gap-1.5">
                {DURATIONS.map(d => (
                  <button key={d} type="button"
                    onClick={() => setP("preferred_duration_minutes", d)}
                    className={`px-3 py-1.5 rounded border text-[11px] font-mono transition-all ${
                      promo.preferred_duration_minutes === d
                        ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                        : "bg-[#02040f] border-cyan-900/30 text-slate-600 hover:text-slate-300"
                    }`}>
                    {d}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className={lbl}>Stream Type Preferences</label>
            <ChipSelect options={STREAM_TYPES} value={promo.stream_type_preferences} onChange={v => setP("stream_type_preferences", v)} multi />
          </div>
        </Section>

        {/* Notification Preferences */}
        <Section title="// Notification Preferences" accent="pink">
          <Toggle label="Pre-stream reminder" sublabel="Notified before a scheduled stream" checked={notif.pre_stream_reminder} onChange={v => saveNotif({ pre_stream_reminder: v })} />
          <Toggle label="Promo reminder" sublabel="Reminded to post promo before going live" checked={notif.promo_reminder} onChange={v => saveNotif({ promo_reminder: v })} />
          <Toggle label="Daily coaching card" sublabel="Today's focus and action items" checked={notif.daily_coaching_card} onChange={v => saveNotif({ daily_coaching_card: v })} />
          <Toggle label="Weekly plan reminder" sublabel="Start-of-week plan notification" checked={notif.weekly_plan_reminder} onChange={v => saveNotif({ weekly_plan_reminder: v })} />
          <Toggle label="Weekly recap" sublabel="End-of-week performance summary" checked={notif.weekly_recap_notification} onChange={v => saveNotif({ weekly_recap_notification: v })} />
          <Toggle label="Goal alerts" sublabel="Notified when goals are hit or missed" checked={notif.goal_alerts} onChange={v => saveNotif({ goal_alerts: v })} />
          <Toggle label="Performance alerts" sublabel="Insights from your session patterns" checked={notif.performance_alerts} onChange={v => saveNotif({ performance_alerts: v })} />
          <Toggle label="Milestone notifications" sublabel="Streaks, records, and achievements" checked={notif.milestone_notifications} onChange={v => saveNotif({ milestone_notifications: v })} />

          <div className="pt-2 border-t border-white/5 space-y-0">
            <div className="text-[10px] font-mono uppercase text-pink-400/70 mb-3">Email Notifications</div>
            <Toggle label="Email weekly recap" checked={notif.email_weekly_recap} onChange={v => saveNotif({ email_weekly_recap: v })} />
            <Toggle label="Email performance alerts" checked={notif.email_performance_alerts} onChange={v => saveNotif({ email_performance_alerts: v })} />
            {(notif.email_weekly_recap || notif.email_performance_alerts) && (
              <div className="pt-2">
                <label className={lbl}>Notification Email</label>
                <input value={notif.notification_email}
                  onChange={e => setNotif(f => ({ ...f, notification_email: e.target.value }))}
                  onBlur={() => saveNotif({ notification_email: notif.notification_email })}
                  placeholder="you@email.com" type="email" className={inp} />
              </div>
            )}
          </div>
        </Section>

        {/* TikTok Connection */}
        <Section title="// TikTok Connection" accent="pink">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white font-mono">TikTok Account</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">Connect your TikTok to enable future live data sync features.</p>
            </div>
            {tiktokConnected ? (
              <span className="text-[11px] font-mono uppercase px-3 py-1.5 rounded bg-green-500/10 border border-green-500/30 text-green-400">Connected</span>
            ) : (
              <button onClick={connectTikTok}
                className="flex items-center gap-1.5 text-xs font-mono uppercase px-4 py-2 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 transition-all shrink-0">
                <ExternalLink className="w-3.5 h-3.5" /> Connect
              </button>
            )}
          </div>
        </Section>

        {/* Data Export */}
        <Section title="// Data Export" accent="cyan">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white font-mono">Export your data</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">Download all sessions, streams, goals, and recaps as JSON.</p>
            </div>
            <button onClick={handleExport}
              className="flex items-center gap-1.5 text-xs font-mono uppercase px-4 py-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all shrink-0">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </Section>

        {/* Danger Zone */}
        <Section title="// Danger Zone" accent="red">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white font-mono">Delete all session data</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">Permanently removes all logged sessions. Cannot be undone.</p>
            </div>
            <button onClick={handleDeleteAllSessions}
              className="flex items-center gap-1.5 text-xs font-mono uppercase px-4 py-2 rounded bg-red-500/10 border border-red-900/40 text-red-500 hover:bg-red-500/20 hover:border-red-500/40 transition-all shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </Section>
      </div>

      <SaveBar dirty={dirty} saved={saved} saving={saving} onSave={savePromo} />
    </PageContainer>
  );
}
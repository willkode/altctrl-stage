const lbl = "block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5";
const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-3 py-2.5 text-sm outline-none transition-all font-mono";
const textarea = inp + " resize-none";

export default function CreatorDebrief({ session, onChange }) {
  return (
    <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl p-5 space-y-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-pink-400">// Creator Debrief</div>
      <p className="text-xs font-mono text-slate-600">Your interpretation of the stream. These notes stay private.</p>

      <div>
        <label className={lbl}>Best Moment</label>
        <textarea
          value={session.best_moment || ""}
          onChange={e => onChange({ ...session, best_moment: e.target.value })}
          placeholder="What was the highlight? A big play, funny moment, community interaction…"
          rows={2}
          className={textarea}
        />
      </div>

      <div>
        <label className={lbl}>Weakest Moment</label>
        <textarea
          value={session.weakest_moment || ""}
          onChange={e => onChange({ ...session, weakest_moment: e.target.value })}
          placeholder="Where did you struggle? Technical issues, dead chat, boring gameplay…"
          rows={2}
          className={textarea}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>What Caused a Spike?</label>
          <textarea
            value={session.spike_reason || ""}
            onChange={e => onChange({ ...session, spike_reason: e.target.value })}
            placeholder="Why did viewers jump? Game moment? Hype? Shout-out?"
            rows={2}
            className={textarea}
          />
        </div>
        <div>
          <label className={lbl}>What Caused Drop-Off?</label>
          <textarea
            value={session.drop_off_reason || ""}
            onChange={e => onChange({ ...session, drop_off_reason: e.target.value })}
            placeholder="Where did you lose people? Technical? Pacing? Wrong game?"
            rows={2}
            className={textarea}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Quality & Audience Notes</label>
          <textarea
            value={session.notes || ""}
            onChange={e => onChange({ ...session, notes: e.target.value })}
            placeholder="Was chat engaged? Did you connect with the audience? Energy level…"
            rows={2}
            className={textarea}
          />
        </div>
        <div>
          <label className={lbl}>Monetization Notes</label>
          <textarea
            value={session.monetization_notes || ""}
            onChange={e => onChange({ ...session, monetization_notes: e.target.value })}
            placeholder="Gift behavior? Fan club interest? Donation moments?"
            rows={2}
            className={textarea}
          />
        </div>
      </div>

      <div>
        <label className={lbl}>What To Test Next Time</label>
        <textarea
          value={session.test_next_time || ""}
          onChange={e => onChange({ ...session, test_next_time: e.target.value })}
          placeholder="Different game? Earlier start time? New content format? Experiment idea…"
          rows={2}
          className={textarea}
        />
      </div>

      <div className="border-t border-pink-900/20 pt-4 space-y-2">
        <label className="flex items-center gap-2 text-sm font-mono cursor-pointer">
          <input
            type="checkbox"
            checked={session.would_repeat ?? true}
            onChange={e => onChange({ ...session, would_repeat: e.target.checked })}
            className="w-4 h-4 rounded border border-pink-900/40 bg-[#02040f] accent-pink-400"
          />
          <span className="text-white">Would repeat this format</span>
        </label>
        <label className="flex items-center gap-2 text-sm font-mono cursor-pointer">
          <input
            type="checkbox"
            checked={session.went_as_planned ?? true}
            onChange={e => onChange({ ...session, went_as_planned: e.target.checked })}
            className="w-4 h-4 rounded border border-pink-900/40 bg-[#02040f] accent-pink-400"
          />
          <span className="text-white">Stream went as planned</span>
        </label>
      </div>
    </div>
  );
}
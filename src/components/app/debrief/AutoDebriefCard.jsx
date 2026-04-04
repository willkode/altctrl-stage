import { Star } from "lucide-react";

const TYPE_COLORS = {
  highlight: "border-yellow-400/30 text-yellow-400",
  peak: "border-green-400/30 text-green-400",
  dead_zone: "border-red-400/30 text-red-400",
  drop: "border-pink-400/30 text-pink-400",
  insight: "border-cyan-400/30 text-cyan-400",
};

export default function AutoDebriefCard({ review }) {
  if (!review) return null;

  const timestampNotes = (() => {
    try { return JSON.parse(review.timestamp_notes || "[]"); } catch { return []; }
  })();

  return (
    <div className="space-y-4">
      {/* Rating */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(n => (
            <Star key={n} className={`w-4 h-4 ${n <= (review.overall_rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}`} />
          ))}
        </div>
        <span className="text-xs font-mono text-slate-500">{review.overall_rating}/5 vs baseline</span>
      </div>

      {/* Sections */}
      <ReviewSection label="Strongest Opening" content={review.strongest_opening} accent="green" />
      <ReviewSection label="Peak Engagement" content={review.strongest_engagement} accent="cyan" />
      <ReviewSection label="Dead Zones" content={review.dead_zones} accent="red" />
      <ReviewSection label="Clip-Worthy" content={review.clip_worthy} accent="pink" />
      <ReviewSection label="Lessons" content={review.lessons} accent="yellow" />

      {/* Timeline notes */}
      {timestampNotes.length > 0 && (
        <div className="bg-[#02040f] border border-cyan-900/15 rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 mb-3">Timeline Analysis</p>
          <div className="space-y-2">
            {timestampNotes.map((tn, i) => (
              <div key={i} className={`flex items-start gap-3 px-3 py-2 rounded-lg border bg-[#060d1f]/50 ${TYPE_COLORS[tn.type] || TYPE_COLORS.insight}`}>
                <span className="text-[10px] font-mono font-bold shrink-0 mt-0.5 w-10">{tn.minute != null ? `${tn.minute}m` : "—"}</span>
                <span className="text-xs text-slate-300 leading-relaxed">{tn.note}</span>
                <span className="text-[8px] font-mono uppercase tracking-widest opacity-60 shrink-0 mt-0.5">{tn.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewSection({ label, content, accent = "cyan" }) {
  if (!content) return null;
  const colors = {
    cyan: "border-cyan-900/20 text-cyan-400/60",
    green: "border-green-900/20 text-green-400/60",
    red: "border-red-900/20 text-red-400/60",
    pink: "border-pink-900/20 text-pink-400/60",
    yellow: "border-yellow-900/20 text-yellow-400/60",
  }[accent] || "border-cyan-900/20 text-cyan-400/60";

  return (
    <div className={`bg-[#02040f] border ${colors.split(" ")[0]} rounded-xl p-4`}>
      <p className={`text-[10px] font-mono uppercase tracking-widest ${colors.split(" ")[1]} mb-2`}>{label}</p>
      <p className="text-sm text-slate-300 leading-relaxed">{content}</p>
    </div>
  );
}
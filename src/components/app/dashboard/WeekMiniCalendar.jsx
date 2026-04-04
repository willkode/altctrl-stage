import ProgressBar from "../ProgressBar";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export default function WeekMiniCalendar({ weekDays, weekCompleted, weekTarget }) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-[#060d1f]/80 border border-cyan-900/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60">This Week</span>
        <span className="text-[10px] font-mono text-slate-600">{weekCompleted}/{weekTarget}</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-4">
        {weekDays.map((day, i) => {
          const isToday = day.dateStr === today;
          const done = day.stream?.status === "completed";
          const hasStream = !!day.stream;
          return (
            <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
              isToday ? "bg-cyan-400/10 ring-1 ring-cyan-400/30" :
              done ? "bg-cyan-400/5" : "bg-[#02040f]/60"
            }`}>
              <span className={`text-[9px] font-mono uppercase ${isToday ? "text-cyan-400" : "text-slate-600"}`}>{DAY_LETTERS[i]}</span>
              {done ? <span className="text-cyan-400 text-[8px]">✓</span> :
               hasStream ? <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_4px_#00f5ff]" /> :
               <span className="w-1 h-1 rounded-full bg-slate-800" />}
            </div>
          );
        })}
      </div>
      <ProgressBar value={weekCompleted} max={weekTarget} label="Weekly target" accent="cyan" />
    </div>
  );
}
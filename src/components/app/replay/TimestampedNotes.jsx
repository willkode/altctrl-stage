import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

export default function TimestampedNotes({ notes, onChange }) {
  const [localNotes, setLocalNotes] = useState(notes ? JSON.parse(notes) : []);
  const [mm, setMm] = useState("");
  const [ss, setSs] = useState("");
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    const ts = `${mm || "0"}:${(ss || "0").padStart(2, "0")}`;
    const newNotes = [...localNotes, { ts, text }];
    setLocalNotes(newNotes);
    onChange(JSON.stringify(newNotes));
    setMm(""); setSs(""); setText("");
  };

  const remove = (i) => {
    const newNotes = localNotes.filter((_, idx) => idx !== i);
    setLocalNotes(newNotes);
    onChange(JSON.stringify(newNotes));
  };

  const inp = "bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-2.5 py-1.5 text-xs outline-none transition-all font-mono";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex items-end gap-1">
          <div>
            <label className="block text-[9px] font-mono uppercase text-slate-600 mb-0.5">MM</label>
            <input type="number" min={0} max={999} value={mm}
              onChange={e => setMm(e.target.value)} placeholder="0" className={inp + " w-12"} />
          </div>
          <span className="text-slate-600 mb-1.5">:</span>
          <div>
            <label className="block text-[9px] font-mono uppercase text-slate-600 mb-0.5">SS</label>
            <input type="number" min={0} max={59} value={ss}
              onChange={e => setSs(e.target.value)} placeholder="00" className={inp + " w-12"} />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[9px] font-mono uppercase text-slate-600 mb-0.5">Note</label>
          <input type="text" value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="What happened at this moment?" className={inp} />
        </div>
        <button onClick={add} disabled={!text.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono uppercase disabled:opacity-30 transition-all">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {localNotes.length > 0 && (
        <div className="space-y-1 border-t border-cyan-900/20 pt-2">
          {localNotes.map((note, i) => (
            <div key={i} className="flex items-start justify-between gap-2 p-2 rounded bg-[#02040f] border border-cyan-900/10">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-black text-cyan-400">{note.ts}</span>
                <p className="text-xs text-slate-300 mt-0.5">{note.text}</p>
              </div>
              <button onClick={() => remove(i)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
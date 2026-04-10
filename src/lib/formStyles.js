/**
 * Shared Tailwind class strings for form inputs across the app.
 * Import these instead of redeclaring in every file.
 */

export const inp = "w-full bg-[#02040f] border border-cyan-900/40 focus:border-cyan-500/40 text-white placeholder-slate-700 rounded px-3 py-2.5 text-sm outline-none transition-all font-mono";

export const lbl = "block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5";

export const sel = inp + " appearance-none";

export const textarea = inp + " resize-none";

export const err = "text-xs text-red-400 font-mono mt-1";
export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <img src="https://media.base44.com/images/public/69ca96fae50d535312ca1505/22f511752_altctrl-icon.png" alt="AltCtrl" className="w-16 h-16 object-contain mb-2" />
      <div className="w-8 h-8 border-2 border-cyan-900 border-t-cyan-400 rounded-full animate-spin" />
      <span className="text-xs font-mono uppercase tracking-widest text-slate-600">{message}</span>
    </div>
  );
}
import GlitchText from "../components/GlitchText";
import NeonCard from "../components/NeonCard";

const posts = [
  {
    date: "MAR 2026",
    tag: "PRODUCT",
    title: "Introducing AltCtrl: The AI OS for TikTok LIVE Gaming Creators",
    excerpt: "We built AltCtrl because TikTok LIVE gaming creators deserve more than generic advice and guesswork. Here's what we built and why.",
    accent: "cyan",
  },
  {
    date: "MAR 2026",
    tag: "STRATEGY",
    title: "Why Consistency Beats Viral Moments for Long-Term TikTok LIVE Growth",
    excerpt: "One viral stream won't build your audience. A structured weekly system will. Here's the data behind why consistent streamers win.",
    accent: "pink",
  },
  {
    date: "FEB 2026",
    tag: "PROMO",
    title: "The 5 Caption Frameworks That Drive Pre-Stream TikTok Engagement",
    excerpt: "Most creators post the same generic caption every time. These five frameworks actually drive clicks, hype, and live viewers.",
    accent: "yellow",
  },
];

export default function Blog() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// TRANSMISSION LOG</div>
          <GlitchText text="BLOG & UPDATES" className="text-4xl sm:text-5xl font-black uppercase text-white block" tag="h1" />
          <p className="text-slate-400 mt-4">Product updates, creator strategy, and signals from the AltCtrl team.</p>
        </div>

        <div className="space-y-4">
          {posts.map((p, i) => (
            <NeonCard key={i} accent={p.accent} className="cursor-pointer group">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className={`text-xs font-mono uppercase tracking-widest ${p.accent === "pink" ? "text-pink-400" : p.accent === "yellow" ? "text-yellow-400" : "text-cyan-400"}`}>
                  // {p.tag}
                </div>
                <span className="text-xs font-mono text-slate-600">{p.date}</span>
              </div>
              <h2 className="text-white font-black uppercase text-lg mb-2 group-hover:text-cyan-400 transition-colors">{p.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{p.excerpt}</p>
            </NeonCard>
          ))}
        </div>

        <div className="text-center mt-16 bg-[#060d1f] border border-cyan-900/40 rounded-lg p-8">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// MORE INCOMING</div>
          <p className="text-slate-400 text-sm">New posts drop regularly. Join the waitlist to get updates delivered.</p>
        </div>
      </div>
    </div>
  );
}
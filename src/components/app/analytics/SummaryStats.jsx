import { Zap, TrendingUp, Users, Clock, Flame, Radio, MessageCircle, Gift } from "lucide-react";
import { buildSummaryStats } from "../../../utils/analyticsCalc";

function StatBox({ label, value, sub, icon: IconComponent, accent = "cyan", glow = false }) {
  const colors = {
    cyan: { text: "text-cyan-400", border: "border-cyan-900/40", icon: "text-cyan-400/40" },
    pink: { text: "text-pink-400", border: "border-pink-900/30", icon: "text-pink-400/40" },
    yellow: { text: "text-yellow-400", border: "border-yellow-900/30", icon: "text-yellow-400/40" },
    green: { text: "text-green-400", border: "border-green-900/30", icon: "text-green-400/40" },
  };
  const c = colors[accent] || colors.cyan;
  return (
    <div className={`bg-[#060d1f] border ${c.border} rounded-xl p-4 relative overflow-hidden`}
      style={glow ? { boxShadow: `0 0 20px rgba(0,245,255,0.05)` } : {}}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">{label}</div>
          <div className={`text-2xl font-black ${c.text}`}>{value}</div>
          {sub && <div className="text-[10px] font-mono text-slate-600 mt-1">{sub}</div>}
        </div>
        {IconComponent && <IconComponent className={`w-5 h-5 ${c.icon} shrink-0 mt-1`} />}
      </div>
    </div>
  );
}

export default function SummaryStats({ sessions }) {
  const { total, last30Count, avgViewers, peakViewers, totalMinutes, totalFollowers, promoRate } = buildSummaryStats(sessions);
  
  // Basic engagement metrics
  const totalComments = sessions.reduce((s, r) => s + (r.comments || 0), 0);
  const totalGifters = sessions.reduce((s, r) => s + (r.gifters || 0), 0);
  const totalDiamonds = sessions.reduce((s, r) => s + (r.diamonds || 0), 0);
  const totalLikes = sessions.reduce((s, r) => s + (r.likes_received || 0), 0);
  const totalShares = sessions.reduce((s, r) => s + (r.shares || 0), 0);
  const totalFanClubJoins = sessions.reduce((s, r) => s + (r.fan_club_joins || 0), 0);
  
  // Advanced metrics
  const totalReturnViewers = sessions.reduce((s, r) => s + (r.return_viewers ?? 0), 0);
  const totalUniqueChatters = sessions.reduce((s, r) => s + (r.unique_chatters ?? 0), 0);
  
  // Conversion rates (% per avg viewer)
  const totalAvgViewers = sessions.filter(s => s.avg_viewers != null && s.avg_viewers > 0).reduce((s, r) => s + (r.avg_viewers || 0), 0);
  const followConversionRate = totalAvgViewers > 0 ? Math.round((totalFollowers / totalAvgViewers) * 100) : 0;
  const shareConversionRate = totalAvgViewers > 0 ? Math.round((totalShares / totalAvgViewers) * 100) : 0;
  const giftConversionRate = totalAvgViewers > 0 ? Math.round((totalGifters / totalAvgViewers) * 100) : 0;
  
  const totalHours = totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`;

  return (
    <div>
      <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">// LIVE STREAM STATS</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatBox label="Total Sessions" value={total} sub="all time" icon={Zap} accent="cyan" glow />
        <StatBox label="Last 30 Days" value={last30Count} sub="sessions" icon={Radio} accent="pink" />
        <StatBox label="Avg Viewers" value={avgViewers ?? "—"} sub="across sessions" icon={Users} accent="cyan" />
        <StatBox label="Peak Viewers" value={peakViewers ?? "—"} sub="single session" icon={TrendingUp} accent="yellow" />
        <StatBox label="Stream Time" value={total > 0 ? totalHours : "—"} sub="total logged" icon={Clock} accent="cyan" />
        <StatBox label="Promo Rate" value={`${promoRate}%`} sub="sessions w/ promo" icon={Flame} accent={promoRate >= 60 ? "green" : "pink"} />
      </div>
      
      {total > 0 && (totalFollowers > 0 || totalComments > 0 || totalDiamonds > 0 || totalLikes > 0 || totalShares > 0) && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {totalFollowers > 0 && (
            <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 flex-1">Followers</div>
              <div className="text-base font-black text-cyan-400">+{totalFollowers.toLocaleString()}</div>
            </div>
          )}
          {totalLikes > 0 && (
            <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 flex-1">Likes</div>
              <div className="text-base font-black text-yellow-400">+{totalLikes.toLocaleString()}</div>
            </div>
          )}
          {totalComments > 0 && (
            <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 flex-1">Comments</div>
              <div className="text-base font-black text-yellow-400">{totalComments.toLocaleString()}</div>
            </div>
          )}
          {totalShares > 0 && (
            <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 flex-1">Shares</div>
              <div className="text-base font-black text-pink-400">+{totalShares.toLocaleString()}</div>
            </div>
          )}
          {totalGifters > 0 && (
            <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 flex-1">Gifters</div>
              <div className="text-base font-black text-pink-400">{totalGifters.toLocaleString()}</div>
            </div>
          )}
          {totalDiamonds > 0 && (
            <div className="bg-[#060d1f] border border-yellow-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 flex-1">Diamonds</div>
              <div className="text-base font-black text-yellow-400">{totalDiamonds.toLocaleString()}</div>
            </div>
          )}
        </div>
      )}

      {total > 0 && (totalReturnViewers > 0 || totalUniqueChatters > 0 || totalFanClubJoins > 0 || followConversionRate > 0 || shareConversionRate > 0 || giftConversionRate > 0) && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {totalReturnViewers > 0 && (
            <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">Return Viewers</div>
              <div className="text-base font-black text-cyan-400">{totalReturnViewers.toLocaleString()}</div>
            </div>
          )}
          {totalUniqueChatters > 0 && (
            <div className="bg-[#060d1f] border border-cyan-900/30 rounded-xl px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">Chatters</div>
              <div className="text-base font-black text-cyan-400">{totalUniqueChatters.toLocaleString()}</div>
            </div>
          )}
          {totalFanClubJoins > 0 && (
            <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">Fan Club</div>
              <div className="text-base font-black text-pink-400">+{totalFanClubJoins}</div>
            </div>
          )}
          {followConversionRate > 0 && (
            <div className="bg-[#060d1f] border border-yellow-900/30 rounded-xl px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">Follow Conv.</div>
              <div className="text-base font-black text-yellow-400">{followConversionRate}%</div>
            </div>
          )}
          {shareConversionRate > 0 && (
            <div className="bg-[#060d1f] border border-yellow-900/30 rounded-xl px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">Share Conv.</div>
              <div className="text-base font-black text-yellow-400">{shareConversionRate}%</div>
            </div>
          )}
          {giftConversionRate > 0 && (
            <div className="bg-[#060d1f] border border-pink-900/30 rounded-xl px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">Gift Conv.</div>
              <div className="text-base font-black text-pink-400">{giftConversionRate}%</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
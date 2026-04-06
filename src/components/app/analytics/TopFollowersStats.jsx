import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Heart } from "lucide-react";

export default function TopFollowersStats({ sessions }) {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFollowers();
  }, [sessions]);

  async function loadFollowers() {
    setLoading(true);
    const user = await base44.auth.me();
    const topFollowers = await base44.asServiceRole.entities.ViewerHistory.filter(
      { creator_id: user.email, is_follower: true },
      "-stream_count",
      10
    );
    setFollowers(topFollowers);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-[#060d1f] border border-pink-900/20 rounded-xl p-5 flex items-center justify-center py-8">
        <div className="animate-spin w-5 h-5 border-2 border-pink-400 border-t-pink-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-[#060d1f] border border-pink-900/20 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-4 h-4 text-pink-400" />
        <div className="text-xs font-mono uppercase tracking-widest text-pink-400">// Top 10 Followers</div>
      </div>

      {followers.length === 0 ? (
        <div className="text-xs text-slate-600 text-center py-6">No followers yet. Start streaming to gain followers!</div>
      ) : (
        <div className="space-y-2">
          {followers.map((follower, idx) => (
            <div key={follower.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#02040f] border border-pink-900/15 hover:border-pink-400/30 transition-all">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-[10px] font-mono text-slate-600 w-6 text-right">#{idx + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{follower.display_name || `User ${follower.user_id.slice(0, 8)}`}</p>
                  <p className="text-[9px] font-mono text-slate-600 truncate">{follower.user_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-2">
                <div className="text-right">
                  <div className="text-xs font-bold text-pink-400">{follower.stream_count || 0}</div>
                  <div className="text-[9px] font-mono text-slate-700">streams</div>
                </div>
                {follower.is_subscriber && (
                  <div className="px-2 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30">
                    <span className="text-[9px] font-mono uppercase text-yellow-400">Sub</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export default function TrendCharts({ sessions }) {
  if (sessions.length < 2) {
    return (
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">// Trend Charts</div>
        <p className="text-xs font-mono text-slate-600">Need at least 2 sessions to see trends.</p>
      </div>
    );
  }

  // Per-stream trend
  const streamTrend = sessions.map(s => ({
    date: s.stream_date,
    followers: s.followers_gained || 0,
    gifts: s.diamonds || 0,
    comments: s.comments || 0,
  }));

  // By-game breakdown
  const byGame = {};
  sessions.forEach(s => {
    if (!byGame[s.game]) byGame[s.game] = { game: s.game, followers: 0, gifters: 0, count: 0 };
    byGame[s.game].followers += s.followers_gained || 0;
    byGame[s.game].gifters += s.gifters || 0;
    byGame[s.game].count += 1;
  });
  const gameData = Object.values(byGame)
    .map(g => ({ ...g, avgFollowers: (g.followers / g.count).toFixed(1), avgGifters: (g.gifters / g.count).toFixed(1) }))
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 6);

  // By-type breakdown
  const byType = {};
  sessions.forEach(s => {
    const t = s.stream_type || "other";
    if (!byType[t]) byType[t] = { type: t, followers: 0, comments: 0, count: 0 };
    byType[t].followers += s.followers_gained || 0;
    byType[t].comments += s.comments || 0;
    byType[t].count += 1;
  });
  const typeData = Object.values(byType).map(t => ({ ...t, avgFollowers: (t.followers / t.count).toFixed(1) }));

  return (
    <div className="space-y-4">
      {/* Stream trend */}
      <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">// Per-Stream Trend</div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={streamTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#02040f", border: "1px solid #164e63", borderRadius: "6px" }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Legend />
            <Line type="monotone" dataKey="followers" stroke="#00f5ff" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="gifts" stroke="#ff0080" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="comments" stroke="#fbbf24" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* By game */}
      {gameData.length > 0 && (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">// By Game (Top {gameData.length})</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={gameData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
              <XAxis dataKey="game" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#02040f", border: "1px solid #164e63", borderRadius: "6px" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend />
              <Bar dataKey="avgFollowers" fill="#00f5ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgGifters" fill="#ff0080" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* By type */}
      {typeData.length > 0 && (
        <div className="bg-[#060d1f] border border-cyan-900/30 rounded-lg p-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-3">// By Stream Type</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
              <XAxis dataKey="type" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#02040f", border: "1px solid #164e63", borderRadius: "6px" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend />
              <Bar dataKey="avgFollowers" fill="#00f5ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
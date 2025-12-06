"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { API_URL, getMatchHistory, getLeaderboard } from "@/lib/api";

interface MatchStats {
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
}

interface Match {
  id: number;
  game_mode: string;
  left_player_id: number;
  right_player_id: number | null;
  winner: string;
  left_score: number;
  right_score: number;
  ai_difficulty: string | null;
  created_at: string;
  left_player_username: string;
  left_player_display_name: string | null;
  left_player_avatar: string | null;
  right_player_username: string | null;
  right_player_display_name: string | null;
  right_player_avatar: string | null;
}

// Donut Chart Component
const DonutChart = ({ wins, losses, totalGames }: { wins: number; losses: number; totalGames: number }) => {
  if (totalGames === 0) {
    return (
      <div className="relative w-64 h-64 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="20"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-pixelify font-bold text-gray-400">0</p>
          <p className="text-sm font-pixelify text-gray-500">No games</p>
        </div>
      </div>
    );
  }

  const winPercentage = (wins / totalGames) * 100;
  const lossPercentage = (losses / totalGames) * 100;
  
  const circumference = 2 * Math.PI * 40;
  const winOffset = circumference - (winPercentage / 100) * circumference;
  const lossOffset = circumference - (lossPercentage / 100) * circumference;

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="20"
        />
        
        {/* Wins arc */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#winGradient)"
          strokeWidth="20"
          strokeDasharray={circumference}
          strokeDashoffset={winOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Losses arc */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#lossGradient)"
          strokeWidth="20"
          strokeDasharray={circumference}
          strokeDashoffset={lossOffset}
          strokeLinecap="round"
          transform={`rotate(${(winPercentage / 100) * 360} 50 50)`}
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="winGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="lossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-5xl font-pixelify font-bold text-[#2d5a8a]">{Math.round(winPercentage)}%</p>
        <p className="text-sm font-pixelify text-gray-600 mt-1">Win Rate</p>
      </div>
    </div>
  );
};

// Game Mode Stats Component (Vertical Bar Chart)
const GameModeStats = ({ matches, userId }: { matches: Match[]; userId: number }) => {
  // Start from October and go to September (12 months)
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  
  // Calculate real monthly data from matches
  const calculateMonthlyData = (isPong: boolean) => {
    // Reorder to start from October (month index 9)
    const monthOrder = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]; // Oct=9 to Sep=8
    const monthlyStats = Array(12).fill(0).map(() => ({ wins: 0, total: 0 }));
    
    matches.forEach(match => {
      const matchDate = new Date(match.created_at);
      const monthIndex = matchDate.getMonth();
      
      // Filter by game mode
      const isMatchPong = isPong 
        ? !match.game_mode.toLowerCase().includes('tic')
        : match.game_mode.toLowerCase().includes('tic');
      
      if (!isMatchPong) return;
      
      // Check if user won
      const isLeft = match.left_player_id === userId;
      const won = (isLeft && match.winner === 'left') || (!isLeft && match.winner === 'right');
      
      // Find position in our reordered array
      const displayIndex = monthOrder.indexOf(monthIndex);
      if (displayIndex !== -1) {
        monthlyStats[displayIndex].total++;
        if (won) monthlyStats[displayIndex].wins++;
      }
    });
    
    // Return total games per month for bar chart
    return monthlyStats.map(stat => stat.total);
  };
  
  const pongData = calculateMonthlyData(true);
  const ticTacToeData = calculateMonthlyData(false);

  // Calculate points for SVG
  const svgWidth = 500;
  const svgHeight = 300;
  const padding = 50;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;
  const maxValue = Math.max(...pongData, ...ticTacToeData, 10); // At least 10 for scale
  
  const barWidth = chartWidth / (months.length * 2.5); // Space for both bars per month

  return (
    <div className="relative mt-6 w-full">
      <svg className="w-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet" style={{ minHeight: '400px' }}>
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = svgHeight - padding - (ratio * chartHeight);
          return (
            <line
              key={ratio}
              x1={padding}
              y1={y}
              x2={svgWidth - padding}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        {/* X-Axis */}
        <line 
          x1={padding} 
          y1={svgHeight - padding} 
          x2={svgWidth - padding} 
          y2={svgHeight - padding} 
          stroke="#6b7280" 
          strokeWidth="2"
        />

        {/* Y-Axis */}
        <line 
          x1={padding} 
          y1={padding / 2} 
          x2={padding} 
          y2={svgHeight - padding} 
          stroke="#6b7280" 
          strokeWidth="2"
        />

        {/* Bars */}
        {months.map((month, index) => {
          const xPosition = padding + (index * (chartWidth / months.length)) + (chartWidth / months.length / 4);
          
          // Pong bar (blue)
          const pongHeight = (pongData[index] / maxValue) * chartHeight;
          const pongY = svgHeight - padding - pongHeight;
          
          // Tic-Tac-Toe bar (orange)
          const tttHeight = (ticTacToeData[index] / maxValue) * chartHeight;
          const tttY = svgHeight - padding - tttHeight;
          
          return (
            <g key={month}>
              {/* Pong Bar */}
              <rect
                x={xPosition}
                y={pongY}
                width={barWidth}
                height={pongHeight}
                fill="url(#pongGradient)"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
              
              {/* Tic-Tac-Toe Bar */}
              <rect
                x={xPosition + barWidth + 2}
                y={tttY}
                width={barWidth}
                height={tttHeight}
                fill="url(#tttGradient)"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            </g>
          );
        })}

        {/* Gradients */}
        <defs>
          <linearGradient id="pongGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="tttGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* X-Axis Labels (Months) */}
        {months.map((month, index) => {
          const x = padding + (index * (chartWidth / months.length)) + (chartWidth / months.length / 2);
          return (
            <text
              key={month}
              x={x}
              y={svgHeight - padding + 20}
              textAnchor="middle"
              className="text-[10px] font-pixelify fill-gray-600"
            >
              {month}
            </text>
          );
        })}

        {/* Y-Axis Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = svgHeight - padding - (ratio * chartHeight);
          const value = Math.round(maxValue * ratio);
          return (
            <text
              key={ratio}
              x={padding - 10}
              y={y + 3}
              textAnchor="end"
              className="text-[10px] font-pixelify fill-gray-600"
            >
              {value}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-gradient-to-b from-blue-400 to-blue-600 rounded"></div>
          <span className="font-pixelify text-sm text-[#2d5a8a] font-bold">Pong</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-gradient-to-b from-orange-400 to-orange-600 rounded"></div>
          <span className="font-pixelify text-sm text-[#2d5a8a] font-bold">Tic-Tac-Toe</span>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const verifyAuthAndLoadData = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
        if (!response.ok) throw new Error("Not authenticated");
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Load match history
        try {
          const matchData = await getMatchHistory();
          setMatchStats(matchData.stats);
          setMatches(matchData.matches);
        } catch (err) {
          console.log("No match history available yet");
          // Set default values if no matches exist
          setMatchStats({ wins: 0, losses: 0, totalGames: 0, winRate: 0 });
          setMatches([]);
        }

        // Load leaderboard
        try {
          const leaderboardData = await getLeaderboard();
          console.log("Leaderboard data received:", leaderboardData);
          setLeaderboard(leaderboardData.leaderboard || []);
          console.log("Leaderboard state set to:", leaderboardData.leaderboard || []);
        } catch (err) {
          console.log("Failed to load leaderboard:", err);
          setLeaderboard([]);
        }

        setLoading(false);
      } catch (e) {
        localStorage.removeItem("user");
        router.push("/");
      }
    };
    verifyAuthAndLoadData();
  }, [router]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#bcc3d4]">
        <p className="text-xl font-pixelify text-[#2d5a8a]">Loading...</p>
      </div>
    );
  }

  const getMatchResult = (match: Match) => {
    const isLeftPlayer = match.left_player_id === user.id;
    const isWinner = (isLeftPlayer && match.winner === 'left') || (!isLeftPlayer && match.winner === 'right');
    return isWinner;
  };

  const getOpponentInfo = (match: Match) => {
    const isLeftPlayer = match.left_player_id === user.id;
    
    if (match.game_mode === 'local' || match.game_mode === 'ai') {
      return {
        name: match.game_mode === 'ai' ? `AI (${match.ai_difficulty})` : 'Local Player',
        avatar: null
      };
    }

    if (isLeftPlayer) {
      return {
        name: match.right_player_display_name || match.right_player_username || 'Unknown',
        avatar: match.right_player_avatar
      };
    } else {
      return {
        name: match.left_player_display_name || match.left_player_username || 'Unknown',
        avatar: match.left_player_avatar
      };
    }
  };

  const getScore = (match: Match) => {
    const isLeftPlayer = match.left_player_id === user.id;
    return isLeftPlayer 
      ? `${match.left_score} - ${match.right_score}`
      : `${match.right_score} - ${match.left_score}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c8d5e8] via-[#bcc3d4] to-[#a8b0c5] relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000 top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/10">
        <Header user={user} onUserUpdate={setUser} activeRoute="dashboard" />
      </div>

      <main className="p-6 relative z-10">
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Donut Chart - Win/Loss Ratio */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-[1.01] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <svg className="w-full h-full" width="100%" height="100%">
                <pattern id="donut-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0 20L20 0" stroke="currentColor" strokeWidth="0.5" className="text-blue-500" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#donut-pattern)" />
              </svg>
            </div>

            {/* Animated Stars */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="absolute top-10 left-10 text-3xl animate-sparkle">⭐</div>
              <div className="absolute top-16 right-16 text-4xl animate-sparkle-delayed">🏆</div>
              <div className="absolute bottom-16 left-16 text-3xl animate-sparkle-delayed-2">👑</div>
              <div className="absolute bottom-10 right-12 text-3xl animate-sparkle">✨</div>
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg animate-pulse-slow">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-pixelify text-3xl font-bold text-[#2d5a8a]">
                    Top Players
                  </h2>
                  <p className="font-pixelify text-xs text-[#2d5a8a]/60">Global leaderboard</p>
                </div>
              </div>
            </div>

            {/* Podium - Top 3 */}
            {(() => {
              console.log("Rendering leaderboard. Length:", leaderboard.length, "Data:", leaderboard);
              return null;
            })()}
            {leaderboard.length > 0 ? (
              <>
                <div className="flex items-end justify-center gap-4 mb-8 relative z-10">
                  {/* 2nd Place */}
                  {leaderboard[1] && (
                    <div className="flex-1 text-center transform hover:scale-105 transition-all duration-300">
                      <div className="relative mb-3">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-xl border-4 border-white">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600">
                            <img 
                              src={leaderboard[1].avatar_url ? `${API_URL}${leaderboard[1].avatar_url}` : `${API_URL}/uploads/default-avatar.png`} 
                              alt={leaderboard[1].display_name || leaderboard[1].username} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center border-2 border-white shadow-lg">
                          <span className="font-pixelify text-white font-bold text-sm">2</span>
                        </div>
                      </div>
                      <div className="backdrop-blur-md bg-gradient-to-b from-gray-200/40 to-gray-300/40 rounded-2xl p-4 border-2 border-gray-400 h-32 flex flex-col justify-center">
                        <span className="text-3xl mb-2">🥈</span>
                        <p className="font-pixelify font-bold text-[#2d5a8a] text-sm truncate">{leaderboard[1].display_name || leaderboard[1].username}</p>
                        <p className="font-pixelify text-2xl font-bold text-gray-600">{leaderboard[1].winRate}%</p>
                        <p className="font-pixelify text-xs text-gray-500">{leaderboard[1].wins} wins</p>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {leaderboard[0] && (
                    <div className="flex-1 text-center transform hover:scale-105 transition-all duration-300">
                      <div className="relative mb-3">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center shadow-2xl border-4 border-white animate-pulse-slow">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600">
                            <img 
                              src={leaderboard[0].avatar_url ? `${API_URL}${leaderboard[0].avatar_url}` : `${API_URL}/uploads/default-avatar.png`} 
                              alt={leaderboard[0].display_name || leaderboard[0].username} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </div>
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <span className="text-3xl animate-bounce-slow">👑</span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-2 border-white shadow-xl">
                          <span className="font-pixelify text-white font-bold text-base">1</span>
                        </div>
                      </div>
                      <div className="backdrop-blur-md bg-gradient-to-b from-yellow-100/40 to-yellow-200/40 rounded-2xl p-4 border-2 border-yellow-500 h-40 flex flex-col justify-center">
                        <span className="text-4xl mb-2">🥇</span>
                        <p className="font-pixelify font-bold text-[#2d5a8a] text-base truncate">{leaderboard[0].display_name || leaderboard[0].username}</p>
                        <p className="font-pixelify text-3xl font-bold text-yellow-600">{leaderboard[0].winRate}%</p>
                        <p className="font-pixelify text-xs text-gray-500">{leaderboard[0].wins} wins</p>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {leaderboard[2] && (
                    <div className="flex-1 text-center transform hover:scale-105 transition-all duration-300">
                      <div className="relative mb-3">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-300 to-orange-600 flex items-center justify-center shadow-xl border-4 border-white">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600">
                            <img 
                              src={leaderboard[2].avatar_url ? `${API_URL}${leaderboard[2].avatar_url}` : `${API_URL}/uploads/default-avatar.png`} 
                              alt={leaderboard[2].display_name || leaderboard[2].username} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-2 border-white shadow-lg">
                          <span className="font-pixelify text-white font-bold text-sm">3</span>
                        </div>
                      </div>
                      <div className="backdrop-blur-md bg-gradient-to-b from-orange-100/40 to-orange-200/40 rounded-2xl p-4 border-2 border-orange-400 h-32 flex flex-col justify-center">
                        <span className="text-3xl mb-2">🥉</span>
                        <p className="font-pixelify font-bold text-[#2d5a8a] text-sm truncate">{leaderboard[2].display_name || leaderboard[2].username}</p>
                        <p className="font-pixelify text-2xl font-bold text-orange-600">{leaderboard[2].winRate}%</p>
                        <p className="font-pixelify text-xs text-gray-500">{leaderboard[2].wins} wins</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4th and 5th Place */}
                <div className="space-y-3 relative z-10">
                  {leaderboard.slice(3, 5).map((player, index) => {
                    const position = index + 4;
                    const colors = [
                      { ring: 'from-purple-400 to-purple-600', bg: 'from-green-400 to-green-600', text: 'text-purple-600' },
                      { ring: 'from-pink-400 to-pink-600', bg: 'from-red-400 to-red-600', text: 'text-pink-600' }
                    ];
                    const color = colors[index];
                    
                    return (
                      <div key={player.id} className="backdrop-blur-md bg-white/20 rounded-2xl p-4 border border-white/30 hover:bg-white/30 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${color.ring} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <div className={`w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br ${color.bg}`}>
                                  <img 
                                    src={player.avatar_url ? `${API_URL}${player.avatar_url}` : `${API_URL}/uploads/default-avatar.png`} 
                                    alt={player.display_name || player.username} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br ${color.ring} flex items-center justify-center border-2 border-white shadow-lg`}>
                                <span className="font-pixelify text-white font-bold text-xs">{position}</span>
                              </div>
                            </div>
                            <div>
                              <p className="font-pixelify font-bold text-[#2d5a8a] text-base">{player.display_name || player.username}</p>
                              <p className="font-pixelify text-xs text-gray-500">{player.wins} wins • {player.losses} losses</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-pixelify text-2xl font-bold ${color.text}`}>{player.winRate}%</p>
                            <p className="font-pixelify text-xs text-gray-500 uppercase tracking-wider">Win Rate</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 relative z-10">
                <p className="font-pixelify text-xl text-[#2d5a8a]/60">No players on the leaderboard yet</p>
                <p className="font-pixelify text-sm text-[#2d5a8a]/40 mt-2">Start playing to see rankings!</p>
              </div>
            )}
          </div>

          {/* Game Mode Performance */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-[1.01] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <svg className="w-full h-full" width="100%" height="100%">
                <pattern id="grid-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-500" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#grid-pattern)" />
              </svg>
            </div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="font-pixelify text-3xl font-bold text-[#2d5a8a]">
                Performance
              </h2>
            </div>
            <GameModeStats matches={matches} userId={user?.id} />
          </div>
        </div>

        {/* Recent Matches Table */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg className="w-full h-full" width="100%" height="100%">
              <pattern id="hex-pattern" x="0" y="0" width="24" height="40" patternUnits="userSpaceOnUse">
                <path d="M12 0L24 6V18L12 24L0 18V6L12 0Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-pink-500" />
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#hex-pattern)" />
            </svg>
          </div>

          {/* Animated Trophy Elements */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="text-6xl animate-trophy-float-across">🏆</div>
            <div className="text-5xl animate-trophy-float-diagonal">⭐</div>
            <div className="text-5xl animate-trophy-float-reverse">🎮</div>
            <div className="text-4xl animate-trophy-float-circle">🎯</div>
          </div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center shadow-lg animate-pulse-slow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-pixelify text-3xl font-bold text-[#2d5a8a]">
                  Match History
                </h2>
                <p className="font-pixelify text-xs text-[#2d5a8a]/60">Your recent game results</p>
              </div>
            </div>
            {matches.length > 0 && (
              <div className="font-pixelify text-sm text-[#2d5a8a]/70 bg-white/20 px-4 py-2 rounded-full border border-white/30">
                {matches.length} {matches.length === 1 ? 'match' : 'matches'}
              </div>
            )}
          </div>
          
          {matches.length === 0 ? (
            <div className="text-center py-12 relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center animate-bounce-slow">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-pixelify text-2xl text-[#2d5a8a] mb-2 font-bold">No matches yet!</p>
              <p className="font-pixelify text-sm text-[#2d5a8a]/60 mb-6">Start playing to build your history</p>
              <button
                onClick={() => router.push('/games')}
                className="font-pixelify px-8 py-4 bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-base"
              >
                Start Playing
              </button>
            </div>
          ) : (
            <div className="relative z-10 max-h-[300px] overflow-y-auto custom-scrollbar">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white/10 backdrop-blur-md z-10">
                    <tr className="border-b-2 border-white/20 text-left">
                      <th className="pb-4 pt-3 font-pixelify text-[#2d5a8a] font-bold pl-4 text-base">Result</th>
                      <th className="pb-4 pt-3 font-pixelify text-[#2d5a8a] font-bold text-base">Opponent</th>
                      <th className="pb-4 pt-3 font-pixelify text-[#2d5a8a] font-bold text-base">Mode</th>
                      <th className="pb-4 pt-3 font-pixelify text-[#2d5a8a] font-bold text-base">Score</th>
                      <th className="pb-4 pt-3 font-pixelify text-[#2d5a8a] font-bold text-right pr-4 text-base">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {matches.map((match, index) => {
                    const isWinner = getMatchResult(match);
                    const opponent = getOpponentInfo(match);
                    const score = getScore(match);
                    
                    return (
                      <tr key={match.id} className="group hover:bg-white/10 transition-all duration-300 relative hover:scale-[1.01] hover:shadow-lg">
                        {/* Animated side indicator */}
                        <td className="py-4 pl-4 relative">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-300 ${
                            isWinner ? 'bg-gradient-to-b from-green-400 to-green-600 group-hover:w-2' : 'bg-gradient-to-b from-red-400 to-red-600 group-hover:w-2'
                          }`}></div>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-md transition-all duration-300 group-hover:scale-110 ${
                            isWinner 
                              ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-2 border-green-300' 
                              : 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-2 border-red-300'
                          }`}>
                            {isWinner ? '✓ WIN' : '✗ LOSS'}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white/30 group-hover:ring-4 transition-all duration-300">
                              {opponent.avatar ? (
                                <img src={opponent.avatar.startsWith('http') ? opponent.avatar : `${API_URL}${opponent.avatar}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                              )}
                            </div>
                            <span className="font-pixelify font-bold text-[#2d5a8a] text-base">{opponent.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="font-pixelify text-base text-gray-600 capitalize">
                            {match.game_mode.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="font-pixelify font-mono text-[#2d5a8a] font-bold text-lg">
                            {score}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-4">
                          <span className="font-pixelify text-base text-gray-500">
                            {new Date(match.created_at).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>

        {/* Quick Play Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 flex-1 min-h-[20rem]">
          {/* Pong Card */}
          <div className="group relative overflow-hidden backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-[1.01] h-full">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <svg className="w-full h-full" width="100%" height="100%">
                <pattern id="pong-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="3" cy="3" r="1.5" fill="currentColor" className="text-blue-500" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#pong-pattern)" />
              </svg>
            </div>

            <div className="relative z-10 flex h-full">
              {/* Left Section - Simulation (70%) */}
              <div className="w-[70%] relative flex items-center justify-center">
                {/* Pong Net */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 border-l-2 border-dashed border-[#2d5a8a]/50 h-full"></div>
                {/* Ball - Animated bouncing */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.7)] animate-pong-ball"></div>
                {/* Paddles - Animated moving */}
                <div className="absolute left-8 w-2 h-16 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-paddle-left"></div>
                <div className="absolute right-8 w-2 h-16 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-paddle-right"></div>
              </div>

              {/* Right Section - Text and Button (30%) */}
              <div className="w-[30%] flex flex-col justify-center items-center py-6 px-4 gap-6">
                <div className="text-center">
                  <h3 className="font-pixelify text-3xl font-bold text-[#2d5a8a] mb-3 drop-shadow-lg">Pong</h3>
                  <p className="font-pixelify text-[#2d5a8a]/70 text-xs leading-relaxed">
                    The classic retro arcade game.
                  </p>
                </div>
                <button 
                  onClick={() => router.push('/games')}
                  className="font-pixelify px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/50 transition-all duration-300 text-sm"
                >
                  Play Now
                </button>
              </div>
            </div>
          </div>

          {/* Tic-Tac-Toe Card */}
          <div className="group relative overflow-hidden backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-[1.01] h-full">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <svg className="w-full h-full" width="100%" height="100%">
                <pattern id="ttt-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-500" />
                  <path d="M 0 0 L 40 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-500" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#ttt-pattern)" />
              </svg>
            </div>

            <div className="relative z-10 flex h-full">
              {/* Left Section - Text and Button (30%) */}
              <div className="w-[30%] flex flex-col justify-center items-center py-6 px-4 gap-6 ml-8">
                <div className="text-center">
                  <h3 className="font-pixelify text-3xl font-bold text-[#2d5a8a] mb-3 drop-shadow-lg">Tic-Tac-Toe</h3>
                  <p className="font-pixelify text-[#2d5a8a]/70 text-xs leading-relaxed">
                    A strategic game of Xs and Os.
                  </p>
                </div>
                <button 
                  onClick={() => router.push('/games')}
                  className="font-pixelify px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-sm"
                >
                  Play Now
                </button>
              </div>

              {/* Right Section - Simulation (70%) */}
              <div className="w-[70%] relative flex items-center justify-center">
                <div className="w-48 h-48 relative">
                  {/* Grid */}
                  <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-purple-600"></div>
                  <div className="absolute right-1/3 top-0 bottom-0 w-1 bg-purple-600"></div>
                  <div className="absolute top-1/3 left-0 right-0 h-1 bg-purple-600"></div>
                  <div className="absolute bottom-1/3 left-0 right-0 h-1 bg-purple-600"></div>
                  
                  {/* Animated X and O symbols on grid */}
                  <div className="absolute left-[8%] top-[8%] text-4xl font-pixelify text-purple-700 font-bold animate-ttt-1">X</div>
                  <div className="absolute left-[42%] top-[8%] text-4xl font-pixelify text-pink-600 font-bold animate-ttt-2">O</div>
                  <div className="absolute left-[75%] top-[8%] text-4xl font-pixelify text-purple-700 font-bold animate-ttt-3">X</div>
                  <div className="absolute left-[8%] top-[42%] text-4xl font-pixelify text-pink-600 font-bold animate-ttt-4">O</div>
                  <div className="absolute left-[42%] top-[42%] text-4xl font-pixelify text-purple-700 font-bold animate-ttt-5">X</div>
                  <div className="absolute left-[75%] top-[42%] text-4xl font-pixelify text-pink-600 font-bold animate-ttt-6">O</div>
                  <div className="absolute left-[8%] top-[75%] text-4xl font-pixelify text-purple-700 font-bold animate-ttt-7">X</div>
                  <div className="absolute left-[42%] top-[75%] text-4xl font-pixelify text-pink-600 font-bold animate-ttt-8">O</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Pong Animations */
        @keyframes pong-ball {
          0% { transform: translate(-50%, -50%) translate(-120px, -60px); }
          25% { transform: translate(-50%, -50%) translate(120px, -60px); }
          50% { transform: translate(-50%, -50%) translate(120px, 60px); }
          75% { transform: translate(-50%, -50%) translate(-120px, 60px); }
          100% { transform: translate(-50%, -50%) translate(-120px, -60px); }
        }
        @keyframes paddle-left {
          0%, 100% { top: 20%; }
          50% { top: 60%; }
        }
        @keyframes paddle-right {
          0%, 100% { top: 60%; }
          50% { top: 20%; }
        }

        /* Tic-Tac-Toe Animations - Sequential appearance */
        @keyframes ttt-appear {
          0% { opacity: 0; transform: scale(0) rotate(-180deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes ttt-1 { 0%, 10%, 100% { opacity: 0; transform: scale(0) rotate(-180deg); } 15%, 95% { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes ttt-2 { 0%, 20%, 100% { opacity: 0; transform: scale(0) rotate(180deg); } 25%, 95% { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes ttt-3 { 0%, 30%, 100% { opacity: 0; transform: scale(0) rotate(-180deg); } 35%, 95% { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes ttt-4 { 0%, 40%, 100% { opacity: 0; transform: scale(0) rotate(180deg); } 45%, 95% { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes ttt-5 { 0%, 50%, 100% { opacity: 0; transform: scale(0) rotate(-180deg); } 55%, 95% { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes ttt-6 { 0%, 60%, 100% { opacity: 0; transform: scale(0) rotate(180deg); } 65%, 95% { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes ttt-7 { 0%, 70%, 100% { opacity: 0; transform: scale(0) rotate(-180deg); } 75%, 95% { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes ttt-8 { 0%, 80%, 100% { opacity: 0; transform: scale(0) rotate(180deg); } 85%, 95% { opacity: 1; transform: scale(1) rotate(0deg); } }

        /* Match History Animations */
        @keyframes trophy-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes trophy-float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-10deg); }
        }
        @keyframes trophy-float-delayed-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes trophy-float-across {
          0% { transform: translate(10%, 10%) rotate(0deg); }
          25% { transform: translate(80%, 20%) rotate(90deg); }
          50% { transform: translate(90%, 80%) rotate(180deg); }
          75% { transform: translate(20%, 90%) rotate(270deg); }
          100% { transform: translate(10%, 10%) rotate(360deg); }
        }
        @keyframes trophy-float-diagonal {
          0% { transform: translate(90%, 10%) rotate(0deg) scale(1); }
          25% { transform: translate(70%, 40%) rotate(-90deg) scale(1.2); }
          50% { transform: translate(10%, 60%) rotate(-180deg) scale(0.8); }
          75% { transform: translate(30%, 20%) rotate(-270deg) scale(1.1); }
          100% { transform: translate(90%, 10%) rotate(-360deg) scale(1); }
        }
        @keyframes trophy-float-reverse {
          0% { transform: translate(10%, 90%) rotate(0deg); }
          25% { transform: translate(40%, 20%) rotate(-90deg); }
          50% { transform: translate(80%, 30%) rotate(-180deg); }
          75% { transform: translate(60%, 70%) rotate(-270deg); }
          100% { transform: translate(10%, 90%) rotate(-360deg); }
        }
        @keyframes trophy-float-circle {
          0% { transform: translate(50%, 50%) rotate(0deg) translateX(30%) rotate(0deg); }
          25% { transform: translate(50%, 50%) rotate(90deg) translateX(30%) rotate(-90deg); }
          50% { transform: translate(50%, 50%) rotate(180deg) translateX(30%) rotate(-180deg); }
          75% { transform: translate(50%, 50%) rotate(270deg) translateX(30%) rotate(-270deg); }
          100% { transform: translate(50%, 50%) rotate(360deg) translateX(30%) rotate(-360deg); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-pong-ball {
          animation: pong-ball 4s ease-in-out infinite;
        }
        .animate-paddle-left {
          animation: paddle-left 3s ease-in-out infinite;
        }
        .animate-paddle-right {
          animation: paddle-right 3s ease-in-out infinite 0.5s;
        }
        .animate-ttt-1 { animation: ttt-1 8s ease-in-out infinite; }
        .animate-ttt-2 { animation: ttt-2 8s ease-in-out infinite; }
        .animate-ttt-3 { animation: ttt-3 8s ease-in-out infinite; }
        .animate-ttt-4 { animation: ttt-4 8s ease-in-out infinite; }
        .animate-ttt-5 { animation: ttt-5 8s ease-in-out infinite; }
        .animate-ttt-6 { animation: ttt-6 8s ease-in-out infinite; }
        .animate-ttt-7 { animation: ttt-7 8s ease-in-out infinite; }
        .animate-ttt-8 { animation: ttt-8 8s ease-in-out infinite; }
        .animate-trophy-float { animation: trophy-float 4s ease-in-out infinite; }
        .animate-trophy-float-delayed { animation: trophy-float-delayed 5s ease-in-out infinite; }
        .animate-trophy-float-delayed-2 { animation: trophy-float-delayed-2 4.5s ease-in-out infinite; }
        .animate-trophy-float-across { animation: trophy-float-across 20s ease-in-out infinite; }
        .animate-trophy-float-diagonal { animation: trophy-float-diagonal 25s ease-in-out infinite; }
        .animate-trophy-float-reverse { animation: trophy-float-reverse 22s ease-in-out infinite; }
        .animate-trophy-float-circle { animation: trophy-float-circle 18s linear infinite; }
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #5ea5e8, #4a7bb8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4a7bb8, #3d5a7f);
        }
      `}</style>
    </div>
  );
}

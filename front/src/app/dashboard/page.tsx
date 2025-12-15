"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getApiUrl, getMatchHistory, getLeaderboard } from "@/lib/api";
import { getFriends } from "@/lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface MatchStats
{
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
}

interface Match
{
  id: number;
  game_type?: string;
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

// Donut Chart Component using Recharts
const DonutChart = ({ wins, losses, totalGames }: { wins: number; losses: number; totalGames: number }) => {
  if (totalGames === 0)
  {
    return (
      <div className="relative w-72 h-72 mx-auto flex flex-col items-center justify-center">
        <p className="text-4xl font-pixelify font-bold text-gray-400">0</p>
        <p className="text-sm font-pixelify text-gray-500">No games</p>
      </div>
    );
  }

  const winPercentage = (wins / totalGames) * 100;
  
  const data = [
    { name: 'Wins', value: wins, color: '#22c55e' },
    { name: 'Losses', value: losses, color: '#ef4444' }
  ];

  return (
    <div className="relative w-72 h-72 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-5xl font-pixelify font-bold text-[#2d5a8a]">{Math.round(winPercentage)}%</p>
        <p className="text-sm font-pixelify text-gray-600 mt-1">Win Rate</p>
      </div>
    </div>
  );
};

const GameModeStats = ({ matches, userId }: { matches: Match[]; userId: number }) => {
  
  // Calculate win rate progression for each match
  const calculateWinRateProgression = (isPong: boolean) => {
    const filteredMatches = matches
      .filter(match => {
        // Use game_type for reliable detection (pong vs tictactoe)
        const matchIsPong = match.game_type === 'pong';
        const matchIsTicTacToe = match.game_type === 'tictactoe';
        
        if (isPong) {
          return matchIsPong && match.winner !== 'draw';
        } else {
          return matchIsTicTacToe && match.winner !== 'draw';
        }
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    const progression: { match: number; winRate: number }[] = [{ match: 0, winRate: 0 }];
    let wins = 0;
    let total = 0;
    
    filteredMatches.forEach((match, index) => {
      total++;
      const isLeft = match.left_player_id === userId;
      const won = (isLeft && match.winner === 'left') || (!isLeft && match.winner === 'right');
      if (won) wins++;
      
      const winRate = (wins / total) * 100;
      progression.push({ match: index + 1, winRate: Math.round(winRate) });
    });
    
    return progression;
  };
  
  const pongData = calculateWinRateProgression(true);
  const ticTacToeData = calculateWinRateProgression(false);

  // Merge data for chart
  const maxLength = Math.max(pongData.length, ticTacToeData.length);
  const chartData = Array.from({ length: maxLength }, (_, i) => ({
    match: i,
    Pong: pongData[i]?.winRate ?? null,
    'Tic-Tac-Toe': ticTacToeData[i]?.winRate ?? null
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-pixelify text-xs text-gray-600 mb-2">Match {payload[0].payload.match}</p>
          {payload.map((entry: any, index: number) => (
            entry.value !== null && (
              <p key={index} className="font-pixelify text-sm font-bold" style={{ color: entry.color }}>
                {entry.name}: {entry.value}%
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative mt-6 w-full">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="match" 
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'Pixelify Sans' }}
              label={{ value: 'Matches', position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontFamily: 'Pixelify Sans', fontSize: 12 } }}
            />
            <YAxis 
              stroke="#6b7280"
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'Pixelify Sans' }}
              label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontFamily: 'Pixelify Sans', fontSize: 12 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            {pongData.length > 1 && (
              <Line 
                type="monotone" 
                dataKey="Pong" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
                connectNulls
              />
            )}
            {ticTacToeData.length > 1 && (
              <Line 
                type="monotone" 
                dataKey="Tic-Tac-Toe" 
                stroke="#f97316" 
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ fill: '#f97316', stroke: '#fff', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="flex items-center justify-center gap-6 mt-6">
        {pongData.length > 1 && (
          <div className="flex items-center gap-2">
            <svg width="32" height="16" className="overflow-visible">
              <line x1="0" y1="8" x2="32" y2="8" stroke="#3b82f6" strokeWidth="3" />
              <circle cx="16" cy="8" r="4" fill="#3b82f6" />
            </svg>
            <span className="font-pixelify text-sm text-[#2d5a8a] font-bold">Pong</span>
          </div>
        )}
        {ticTacToeData.length > 1 && (
          <div className="flex items-center gap-2">
            <svg width="32" height="16" className="overflow-visible">
              <line x1="0" y1="8" x2="32" y2="8" stroke="#f97316" strokeWidth="3" strokeDasharray="8 4" />
              <circle cx="16" cy="8" r="4" fill="#f97316" stroke="#fff" strokeWidth="2" />
            </svg>
            <span className="font-pixelify text-sm text-[#2d5a8a] font-bold">Tic-Tac-Toe</span>
          </div>
        )}
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
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const verifyAuthAndLoadData = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/auth/me`, { credentials: "include" });
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

        // Load friends
        try {
          const friendsData = await getFriends(data.user.id);
          console.log("Friends data received:", friendsData);
          setFriends(Array.isArray(friendsData) ? friendsData : []);
        } catch (err) {
          console.log("Failed to load friends:", err);
          setFriends([]);
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
    if (match.winner === 'draw') return null; // Draw case
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
    if (match.game_mode === 'tictactoe' && match.winner === 'draw') {
      return 'Draw';
    }
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

      <main className="p-6 relative z-0">
        <div className="max-w-[2000px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-6 items-stretch">
          
          {/* Friends Panel - LEFT SIDE */}
          <div className="hidden xl:flex xl:w-[280px] flex-shrink-0">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 flex flex-col w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="font-pixelify text-xl font-bold text-[#2d5a8a]">Friends</h2>
              </div>
                
                <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {friends && friends.length > 0 ? (
                    friends.map((friend: any) => (
                      <div 
                        key={friend.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600">
                          <img 
                            src={friend.avatar_url ? (friend.avatar_url.startsWith('http') ? friend.avatar_url : `${getApiUrl()}${friend.avatar_url}`) : `${getApiUrl()}/uploads/default-avatar.png`}
                            alt={friend.display_name || friend.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-pixelify font-bold text-[#2d5a8a] text-sm truncate group-hover:text-blue-600 transition-colors">
                            {friend.display_name || friend.username}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center opacity-50">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="font-pixelify text-sm text-[#2d5a8a]/60 mb-1">No friends yet</p>
                      <p className="font-pixelify text-xs text-[#2d5a8a]/40">Start adding friends!</p>
                    </div>
                  )}
                </div>
              </div>
          </div>

          <div className="flex-1">
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
                              src={leaderboard[1].avatar_url ? (leaderboard[1].avatar_url.startsWith('http') ? leaderboard[1].avatar_url : `${getApiUrl()}${leaderboard[1].avatar_url}`) : `${getApiUrl()}/uploads/default-avatar.png`} 
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
                        <p className="font-pixelify font-bold text-[#2d5a8a] text-sm">{leaderboard[1].display_name || leaderboard[1].username}</p>
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
                              src={leaderboard[0].avatar_url ? (leaderboard[0].avatar_url.startsWith('http') ? leaderboard[0].avatar_url : `${getApiUrl()}${leaderboard[0].avatar_url}`) : `${getApiUrl()}/uploads/default-avatar.png`} 
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
                        <p className="font-pixelify font-bold text-[#2d5a8a] text-base">{leaderboard[0].display_name || leaderboard[0].username}</p>
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
                              src={leaderboard[2].avatar_url ? (leaderboard[2].avatar_url.startsWith('http') ? leaderboard[2].avatar_url : `${getApiUrl()}${leaderboard[2].avatar_url}`) : `${getApiUrl()}/uploads/default-avatar.png`} 
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
                        <p className="font-pixelify font-bold text-[#2d5a8a] text-sm">{leaderboard[2].display_name || leaderboard[2].username}</p>
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
                                    src={player.avatar_url ? (player.avatar_url.startsWith('http') ? player.avatar_url : `${getApiUrl()}${player.avatar_url}`) : `${getApiUrl()}/uploads/default-avatar.png`} 
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
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 relative overflow-hidden">
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
              <div>
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
                    const isDraw = match.winner === 'draw';
                    
                    return (
                      <tr key={`${match.game_type || 'pong'}-${match.id}`} className="group hover:bg-white/10 transition-all duration-300 relative hover:scale-[1.01] hover:shadow-lg">
                        {/* Animated side indicator */}
                        <td className="py-4 pl-4 relative">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-300 ${
                            isDraw 
                              ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 group-hover:w-2'
                              : isWinner 
                              ? 'bg-gradient-to-b from-green-400 to-green-600 group-hover:w-2' 
                              : 'bg-gradient-to-b from-red-400 to-red-600 group-hover:w-2'
                          }`}></div>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-md transition-all duration-300 group-hover:scale-110 ${
                            isDraw
                              ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-2 border-yellow-300'
                              : isWinner 
                              ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-2 border-green-300' 
                              : 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-2 border-red-300'
                          }`}>
                            {isDraw ? '— DRAW' : isWinner ? '✓ WIN' : '✗ LOSS'}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white/30 group-hover:ring-4 transition-all duration-300">
                              {opponent.avatar ? (
                                <img src={opponent.avatar.startsWith('http') ? opponent.avatar : `${getApiUrl()}${opponent.avatar}`} alt="" className="w-full h-full object-cover" />
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

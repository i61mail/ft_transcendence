"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getProfile, getMatchHistory, API_URL } from "@/lib/api";

interface UserProfile {
  id: number;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface MatchStats {
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
}

interface Match {
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData && userData !== "undefined") {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data:", e);
        localStorage.removeItem("user");
      }
    }

    const verifyAuthAndLoadProfile = async () => {
      try {
        // Verify authentication
        const response = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
        if (!response.ok) {
          localStorage.removeItem("user");
          router.push("/");
          return;
        }
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Load profile
        const profileData = await getProfile();
        setProfile(profileData.user);

        // Load match history
        const matchData = await getMatchHistory();
        setMatchStats(matchData.stats);
        setMatches(matchData.matches);

        setLoading(false);
      } catch (e: any) {
        console.error("Error loading profile:", e);
        localStorage.removeItem("user");
        router.push("/");
      }
    };
    
    verifyAuthAndLoadProfile();
  }, [router]);

  if (loading || !profile || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#bcc3d4]">
        <p className="text-xl font-pixelify text-[#2d5a8a]">Loading...</p>
      </div>
    );
  }

  const avatarUrl = profile.avatar_url 
    ? `${API_URL}${profile.avatar_url}`
    : "/default-avatar.png";

  const displayName = profile.display_name || profile.username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c8d5e8] via-[#bcc3d4] to-[#a8b0c5] flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 border-4 border-white/20 rounded-lg animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border-4 border-blue-300/20 rounded-full animate-float-diagonal"></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 border-4 border-purple-300/20 rounded-lg rotate-45 animate-float-reverse"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 border-4 border-pink-300/20 rounded-full animate-spin-slow"></div>
        
        {/* Pulsing circles */}
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-blue-300/10 rounded-full animate-pulse-slow blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-purple-300/10 rounded-full animate-pulse-slower blur-xl"></div>
        
        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-3xl animate-float-circle"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-tl from-pink-300/20 to-transparent rounded-full blur-3xl animate-float-reverse-slow"></div>
        
        {/* Pong Simulation - Much More Visible */}
        <div className="absolute top-32 left-32 w-96 h-64 opacity-60">
          <div className="relative w-full h-full border-4 border-[#2d5a8a]/60 rounded-xl bg-white/5 backdrop-blur-sm shadow-2xl">
            {/* Left Paddle */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-24 bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg shadow-lg animate-paddle-left-fast"></div>
            {/* Right Paddle */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-24 bg-gradient-to-r from-pink-500 to-pink-400 rounded-lg shadow-lg animate-paddle-right-fast"></div>
            {/* Ball */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pong-ball-fast"></div>
            {/* Center Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2">
              <div className="w-full h-full flex flex-col gap-2 py-2">
                <div className="w-full h-7 bg-white/40 rounded"></div>
                <div className="w-full h-7 bg-white/40 rounded"></div>
                <div className="w-full h-7 bg-white/40 rounded"></div>
                <div className="w-full h-7 bg-white/40 rounded"></div>
                <div className="w-full h-7 bg-white/40 rounded"></div>
                <div className="w-full h-7 bg-white/40 rounded"></div>
                <div className="w-full h-7 bg-white/40 rounded"></div>
              </div>
            </div>
            {/* Score Display */}
            <div className="absolute top-4 left-1/4 font-pixelify text-4xl font-bold text-white/70">3</div>
            <div className="absolute top-4 right-1/4 font-pixelify text-4xl font-bold text-white/70">5</div>
          </div>
        </div>
        
        {/* Tic-Tac-Toe Simulation - Much More Visible */}
        <div className="absolute bottom-10 right-32 w-64 h-64 opacity-70">
          <div className="grid grid-cols-3 gap-3 w-full h-full p-4 bg-white/10 backdrop-blur-sm rounded-xl border-4 border-[#2d5a8a]/60 shadow-2xl">
            <div className="border-4 border-[#2d5a8a]/50 rounded-lg bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30 transition-all">
              <span className="text-5xl text-blue-600 font-bold animate-appear-scale-1">X</span>
            </div>
            <div className="border-4 border-[#2d5a8a]/50 rounded-lg bg-pink-500/20 flex items-center justify-center hover:bg-pink-500/30 transition-all">
              <span className="text-5xl text-pink-600 font-bold animate-appear-scale-3">O</span>
            </div>
            <div className="border-4 border-[#2d5a8a]/50 rounded-lg bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30 transition-all">
              <span className="text-5xl text-blue-600 font-bold animate-appear-scale-5">X</span>
            </div>
            <div className="border-4 border-[#2d5a8a]/50 rounded-lg bg-pink-500/20 flex items-center justify-center hover:bg-pink-500/30 transition-all">
              <span className="text-5xl text-pink-600 font-bold animate-appear-scale-4">O</span>
            </div>
            <div className="border-4 border-[#2d5a8a]/50 rounded-lg bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30 transition-all">
              <span className="text-5xl text-blue-600 font-bold animate-appear-scale-2">X</span>
            </div>
            <div className="border-4 border-[#2d5a8a]/50 rounded-lg bg-pink-500/20 flex items-center justify-center hover:bg-pink-500/30 transition-all">
              <span className="text-5xl text-pink-600 font-bold animate-appear-scale-6">O</span>
            </div>
            <div className="border-4 border-[#2d5a8a]/50 rounded-lg bg-white/5"></div>
            <div className="border-4 border-[#2d5a8a]/50 rounded-lg bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30 transition-all">
              <span className="text-5xl text-blue-600 font-bold animate-appear-scale-7">X</span>
            </div>
            <div className="border-4 border-[#2d5a8a]/50 rounded-lg bg-white/5"></div>
          </div>
        </div>
        
        {/* Trophy and Stars - More Visible */}
        <div className="absolute top-1/2 right-1/4 text-8xl opacity-40 animate-trophy-float-big">🏆</div>
        <div className="absolute bottom-1/3 left-1/4 text-7xl opacity-40 animate-star-rotate-big">⭐</div>
        <div className="absolute top-1/3 left-1/2 text-6xl opacity-40 animate-gamepad-bounce-big">🎮</div>
        <div className="absolute top-2/3 right-1/2 text-6xl opacity-30 animate-fire-float">🔥</div>
      </div>

      <Header user={user} onUserUpdate={setUser} activeRoute="profile" />

      <main className="flex-1 flex items-center justify-center p-6 overflow-hidden relative z-10">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 w-full max-w-6xl shadow-2xl border border-white/20 max-h-[calc(100vh-140px)] overflow-y-auto">
          <h1 className="font-pixelify text-4xl font-bold text-[#2d5a8a] mb-6 text-center drop-shadow-lg">
            My Profile
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Avatar and Basic Info */}
            <div className="lg:col-span-1 flex flex-col gap-4 items-center">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={`${displayName}'s avatar`}
                  className="w-44 h-44 rounded-full object-cover ring-4 ring-white/50 shadow-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-avatar.png";
                  }}
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
              </div>

              {/* Display Name */}
              <div className="w-full backdrop-blur-md bg-white/20 rounded-2xl p-4 shadow-lg border border-white/30 text-center">
                <p className="font-pixelify text-sm font-semibold text-[#2d5a8a]/70 uppercase mb-2 tracking-wider">
                  Display Name
                </p>
                <p className="font-pixelify text-2xl font-bold text-[#2d5a8a]">
                  {displayName}
                </p>
              </div>

              {/* Username */}
              <div className="w-full backdrop-blur-md bg-white/20 rounded-2xl p-4 shadow-lg border border-white/30 text-center">
                <p className="font-pixelify text-sm font-semibold text-[#2d5a8a]/70 uppercase mb-2 tracking-wider">
                  Username
                </p>
                <p className="font-pixelify text-2xl font-bold text-[#2d5a8a]">
                  @{profile.username}
                </p>
              </div>

              {/* Email */}
              <div className="w-full backdrop-blur-md bg-white/20 rounded-2xl p-4 shadow-lg border border-white/30 text-center">
                <p className="font-pixelify text-sm font-semibold text-[#2d5a8a]/70 uppercase mb-2 tracking-wider">
                  Email
                </p>
                <p className="font-pixelify text-xl font-bold text-[#2d5a8a] break-all">
                  {profile.email}
                </p>
              </div>

              {/* Member Since */}
              <div className="w-full backdrop-blur-md bg-white/20 rounded-2xl p-4 shadow-lg border border-white/30 text-center flex-1 flex flex-col justify-center">
                <p className="font-pixelify text-sm font-semibold text-[#2d5a8a]/70 uppercase mb-2 tracking-wider">
                  Member Since
                </p>
                <p className="font-pixelify text-lg font-bold text-[#2d5a8a]">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Right Column - Stats and Matches */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Game Stats section */}
              <div className="backdrop-blur-md bg-white/20 rounded-2xl p-5 shadow-lg border border-white/30">
                <h2 className="font-pixelify text-xl font-bold text-[#2d5a8a] mb-4">Game Statistics</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center backdrop-blur-md bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="font-pixelify text-3xl font-bold text-green-600">{matchStats?.wins || 0}</p>
                    <p className="font-pixelify text-xs text-[#2d5a8a]/70 mt-1">Wins</p>
                  </div>
                  <div className="text-center backdrop-blur-md bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="font-pixelify text-3xl font-bold text-red-600">{matchStats?.losses || 0}</p>
                    <p className="font-pixelify text-xs text-[#2d5a8a]/70 mt-1">Losses</p>
                  </div>
                  <div className="text-center backdrop-blur-md bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="font-pixelify text-3xl font-bold text-blue-600">{matchStats?.winRate || 0}%</p>
                    <p className="font-pixelify text-xs text-[#2d5a8a]/70 mt-1">Win Rate</p>
                  </div>
                </div>
              </div>

              {/* Match History */}
              <div className="backdrop-blur-md bg-white/20 rounded-2xl p-5 shadow-lg border border-white/30 flex-1 flex flex-col">
                <h2 className="font-pixelify text-xl font-bold text-[#2d5a8a] mb-4">Recent Matches</h2>
                {matches && matches.length > 0 ? (
                  <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {matches.slice(0, 10).map((match) => {
                      const isLeftPlayer = match.left_player_id === profile?.id;
                      const isDraw = match.winner === 'draw';
                      const isWinner = !isDraw && ((isLeftPlayer && match.winner === 'left') || (!isLeftPlayer && match.winner === 'right'));
                      const opponentName = isLeftPlayer 
                        ? (match.right_player_display_name || match.right_player_username || 'AI')
                        : (match.left_player_display_name || match.left_player_username);
                      const userScore = isLeftPlayer ? match.left_score : match.right_score;
                      const opponentScore = isLeftPlayer ? match.right_score : match.left_score;
                      const isLocalGame = match.game_mode === 'local';

                      return (
                        <div 
                          key={`${match.game_type || 'pong'}-${match.id}`}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${
                            isLocalGame
                              ? 'bg-blue-500/20 border-blue-400/50 hover:bg-blue-500/30'
                              : isDraw
                              ? 'bg-yellow-500/20 border-yellow-400/50 hover:bg-yellow-500/30'
                              : isWinner 
                              ? 'bg-green-500/20 border-green-400/50 hover:bg-green-500/30' 
                              : 'bg-red-500/20 border-red-400/50 hover:bg-red-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isLocalGame ? 'bg-blue-500' : isDraw ? 'bg-yellow-500' : isWinner ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}></div>
                            <div>
                              <p className="font-pixelify font-semibold text-[#2d5a8a] text-base">
                                {isLocalGame ? '🎮 Local Game' : isDraw ? '🤝 Draw' : isWinner ? '🏆 Victory' : '💔 Defeat'}{!isLocalGame && ` vs ${opponentName}`}
                              </p>
                              <p className="font-pixelify text-xs text-[#2d5a8a]/60">
                                {new Date(match.created_at).toLocaleDateString()} • {match.game_mode}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-pixelify text-2xl font-bold text-[#2d5a8a]">
                              {match.game_mode === 'tictactoe' && isDraw ? 'Draw' : `${userScore} - ${opponentScore}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-30">
                    <p className="font-pixelify text-lg text-[#2d5a8a]/60">
                      No games played yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(45, 90, 138, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 90, 138, 0.7);
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-diagonal {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(20px) rotate(50deg); }
        }
        @keyframes float-circle {
          0% { transform: translate(0, 0); }
          25% { transform: translate(20px, -20px); }
          50% { transform: translate(40px, 0); }
          75% { transform: translate(20px, 20px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes float-reverse-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -30px) scale(1.2); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes paddle-left {
          0%, 100% { transform: translateY(-50%) translateY(0); }
          25% { transform: translateY(-50%) translateY(-20px); }
          75% { transform: translateY(-50%) translateY(20px); }
        }
        @keyframes paddle-right {
          0%, 100% { transform: translateY(-50%) translateY(0); }
          25% { transform: translateY(-50%) translateY(20px); }
          75% { transform: translateY(-50%) translateY(-20px); }
        }
        @keyframes paddle-left-fast {
          0%, 100% { transform: translateY(-50%) translateY(0); }
          25% { transform: translateY(-50%) translateY(40px); }
          50% { transform: translateY(-50%) translateY(100px); }
          75% { transform: translateY(-50%) translateY(-20px); }
        }
        @keyframes paddle-right-fast {
          0%, 100% { transform: translateY(-50%) translateY(0); }
          25% { transform: translateY(-50%) translateY(50px); }
          50% { transform: translateY(-50%) translateY(100px); }
          75% { transform: translateY(-50%) translateY(-20px); }
        }
        @keyframes pong-ball-diagonal {
          0% { transform: translate(0, 0); }
          25% { transform: translate(100px, -40px); }
          50% { transform: translate(200px, 0); }
          75% { transform: translate(100px, 40px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes pong-ball-fast {
          0% { transform: translate(-50%, -50%) translate(0, 0); }
          12% { transform: translate(-50%, -50%) translate(100px, -50px); }
          25% { transform: translate(-50%, -50%) translate(160px, 0); }
          37% { transform: translate(-50%, -50%) translate(100px, 60px); }
          50% { transform: translate(-50%, -50%) translate(0, 0); }
          62% { transform: translate(-50%, -50%) translate(-100px, 50px); }
          75% { transform: translate(-50%, -50%) translate(-140px, 0); }
          87% { transform: translate(-50%, -50%) translate(-100px, -60px); }
          100% { transform: translate(-50%, -50%) translate(0, 0); }
        }
        @keyframes appear-1 {
          0%, 10% { opacity: 0; transform: scale(0); }
          15% { opacity: 1; transform: scale(1.2); }
          20%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes appear-2 {
          0%, 20% { opacity: 0; transform: scale(0); }
          25% { opacity: 1; transform: scale(1.2); }
          30%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes appear-3 {
          0%, 30% { opacity: 0; transform: scale(0); }
          35% { opacity: 1; transform: scale(1.2); }
          40%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes appear-4 {
          0%, 40% { opacity: 0; transform: scale(0); }
          45% { opacity: 1; transform: scale(1.2); }
          50%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes appear-5 {
          0%, 50% { opacity: 0; transform: scale(0); }
          55% { opacity: 1; transform: scale(1.2); }
          60%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes appear-6 {
          0%, 60% { opacity: 0; transform: scale(0); }
          65% { opacity: 1; transform: scale(1.2); }
          70%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes appear-7 {
          0%, 70% { opacity: 0; transform: scale(0); }
          75% { opacity: 1; transform: scale(1.2); }
          80%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes appear-scale-1 {
          0%, 12% { opacity: 0; transform: scale(0) rotate(0deg); }
          15% { opacity: 1; transform: scale(1.3) rotate(180deg); }
          18%, 100% { opacity: 1; transform: scale(1) rotate(360deg); }
        }
        @keyframes appear-scale-2 {
          0%, 25% { opacity: 0; transform: scale(0) rotate(0deg); }
          28% { opacity: 1; transform: scale(1.3) rotate(180deg); }
          31%, 100% { opacity: 1; transform: scale(1) rotate(360deg); }
        }
        @keyframes appear-scale-3 {
          0%, 37% { opacity: 0; transform: scale(0) rotate(0deg); }
          40% { opacity: 1; transform: scale(1.3) rotate(180deg); }
          43%, 100% { opacity: 1; transform: scale(1) rotate(360deg); }
        }
        @keyframes appear-scale-4 {
          0%, 50% { opacity: 0; transform: scale(0) rotate(0deg); }
          53% { opacity: 1; transform: scale(1.3) rotate(180deg); }
          56%, 100% { opacity: 1; transform: scale(1) rotate(360deg); }
        }
        @keyframes appear-scale-5 {
          0%, 62% { opacity: 0; transform: scale(0) rotate(0deg); }
          65% { opacity: 1; transform: scale(1.3) rotate(180deg); }
          68%, 100% { opacity: 1; transform: scale(1) rotate(360deg); }
        }
        @keyframes appear-scale-6 {
          0%, 75% { opacity: 0; transform: scale(0) rotate(0deg); }
          78% { opacity: 1; transform: scale(1.3) rotate(180deg); }
          81%, 100% { opacity: 1; transform: scale(1) rotate(360deg); }
        }
        @keyframes appear-scale-7 {
          0%, 87% { opacity: 0; transform: scale(0) rotate(0deg); }
          90% { opacity: 1; transform: scale(1.3) rotate(180deg); }
          93%, 100% { opacity: 1; transform: scale(1) rotate(360deg); }
        }
        @keyframes trophy-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        @keyframes trophy-float-big {
          0%, 100% { transform: translateY(0) rotate(-10deg) scale(1); }
          25% { transform: translateY(-40px) rotate(5deg) scale(1.1); }
          50% { transform: translateY(0) rotate(10deg) scale(1); }
          75% { transform: translateY(-40px) rotate(-5deg) scale(1.1); }
        }
        @keyframes star-rotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes star-rotate-big {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.3); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.3); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes gamepad-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        @keyframes gamepad-bounce-big {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-50px) rotate(-15deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-50px) rotate(15deg); }
        }
        @keyframes fire-float {
          0%, 100% { transform: translateY(0) scale(1); }
          33% { transform: translateY(-30px) scale(1.2); }
          66% { transform: translateY(-15px) scale(0.9); }
        }
        
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-diagonal { animation: float-diagonal 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
        .animate-float-circle { animation: float-circle 20s ease-in-out infinite; }
        .animate-float-reverse-slow { animation: float-reverse-slow 15s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-slower { animation: pulse-slower 4s ease-in-out infinite; }
        .animate-paddle-left { animation: paddle-left 3s ease-in-out infinite; }
        .animate-paddle-right { animation: paddle-right 3s ease-in-out infinite; }
        .animate-paddle-left-fast { animation: paddle-left-fast 2s ease-in-out infinite; }
        .animate-paddle-right-fast { animation: paddle-right-fast 2s ease-in-out infinite; }
        .animate-pong-ball-diagonal { animation: pong-ball-diagonal 4s ease-in-out infinite; }
        .animate-pong-ball-fast { animation: pong-ball-fast 3s ease-in-out infinite; }
        .animate-appear-1 { animation: appear-1 8s ease-in-out infinite; }
        .animate-appear-2 { animation: appear-2 8s ease-in-out infinite; }
        .animate-appear-3 { animation: appear-3 8s ease-in-out infinite; }
        .animate-appear-4 { animation: appear-4 8s ease-in-out infinite; }
        .animate-appear-5 { animation: appear-5 8s ease-in-out infinite; }
        .animate-appear-6 { animation: appear-6 8s ease-in-out infinite; }
        .animate-appear-7 { animation: appear-7 8s ease-in-out infinite; }
        .animate-appear-scale-1 { animation: appear-scale-1 8s ease-in-out infinite; }
        .animate-appear-scale-2 { animation: appear-scale-2 8s ease-in-out infinite; }
        .animate-appear-scale-3 { animation: appear-scale-3 8s ease-in-out infinite; }
        .animate-appear-scale-4 { animation: appear-scale-4 8s ease-in-out infinite; }
        .animate-appear-scale-5 { animation: appear-scale-5 8s ease-in-out infinite; }
        .animate-appear-scale-6 { animation: appear-scale-6 8s ease-in-out infinite; }
        .animate-appear-scale-7 { animation: appear-scale-7 8s ease-in-out infinite; }
        .animate-trophy-float { animation: trophy-float 5s ease-in-out infinite; }
        .animate-trophy-float-big { animation: trophy-float-big 4s ease-in-out infinite; }
        .animate-star-rotate { animation: star-rotate 8s ease-in-out infinite; }
        .animate-star-rotate-big { animation: star-rotate-big 6s ease-in-out infinite; }
        .animate-gamepad-bounce { animation: gamepad-bounce 3s ease-in-out infinite; }
        .animate-gamepad-bounce-big { animation: gamepad-bounce-big 3s ease-in-out infinite; }
        .animate-fire-float { animation: fire-float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

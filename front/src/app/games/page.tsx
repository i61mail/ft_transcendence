'use client'

import useglobalStore from "@/store/globalStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8080/api';

const Games = () =>
{
    const manager = useglobalStore();
    const router = useRouter();
    const [selectedGame, setSelectedGame] = useState<'pong' | 'tictactoe' | null>(null);
    const [showDifficultySelection, setShowDifficultySelection] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() =>
    {
        const verifyAuth = async () =>
        {
            try
            {
                const response = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
                if (!response.ok)
                    throw new Error("Not authenticated");
                const data = await response.json();
                if (!manager.user)
                    manager.updateUser(data.user);
                
                setLoading(false);
            } catch (e)
            {
                localStorage.removeItem("user");
                router.push("/");
            }
        };
        verifyAuth();
    }, [router, manager]);

    const handleGameSelect = (game: 'pong' | 'tictactoe') =>
    {
        setSelectedGame(game);
    };

    const handleBack = () =>
    {
        setSelectedGame(null);
    };

    const handleJoinTournament = () =>
    {
        const input = document.getElementById('tournament-code') as HTMLInputElement | null;
        const code = (input?.value ?? '').trim().toUpperCase();
        if (!code || code.length !== 6) return;
        router.push(`/games/tournament?code=${encodeURIComponent(code)}`);
    };

    if (loading)
    {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#c8d5e8] via-[#bcc3d4] to-[#a8b0c5]">
                <p className="text-xl font-pixelify text-[#2d5a8a]">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#c8d5e8] via-[#bcc3d4] to-[#a8b0c5] relative">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob top-0 -left-20"></div>
                <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000 top-0 right-0"></div>
                <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
            </div>

            <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/10">
                <Header user={manager.user} activeRoute="game" />
            </div>

            <main className="p-6 relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center">
                <div className="w-full max-w-6xl">
                    
                    {!selectedGame ? (
                        <div className="flex flex-col items-center space-y-12">
                            <div className="text-center space-y-4">
                                <h1 className="font-pixelify text-7xl font-bold text-[#2d5a8a] drop-shadow-lg">
                                    Choose Your Game! 
                                </h1>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 w-full max-w-4xl">
                                {/* Pong Card */}
                                <button
                                    onClick={() => handleGameSelect('pong')}
                                    className="group relative backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl border border-white/30 hover:bg-white/30 transition-all duration-500 hover:scale-105 overflow-hidden"
                                >
                                    {/* Decorative Pattern */}
                                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                                        <svg className="w-full h-full">
                                            <pattern id="pong-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                                <circle cx="20" cy="20" r="2" fill="currentColor" className="text-blue-500" />
                                            </pattern>
                                            <rect x="0" y="0" width="100%" height="100%" fill="url(#pong-pattern)" />
                                        </svg>
                                    </div>

                                    {/* Game Visual */}
                                    <div className="flex justify-center mb-6 relative">
                                        <div className="relative w-64 h-40 border-4 border-[#4a7bb8] rounded-2xl bg-white/10 flex items-center justify-between px-6">
                                            <div className="w-3 h-16 bg-[#4a7bb8] rounded-full animate-paddle-left shadow-lg" />
                                            <div className="w-4 h-4 bg-yellow-400 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-ball-bounce shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
                                            <div className="w-3 h-16 bg-[#4a7bb8] rounded-full animate-paddle-right shadow-lg" />
                                            {/* Dashed center line */}
                                            <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 border-l-4 border-dashed border-white/30" />
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="font-pixelify text-4xl font-bold text-[#2d5a8a] mb-3 group-hover:text-[#4a7bb8] transition-colors">
                                             Pong
                                        </h3>
                                    </div>

                                </button>

                                {/* TicTacToe Card */}
                                <button
                                    onClick={() => handleGameSelect('tictactoe')}
                                    className="group relative backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl border border-white/30 hover:bg-white/30 transition-all duration-500 hover:scale-105 overflow-hidden"
                                >
                                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                                        <svg className="w-full h-full">
                                            <pattern id="ttt-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                                <path d="M0 20L40 20M20 0L20 40" stroke="currentColor" strokeWidth="2" className="text-purple-500" />
                                            </pattern>
                                            <rect x="0" y="0" width="100%" height="100%" fill="url(#ttt-pattern)" />
                                        </svg>
                                    </div>

                                    {/* Game Visual */}
                                    <div className="flex justify-center mb-6 relative">
                                        <div className="grid grid-cols-3 gap-3 p-6 bg-white/10 rounded-2xl border-4 border-[#4a7bb8]">
                                            {[
                                                { content: 'X', color: 'text-blue-500', delay: '0s' },
                                                { content: 'O', color: 'text-pink-500', delay: '0.2s' },
                                                { content: 'X', color: 'text-blue-500', delay: '0.4s' },
                                                { content: '', color: '', delay: '0s' },
                                                { content: 'O', color: 'text-pink-500', delay: '0.6s' },
                                                { content: '', color: '', delay: '0s' },
                                                { content: '', color: '', delay: '0s' },
                                                { content: 'X', color: 'text-blue-500', delay: '0.8s' },
                                                { content: 'O', color: 'text-pink-500', delay: '1s' }
                                            ].map((cell, i) => (
                                                <div key={i} className="w-12 h-12 bg-white/20 rounded-xl border-2 border-white/40 flex items-center justify-center font-pixelify text-2xl font-bold shadow-lg">
                                                    <span 
                                                        className={`${cell.color} ${cell.content ? 'animate-pop-in' : ''}`}
                                                        style={{ animationDelay: cell.delay }}
                                                    >
                                                        {cell.content}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="font-pixelify text-4xl font-bold text-[#2d5a8a] mb-3 group-hover:text-[#4a7bb8] transition-colors">
                                             Tic-Tac-Toe
                                        </h3>
                                    </div>

                                    {/* Decorative Stars */}
                                </button>
                            </div>
                        </div>
                    ) : showDifficultySelection ? (
                        <div className="flex flex-col items-center w-full">
                            <button 
                                onClick={() => setShowDifficultySelection(false)}
                                className="self-start mb-8 flex items-center gap-2 font-pixelify text-[#2d5a8a] hover:text-[#4a7bb8] transition-colors group backdrop-blur-xl bg-white/20 px-6 py-3 rounded-full border border-white/30"
                            >
                                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Modes
                            </button>

                            <div className="text-center mb-16">
                                <h2 className="font-pixelify text-6xl font-bold text-[#2d5a8a] mb-4">
                                    Select Difficulty
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl">
                                {/* Easy Difficulty */}
                                <button
                                    onClick={() => router.push('/games/ai?diff=easy')}
                                    className="group relative backdrop-blur-xl bg-white/30 rounded-3xl p-12 shadow-2xl border-2 border-white/40 hover:border-green-500 transition-all duration-500 hover:scale-105 text-center overflow-hidden"
                                >
                                    {/* Animated Background Particles */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                                        <div className="absolute top-4 left-4 w-3 h-3 bg-green-400 rounded-full animate-float-particle-1"></div>
                                        <div className="absolute top-12 right-8 w-2 h-2 bg-green-500 rounded-full animate-float-particle-2"></div>
                                        <div className="absolute bottom-8 left-12 w-2 h-2 bg-green-300 rounded-full animate-float-particle-3"></div>
                                        <div className="absolute bottom-4 right-4 w-3 h-3 bg-green-600 rounded-full animate-float-particle-4"></div>
                                    </div>

                                    {/* Orbiting Border Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="absolute top-0 left-0 w-full h-full">
                                            <div className="absolute top-4 left-4 w-4 h-4 bg-green-400 rounded-full animate-orbit-tl"></div>
                                            <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full animate-orbit-tr"></div>
                                            <div className="absolute bottom-4 left-4 w-4 h-4 bg-green-300 rounded-full animate-orbit-bl"></div>
                                            <div className="absolute bottom-4 right-4 w-4 h-4 bg-green-600 rounded-full animate-orbit-br"></div>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                                            <span className="text-5xl">👶</span>
                                        </div>
                                        <h3 className="font-pixelify text-3xl font-bold text-[#2d5a8a] mb-3">Easy</h3>
                                        <p className="font-pixelify text-sm text-[#2d5a8a]/70">Perfect for beginners</p>
                                    </div>
                                </button>

                                {/* Medium Difficulty */}
                                <button
                                    onClick={() => router.push('/games/ai?diff=meduim')}
                                    className="group relative backdrop-blur-xl bg-white/30 rounded-3xl p-12 shadow-2xl border-2 border-white/40 hover:border-yellow-500 transition-all duration-500 hover:scale-105 text-center overflow-hidden"
                                >
                                    {/* Animated Background Particles */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                                        <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-float-particle-1"></div>
                                        <div className="absolute top-12 right-8 w-2 h-2 bg-yellow-500 rounded-full animate-float-particle-2"></div>
                                        <div className="absolute bottom-8 left-12 w-2 h-2 bg-yellow-300 rounded-full animate-float-particle-3"></div>
                                        <div className="absolute bottom-4 right-4 w-3 h-3 bg-yellow-600 rounded-full animate-float-particle-4"></div>
                                    </div>

                                    {/* Orbiting Border Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="absolute top-0 left-0 w-full h-full">
                                            <div className="absolute top-4 left-4 w-4 h-4 bg-yellow-400 rounded-full animate-orbit-tl"></div>
                                            <div className="absolute top-4 right-4 w-4 h-4 bg-yellow-500 rounded-full animate-orbit-tr"></div>
                                            <div className="absolute bottom-4 left-4 w-4 h-4 bg-yellow-300 rounded-full animate-orbit-bl"></div>
                                            <div className="absolute bottom-4 right-4 w-4 h-4 bg-yellow-600 rounded-full animate-orbit-br"></div>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                                            <span className="text-5xl">⚔️</span>
                                        </div>
                                        <h3 className="font-pixelify text-3xl font-bold text-[#2d5a8a] mb-3">Medium</h3>
                                        <p className="font-pixelify text-sm text-[#2d5a8a]/70">Balanced challenge</p>
                                    </div>
                                </button>

                                {/* Hard Difficulty */}
                                <button
                                    onClick={() => router.push('/games/ai?diff=hard')}
                                    className="group relative backdrop-blur-xl bg-white/30 rounded-3xl p-12 shadow-2xl border-2 border-white/40 hover:border-red-500 transition-all duration-500 hover:scale-105 text-center overflow-hidden"
                                >
                                    {/* Animated Background Particles */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                                        <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full animate-float-particle-1"></div>
                                        <div className="absolute top-12 right-8 w-2 h-2 bg-red-500 rounded-full animate-float-particle-2"></div>
                                        <div className="absolute bottom-8 left-12 w-2 h-2 bg-red-300 rounded-full animate-float-particle-3"></div>
                                        <div className="absolute bottom-4 right-4 w-3 h-3 bg-red-600 rounded-full animate-float-particle-4"></div>
                                    </div>

                                    {/* Orbiting Border Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="absolute top-0 left-0 w-full h-full">
                                            <div className="absolute top-4 left-4 w-4 h-4 bg-red-400 rounded-full animate-orbit-tl"></div>
                                            <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full animate-orbit-tr"></div>
                                            <div className="absolute bottom-4 left-4 w-4 h-4 bg-red-300 rounded-full animate-orbit-bl"></div>
                                            <div className="absolute bottom-4 right-4 w-4 h-4 bg-red-600 rounded-full animate-orbit-br"></div>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-red-400 to-red-700 flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                                            <span className="text-5xl">💀</span>
                                        </div>
                                        <h3 className="font-pixelify text-3xl font-bold text-[#2d5a8a] mb-3">Hard</h3>
                                        <p className="font-pixelify text-sm text-[#2d5a8a]/70">Extreme challenge</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center w-full">
                            <button 
                                onClick={handleBack}
                                className="self-start mb-8 flex items-center gap-2 font-pixelify text-[#2d5a8a] hover:text-[#4a7bb8] transition-colors group backdrop-blur-xl bg-white/20 px-6 py-3 rounded-full border border-white/30"
                            >
                                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Games
                            </button>

                            <div className="text-center mb-16">
                                <h2 className="font-pixelify text-6xl font-bold text-[#2d5a8a] mb-4">
                                    {selectedGame === 'pong' ? 'Pong Modes' : 'Tic-Tac-Toe Modes'}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 w-full max-w-7xl mb-16">
                                {/* Online Mode */}
                                <button
                                    onClick={() => router.push(`/games/${selectedGame === 'pong' ? 'online' : 'tictactoe'}`)}
                                    className="group relative backdrop-blur-xl bg-white/30 rounded-3xl p-12 shadow-2xl border-2 border-white/40 hover:border-[#4a7bb8] transition-all duration-500 hover:scale-105 text-center overflow-hidden"
                                >
                                    {/* Animated Background Particles */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                                        <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full animate-float-particle-1"></div>
                                        <div className="absolute top-12 right-8 w-2 h-2 bg-blue-500 rounded-full animate-float-particle-2"></div>
                                        <div className="absolute bottom-8 left-12 w-2 h-2 bg-blue-300 rounded-full animate-float-particle-3"></div>
                                        <div className="absolute bottom-4 right-4 w-3 h-3 bg-blue-600 rounded-full animate-float-particle-4"></div>
                                    </div>

                                    {/* Orbiting Border Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="absolute top-0 left-0 w-full h-full">
                                            <div className="absolute top-4 left-4 w-4 h-4 bg-blue-400 rounded-full animate-orbit-tl"></div>
                                            <div className="absolute top-4 right-4 w-4 h-4 bg-blue-500 rounded-full animate-orbit-tr"></div>
                                            <div className="absolute bottom-4 left-4 w-4 h-4 bg-blue-300 rounded-full animate-orbit-bl"></div>
                                            <div className="absolute bottom-4 right-4 w-4 h-4 bg-blue-600 rounded-full animate-orbit-br"></div>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-pixelify text-3xl font-bold text-[#2d5a8a] mb-3">Online Match</h3>
                                    </div>
                                </button>

                                {selectedGame === 'pong' && (
                                    <>
                                {/* Local Mode - Pong Only */}
                                <button
                                    onClick={() => router.push(selectedGame === 'pong' ? '/games/local' : '/games/tictactoe')}
                                    className="group relative backdrop-blur-xl bg-white/30 rounded-3xl p-12 shadow-2xl border-2 border-white/40 hover:border-green-500 transition-all duration-500 hover:scale-105 text-center overflow-hidden"
                                >
                                    {/* Animated Background Particles */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                                        <div className="absolute top-4 left-4 w-3 h-3 bg-green-400 rounded-full animate-float-particle-1"></div>
                                        <div className="absolute top-12 right-8 w-2 h-2 bg-green-500 rounded-full animate-float-particle-2"></div>
                                        <div className="absolute bottom-8 left-12 w-2 h-2 bg-green-300 rounded-full animate-float-particle-3"></div>
                                        <div className="absolute bottom-4 right-4 w-3 h-3 bg-green-600 rounded-full animate-float-particle-4"></div>
                                    </div>

                                    {/* Orbiting Border Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="absolute top-0 left-0 w-full h-full">
                                            <div className="absolute top-4 left-4 w-4 h-4 bg-green-400 rounded-full animate-orbit-tl"></div>
                                            <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full animate-orbit-tr"></div>
                                            <div className="absolute bottom-4 left-4 w-4 h-4 bg-green-300 rounded-full animate-orbit-bl"></div>
                                            <div className="absolute bottom-4 right-4 w-4 h-4 bg-green-600 rounded-full animate-orbit-br"></div>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-pixelify text-3xl font-bold text-[#2d5a8a] mb-3">Local Multiplayer</h3>
                                    </div>
                                </button>

                                {/* AI Mode - Pong Only */}
                                <button
                                    onClick={() => {
                                        if (selectedGame === 'pong') {
                                            setShowDifficultySelection(true);
                                        } else {
                                            router.push('/games/tictactoe?mode=ai');
                                        }
                                    }}
                                    className="group relative backdrop-blur-xl bg-white/30 rounded-3xl p-12 shadow-2xl border-2 border-white/40 hover:border-purple-500 transition-all duration-500 hover:scale-105 text-center overflow-hidden"
                                >
                                    {/* Animated Background Particles */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                                        <div className="absolute top-4 left-4 w-3 h-3 bg-purple-400 rounded-full animate-float-particle-1"></div>
                                        <div className="absolute top-12 right-8 w-2 h-2 bg-purple-500 rounded-full animate-float-particle-2"></div>
                                        <div className="absolute bottom-8 left-12 w-2 h-2 bg-purple-300 rounded-full animate-float-particle-3"></div>
                                        <div className="absolute bottom-4 right-4 w-3 h-3 bg-purple-600 rounded-full animate-float-particle-4"></div>
                                    </div>

                                    {/* Orbiting Border Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="absolute top-0 left-0 w-full h-full">
                                            <div className="absolute top-4 left-4 w-4 h-4 bg-purple-400 rounded-full animate-orbit-tl"></div>
                                            <div className="absolute top-4 right-4 w-4 h-4 bg-purple-500 rounded-full animate-orbit-tr"></div>
                                            <div className="absolute bottom-4 left-4 w-4 h-4 bg-purple-300 rounded-full animate-orbit-bl"></div>
                                            <div className="absolute bottom-4 right-4 w-4 h-4 bg-purple-600 rounded-full animate-orbit-br"></div>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-pixelify text-3xl font-bold text-[#2d5a8a] mb-3">Play vs AI</h3>
                                    </div>
                                </button>
                                    </>
                                )}

                                {/* Tic-Tac-Toe Animated Background */}
                                {selectedGame === 'tictactoe' && (
                                    <div className="lg:col-span-2 relative backdrop-blur-xl bg-white/20 rounded-3xl p-12 shadow-2xl border-2 border-white/40 overflow-hidden">
                                        {/* Animated Tic-Tac-Toe Game Simulation */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    { content: 'X', color: 'text-blue-500', delay: '0s' },
                                                    { content: 'O', color: 'text-pink-500', delay: '0.5s' },
                                                    { content: 'X', color: 'text-blue-500', delay: '1s' },
                                                    { content: '', color: '', delay: '' },
                                                    { content: 'O', color: 'text-pink-500', delay: '1.5s' },
                                                    { content: 'X', color: 'text-blue-500', delay: '2s' },
                                                    { content: 'O', color: 'text-pink-500', delay: '2.5s' },
                                                    { content: '', color: '', delay: '' },
                                                    { content: 'X', color: 'text-blue-500', delay: '3s' }
                                                ].map((cell, i) => (
                                                    <div key={i} className="w-24 h-24 bg-white/10 rounded-2xl border-2 border-white/30 flex items-center justify-center">
                                                        <span 
                                                            className={`font-pixelify text-5xl font-bold ${cell.color} ${cell.content ? 'animate-pop-in' : ''}`}
                                                            style={{ animationDelay: cell.delay, animationIterationCount: 'infinite', animationDuration: '4s' }}
                                                        >
                                                            {cell.content}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative z-10 text-center">
                                            <h3 className="font-pixelify text-4xl font-bold text-[#2d5a8a] mb-6">Classic Strategy Game</h3>
                                            <p className="font-pixelify text-xl text-[#2d5a8a]/80 mb-4">Test your tactical skills in real-time matches</p>
                                            <div className="flex justify-center gap-6 mt-8">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-pixelify text-6xl font-bold text-blue-500">X</span>
                                                    <span className="font-pixelify text-lg text-[#2d5a8a]">vs</span>
                                                    <span className="font-pixelify text-6xl font-bold text-pink-500">O</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Floating particles */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute top-8 left-8 w-4 h-4 bg-blue-400 rounded-full animate-float-particle-1 opacity-40"></div>
                                            <div className="absolute top-16 right-12 w-3 h-3 bg-pink-400 rounded-full animate-float-particle-2 opacity-40"></div>
                                            <div className="absolute bottom-12 left-16 w-3 h-3 bg-purple-400 rounded-full animate-float-particle-3 opacity-40"></div>
                                            <div className="absolute bottom-8 right-8 w-4 h-4 bg-blue-300 rounded-full animate-float-particle-4 opacity-40"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tournament Section (Pong Only) */}
                            {selectedGame === 'pong' && (
                                <div className="mt-16 w-full max-w-6xl backdrop-blur-xl bg-gradient-to-br from-purple-500/30 via-blue-500/25 to-indigo-600/30 rounded-3xl p-12 shadow-2xl border-2 border-purple-400/50 relative overflow-hidden group">
                                    {/* Animated Background Elements */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        {/* Floating geometric shapes */}
                                        <div className="absolute top-8 left-8 w-20 h-20 border-4 border-purple-400/30 rounded-lg animate-spin-slow"></div>
                                        <div className="absolute bottom-12 right-12 w-16 h-16 border-4 border-blue-400/30 rounded-full animate-pulse-slow"></div>
                                        <div className="absolute top-1/2 left-1/4 w-12 h-12 border-4 border-indigo-400/30 rotate-45 animate-float-particle-1"></div>
                                        <div className="absolute top-1/4 right-1/4 w-14 h-14 border-4 border-purple-300/30 rounded-xl animate-float-particle-2"></div>
                                        
                                        {/* Animated gradient orbs */}
                                        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl animate-pulse-slow"></div>
                                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-blue-400/20 to-transparent rounded-full blur-2xl animate-pulse-slow animation-delay-1000"></div>
                                        
                                        {/* Moving particles */}
                                        <div className="absolute top-16 right-24 w-3 h-3 bg-purple-400 rounded-full animate-float-particle-3 opacity-50"></div>
                                        <div className="absolute bottom-24 left-32 w-2 h-2 bg-blue-400 rounded-full animate-float-particle-4 opacity-50"></div>
                                        <div className="absolute top-32 left-16 w-2 h-2 bg-indigo-400 rounded-full animate-float-particle-1 opacity-60"></div>
                                        <div className="absolute bottom-16 right-40 w-3 h-3 bg-purple-300 rounded-full animate-float-particle-2 opacity-40"></div>
                                        
                                        {/* Scanning line effect */}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan-line opacity-30"></div>
                                    </div>

                                    
                                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                                        <div className="flex-1 text-center lg:text-left">
                                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                                                <h3 className="font-pixelify text-5xl font-bold text-[#2d5a8a]">Tournament Mode</h3>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4 w-full lg:w-auto min-w-[320px]">
                                            <div className="flex gap-3">
                                                <input
                                                    id="tournament-code"
                                                    placeholder="ENTER CODE"
                                                    maxLength={6}
                                                    className="flex-1 px-5 py-4 bg-white/50 backdrop-blur-md border-2 border-[#4a7bb8] rounded-2xl text-center uppercase font-pixelify font-bold text-[#2d5a8a] text-xl focus:border-purple-500 focus:outline-none shadow-lg transition-all hover:bg-white/60"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleJoinTournament()}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={handleJoinTournament}
                                                    className="px-6 py-4 bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-pixelify font-bold text-lg rounded-2xl transition-all shadow-xl hover:scale-105 hover:shadow-2xl"
                                                >
                                                    Join
                                                </button>
                                                <button
                                                    onClick={() => router.push('/games/tournament')}
                                                    className="px-6 py-4 bg-gradient-to-br from-[#4a7bb8] to-[#2d5a8a] hover:from-[#5a8bc8] hover:to-[#3d6a9a] text-white font-pixelify font-bold text-lg rounded-2xl transition-all shadow-xl hover:scale-105 hover:shadow-2xl"
                                                >
                                                    Create
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                @keyframes paddle-left {
                    0%, 100% { transform: translateY(-15px); }
                    50% { transform: translateY(15px); }
                }
                .animate-paddle-left {
                    animation: paddle-left 2s ease-in-out infinite;
                }
                @keyframes paddle-right {
                    0%, 100% { transform: translateY(15px); }
                    50% { transform: translateY(-15px); }
                }
                .animate-paddle-right {
                    animation: paddle-right 2s ease-in-out infinite;
                }
                @keyframes ball-bounce {
                    0%, 100% { transform: translate(-50%, -50%) translateX(-40px); }
                    50% { transform: translate(-50%, -50%) translateX(40px); }
                }
                .animate-ball-bounce {
                    animation: ball-bounce 2s ease-in-out infinite;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
                @keyframes float-particle-1 {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(10px, -10px); }
                    50% { transform: translate(-5px, -20px); }
                    75% { transform: translate(-10px, -10px); }
                }
                .animate-float-particle-1 {
                    animation: float-particle-1 4s ease-in-out infinite;
                }
                @keyframes float-particle-2 {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(-15px, 10px); }
                    50% { transform: translate(5px, 20px); }
                    75% { transform: translate(15px, 5px); }
                }
                .animate-float-particle-2 {
                    animation: float-particle-2 5s ease-in-out infinite;
                }
                @keyframes float-particle-3 {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(15px, -5px); }
                    50% { transform: translate(-10px, -15px); }
                    75% { transform: translate(-5px, -5px); }
                }
                .animate-float-particle-3 {
                    animation: float-particle-3 6s ease-in-out infinite;
                }
                @keyframes float-particle-4 {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(-10px, 15px); }
                    50% { transform: translate(10px, 10px); }
                    75% { transform: translate(5px, 20px); }
                }
                .animate-float-particle-4 {
                    animation: float-particle-4 5.5s ease-in-out infinite;
                }
                @keyframes orbit-tl {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(20px, 0); }
                    50% { transform: translate(20px, 20px); }
                    75% { transform: translate(0, 20px); }
                    100% { transform: translate(0, 0); }
                }
                .animate-orbit-tl {
                    animation: orbit-tl 3s linear infinite;
                }
                @keyframes orbit-tr {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(0, 20px); }
                    50% { transform: translate(-20px, 20px); }
                    75% { transform: translate(-20px, 0); }
                    100% { transform: translate(0, 0); }
                }
                .animate-orbit-tr {
                    animation: orbit-tr 3s linear infinite;
                }
                @keyframes orbit-bl {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(20px, 0); }
                    50% { transform: translate(20px, -20px); }
                    75% { transform: translate(0, -20px); }
                    100% { transform: translate(0, 0); }
                }
                .animate-orbit-bl {
                    animation: orbit-bl 3s linear infinite;
                }
                @keyframes orbit-br {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(-20px, 0); }
                    50% { transform: translate(-20px, -20px); }
                    75% { transform: translate(0, -20px); }
                    100% { transform: translate(0, 0); }
                }
                .animate-orbit-br {
                    animation: orbit-br 3s linear infinite;
                }
                @keyframes pop-in {
                    0% { 
                        transform: scale(0) rotate(0deg);
                        opacity: 0;
                    }
                    50% { 
                        transform: scale(1.3) rotate(180deg);
                    }
                    100% { 
                        transform: scale(1) rotate(360deg);
                        opacity: 1;
                    }
                }
                .animate-pop-in {
                    animation: pop-in 2s ease-out infinite;
                    display: inline-block;
                }
                @keyframes pulse-slow {
                    0%, 100% { 
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.6;
                        transform: scale(1.1);
                    }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
                @keyframes scan-line {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(400px); }
                }
                .animate-scan-line {
                    animation: scan-line 4s linear infinite;
                }
            `}</style>
        </div>
    );
}

export default Games;
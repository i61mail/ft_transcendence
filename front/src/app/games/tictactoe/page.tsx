"use client"

import useglobalStore from "@/store/globalStore";
import { startGame } from "@/lib/tic-tac-toe/game";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const TicTacToeGame = () =>
{
    const manager = useglobalStore();
    const [start, setStart] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const conditionT = useRef<boolean>(false);
    const initialDataRef = useRef<string | null>(null);
    const router = useRouter();

    useEffect(() =>
    {
        if (conditionT.current) return;
        conditionT.current = true;

        const socket = new WebSocket("ws://localhost:4000/sockets/games");
        socketRef.current = socket;

        socket.onopen = () => 
        {
            const data =
            {
                gameType: "tictactoe",
                id: manager.user?.id,
                username: manager.user?.username
            };
            socket.send(JSON.stringify(data));
            socket.onmessage = (msg) =>
            {
                if (initialDataRef.current === null)
                {
                    initialDataRef.current = msg.data;
                    setStart(true);
                }
            };
        };

        return () => 
        {
            conditionT.current = false;
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
                socket.close();
            socketRef.current = null;
        };
    }, []);

    useEffect(() =>
    {
        if (start && canvasRef.current && socketRef.current && initialDataRef.current) {
            const handleFinished = () => 
            {
                if (socketRef.current)
                {
                    socketRef.current.close();
                    router.push('/games');
                }
            };
            startGame(canvasRef.current, socketRef.current, initialDataRef.current, handleFinished);
            initialDataRef.current = null;
        }
    }, [start]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#c8d5e8] via-[#bcc3d4] to-[#a8b0c5]">
            <Header user={manager.user} />
            {!start ? (
                <div className="min-h-[calc(100vh-80px)] w-screen relative flex items-center justify-center">
                    {/* Animated Background Elements */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-blob top-0 -left-20"></div>
                        <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-blob animation-delay-2000 top-0 right-0"></div>
                        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
                    </div>

                    {/* Queue Container */}
                    <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
                        <div className="backdrop-blur-xl bg-white/20 rounded-3xl p-12 shadow-2xl border-2 border-white/40">
                            {/* Animated Loading Circle */}
                            <div className="mb-8 flex justify-center">
                                <div className="relative w-32 h-32">
                                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#10b981] border-r-[#14b8a6] animate-spin"></div>
                                    <div className="absolute inset-4 rounded-full border-4 border-transparent border-b-[#06b6d4] border-l-[#10b981] animate-spin" style={{ animationDirection: 'reverse' }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="font-pixelify text-4xl">⭕❌</span>
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="font-pixelify text-5xl font-bold text-[#2d5a8a] mb-6">
                                Finding Match
                            </h1>

                            {/* Waiting Message */}
                            <p className="font-pixelify text-2xl text-[#2d5a8a] mb-8">
                                Waiting for opponent...
                            </p>

                            {/* Animated Dots */}
                            <div className="flex justify-center gap-2 mb-8">
                                <div className="w-3 h-3 bg-[#10b981] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-3 h-3 bg-[#14b8a6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-3 h-3 bg-[#06b6d4] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>

                            {/* Status Text */}
                            <p className="font-pixelify text-sm text-[#2d5a8a]/70 mb-8">
                                Please stay on this page while we find you a match
                            </p>

                            {/* Cancel Button */}
                            <button
                                onClick={() => router.push('/games')}
                                className="px-8 py-3 bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-pixelify font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Tips Section */}
                        <div className="mt-8 backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl border-2 border-white/40">
                            <h3 className="font-pixelify text-2xl font-bold text-[#2d5a8a] mb-4">Tic Tac Toe Tips</h3>
                            <ul className="font-pixelify text-sm text-[#2d5a8a]/80 space-y-2 text-left">
                                <li>✓ Get three in a row to win</li>
                                <li>✓ Block your opponent's moves</li>
                                <li>✓ Control the center for an advantage</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-8">
                    <div className="backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl border-2 border-white/40">
                        <canvas 
                            ref={canvasRef} 
                            className="rounded-2xl shadow-lg"
                        >
                            If you see this message, the canvas did not load properly
                        </canvas>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TicTacToeGame;
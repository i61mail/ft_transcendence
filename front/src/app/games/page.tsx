'use client'

import useglobalStore from "@/store/globalStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";


const Games = () =>
{
    const manager = useglobalStore();
    const gameSocketRef = useRef<WebSocket | null>(null);
    useEffect(() =>
    {
        if (gameSocketRef.current !== null)
        {
            return ;
        }
        if (manager.gameSocket)
        {
            manager.gameSocket.close();
            manager.updateGameSocket(null);
        }
        console.log("creating game socket....");

        gameSocketRef.current = new WebSocket("ws://localhost:4000/sockets/games");
        
        gameSocketRef.current.onopen = () =>
        {
            const init = {gameType: "init"};
            gameSocketRef.current?.send(JSON.stringify(init));
            manager.updateGameSocket(gameSocketRef.current);
        }

        gameSocketRef.current.onclose = () =>
        {
            console.log("closing game socket...");
            gameSocketRef.current?.close();
        }

        gameSocketRef.current.onmessage = (msg) =>
        {
            const data = JSON.parse(msg.data.toString());
            console.log("GAME: ", data);
        }

    }, [manager.gameSocket]);

    const router = useRouter();
    return (
        <>
            <div className="h-screen w-screen flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-white/5 backdrop-blur-md rounded-xl shadow-lg p-6">
                    <h1 className="text-2xl font-semibold mb-1">Games</h1>
                    <p className="text-sm text-gray-300 mb-6">
                        Choose a mode. The first three options are for Pong.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <button
                            aria-label="Pong Local"
                            onClick={() => router.push('/games/local')}
                            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                        >
                            Pong — Local
                        </button>

                        <button
                            aria-label="Pong Online"
                            onClick={() => router.push('/games/online')}
                            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                        >
                            Pong — Online
                        </button>

                        <div className="w-full grid grid-cols-3 gap-2">
                            <button
                                aria-label="Pong vs AI Easy"
                                onClick={() => router.push('/games/ai?diff=easy')}
                                className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium"
                            >
                                Pong — AI (Easy)
                            </button>

                            <button
                                aria-label="Pong vs AI Normal"
                                onClick={() => router.push('/games/ai?diff=meduim')}
                                className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                            >
                                Pong — AI (Meduim)
                            </button>

                            <button
                                aria-label="Pong vs AI Hard"
                                onClick={() => router.push('/games/ai?diff=hard')}
                                className="w-full px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-medium"
                            >
                                Pong — AI (Hard)
                            </button>
                        </div>

                        <button
                            aria-label="Start Pong Tournament"
                            onClick={() => router.push('/games/tournament')}
                            className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
                        >
                            Start Pong Tournament
                        </button>

                        <button
                            aria-label="TicTacToe Online"
                            onClick={() => router.push('/games/tictactoe')}
                            className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium"
                        >
                            TicTacToe — Online
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <label htmlFor="tournament-code" className="sr-only">Tournament code</label>
                        <div className="flex items-center w-full gap-2">
                            <input
                                id="tournament-code"
                                placeholder="Enter Tournament code"
                                maxLength={6}
                                className="flex-1 px-3 py-2 border rounded bg-transparent text-sm placeholder-gray-400 uppercase"
                                autoComplete="off"
                                inputMode="text"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const input = document.getElementById('tournament-code') as HTMLInputElement | null;
                                        const code = (input?.value ?? '').trim().toUpperCase();
                                        if (!code || code.length !== 6) return;
                                        router.push(`/games/tournament?code=${encodeURIComponent(code)}`);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                aria-label="Paste code"
                                onClick={async () => {
                                    try {
                                        const text = await navigator.clipboard.readText();
                                        const val = text.trim().slice(0, 6).toUpperCase();
                                        const input = document.getElementById('tournament-code') as HTMLInputElement | null;
                                        if (input) {
                                            input.value = val;
                                            input.focus();
                                        }
                                    } catch {
                                        // silent fallback: try prompting if clipboard API not available
                                        try {
                                            const fallback = window.prompt('Paste tournament code:');
                                            if (!fallback) return;
                                            const val = fallback.trim().slice(0, 6).toUpperCase();
                                            const input = document.getElementById('tournament-code') as HTMLInputElement | null;
                                            if (input) input.value = val;
                                        } catch {
                                            // ignore
                                        }
                                    }
                                }}
                                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                            >
                                Paste
                            </button>
                            <button
                                onClick={() => {
                                    const input = document.getElementById('tournament-code') as HTMLInputElement | null;
                                    const code = (input?.value ?? '').trim().toUpperCase();
                                    if (!code || code.length !== 6) return;
                                    router.push(`/games/tournament?code=${encodeURIComponent(code)}`);
                                }}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                            >
                                Join Tournament
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Games;
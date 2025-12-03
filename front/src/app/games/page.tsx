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
            <div className="h-screen w-screen flex items-center justify-center gap-x-10 ">
                <div onClick={()=>{
                    router.push('/games/local');
                }} className="size-40 bg-green-300 text-[20px] flex items-center justify-center">Local</div>
                <div onClick={() =>
                    {
                        router.push('/games/online')
                    }
                } className="size-40 bg-green-300 text-[20px] flex items-center justify-center">Online</div>
                <div onClick={() =>
                    {

                        router.push('/tournament')
                    }
                } className="size-40 bg-green-300 text-[20px] flex items-center justify-center">Start Tournament</div>
                <div className="flex items-center gap-x-4">
                    <input id="tournament-code" placeholder="Enter tournament code" className="px-3 py-2 border rounded" />
                    <button
                        onClick={() => {
                            const input = document.getElementById('tournament-code') as HTMLInputElement | null;
                            const code = input?.value.trim() ?? '';
                            if (!code) return;
                            router.push(`/tournament?code=${encodeURIComponent(code)}`);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Join Tournament
                    </button>
                </div>
            </div>
        </>
    )
}

export default Games;
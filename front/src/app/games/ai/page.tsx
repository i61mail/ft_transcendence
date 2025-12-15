'use client'

import useglobalStore from "@/store/globalStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { startGame } from "@/lib/pong/game";
import GameCanvas from "@/components/GameCanvas";
import { getWsUrl } from "@/lib/api";

const AIGameContent = () =>
{
    const manager = useglobalStore();
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const conditionT = useRef<boolean>(false);
    const params = useSearchParams();
    const difficulty: string | null = params.get('diff');

    useEffect(() =>
    {
        if (!manager.user?.id) return;
        if (difficulty != 'easy' && difficulty != 'meduim' && difficulty != 'hard')
        {
            router.push('/games');
            return;
        }
        if (conditionT.current) return;
        conditionT.current = true;

        const socket = new WebSocket(`${getWsUrl()}/sockets/games`);
        socketRef.current = socket;

        const handleFinished = () =>
        {
            if (socketRef.current)
            {
                socketRef.current.close();
                router.push('/games');
            }
        };

        socket.onopen = () =>
        {
            const data =
            {
                gameType: "ai",
                id: manager.user?.id,
                username: manager.user?.username,
                difficulty: difficulty
            };
            socket.send(JSON.stringify(data));
            socket.onmessage = (msg) =>
            {
                if (canvasRef.current && socket)
                    startGame(canvasRef.current, socket, msg.data.toString(), handleFinished);
            };
        };

        return () =>
        {
            conditionT.current = false;
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
                socket.close();
            socketRef.current = null;
        };
    }, [manager.user]);


    return (
    <>
        <GameCanvas canvasRef={canvasRef} width={800} height={600} />
    </>
);
}

const AIGame = () =>
    {
    return (
        <Suspense fallback={<div className="min-h-screen w-screen bg-gradient-to-br from-[#c8d5e8] via-[#bcc3d4] to-[#a8b0c5] flex items-center justify-center">
            <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>}>
            <AIGameContent />
        </Suspense>
    );
}

export default AIGame;
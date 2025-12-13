"use client"

import useglobalStore from "@/store/globalStore";
import { startGame } from "@/lib/pong/game";
import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GameCanvas from "@/components/GameCanvas";



const InviteGameContent = () =>
{
    const manager = useglobalStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();
    const params = useSearchParams();
    const code: string | null = params.get('code');
    const inited = useRef<boolean>(false);

    const handleFinished = (socket?: WebSocket) =>
    {
        if (socket)
            socket.close();
        router.push('/games');
    };

    useEffect(() =>
    {
        if (inited.current) return;
        inited.current = true;

        if (!code) {
            router.push('/chats');
            return;
        }

        manager.setInvite(null);
        console.log("create socket for invite game");
        const socket = new WebSocket("ws://localhost:4000/sockets/games");

        socket.onclose = () => {
            console.log("invite game socket closed");
        };

        socket.onopen = () => {
            console.log("starting invite game...", socket.readyState);
            const data = { gameType: "invite", id: manager.user?.id, username: manager.user?.username, code: code };
            socket.send(JSON.stringify(data));
            socket.onmessage = (msg) => {
                if (canvasRef.current && socket)
                {
                    console.log("started invite game");
                    startGame(canvasRef.current, socket, msg.data.toString(), () => handleFinished(socket));
                }
            };
        };

        return () => {
            inited.current = false;
            if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
                console.log("Closing invite socket on page leave...");
                socket.close();
            }
        };
    }, []);

    return (
        <>
            <GameCanvas canvasRef={canvasRef} width={800} height={600} />
        </>
    )
}

const InviteGame = () => {
    return (
        <Suspense fallback={<div className="min-h-screen w-screen bg-gradient-to-br from-[#c8d5e8] via-[#bcc3d4] to-[#a8b0c5] flex items-center justify-center">
            <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>}>
            <InviteGameContent />
        </Suspense>
    );
}

export default InviteGame;
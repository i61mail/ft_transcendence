'use client'

import useglobalStore from "@/store/globalStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { startGame } from "@/lib/pong/game";
import GameCanvas from "@/components/GameCanvas";

const AIGame = () =>
{
    const manager = useglobalStore();
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const conditionT = useRef<boolean>(false);
    const params = useSearchParams();
    const difficulty: string | null = params.get('diff');

    useEffect(() => {
        if (difficulty != 'easy' && difficulty != 'meduim' && difficulty != 'hard') {
            router.push('/games');
            return;
        }
        if (conditionT.current) return;
        conditionT.current = true;

        console.log("create socket")
        const socket = new WebSocket("ws://localhost:4000/sockets/games");
        socketRef.current = socket;

        const handleFinished = () => {
            if (socketRef.current) {
                socketRef.current.close();
                if (typeof window === 'undefined' || window.location.pathname !== '/games/ai') {
                    return;
                }
                router.push('/games');
            }
        };

        socket.onclose = () => {
            console.log("game socket closed!!!");
        };

        socket.onopen = () => {
            console.log("starting game...", socket.readyState);
            const data = {
                gameType: "ai",
                id: manager.user?.id,
                username: manager.user?.username,
                difficulty: difficulty
            };
            socket.send(JSON.stringify(data));
            socket.onmessage = (msg) => {
                if (canvasRef.current && socket)
                    startGame(canvasRef.current, socket, msg.data.toString(), handleFinished);
            };
        };

        return () => {
            conditionT.current = false;
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                console.log("Closing socket on page leave...");
                socket.close();
            }
            socketRef.current = null;
        };
    }, []);


    return (
    <>
        <GameCanvas canvasRef={canvasRef} width={800} height={600} />
    </>
);
}

export default AIGame;
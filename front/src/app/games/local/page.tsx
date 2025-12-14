'use client'

import useglobalStore from "@/store/globalStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { startGame } from "@/lib/pong/game";
import GameCanvas from "@/components/GameCanvas";

const LocalGame = () =>
{
    const manager = useglobalStore();
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const conditionT = useRef<boolean>(false);

    useEffect(() =>
    {
        if (conditionT.current) return;
        conditionT.current = true;

        const socket = new WebSocket("wss://10.13.10.12:8080/api/sockets/games");

        const handleFinished = () =>
        {
            socket.close();
            router.push('/games');
        };

        socket.onopen = () =>
        {
            const data =
            {
                gameType: "local",
                id: manager.user?.id,
                username: manager.user?.username
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
        };
    }, []);

    return (
        <GameCanvas canvasRef={canvasRef} width={800} height={600} />
    );
}

export default LocalGame;
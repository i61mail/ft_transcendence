"use client"

import useglobalStore from "@/store/globalStore";
import { startGame } from "@/lib/pong/game";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import GameCanvas from "@/components/GameCanvas";

const TournamentPlayGame = () =>
{
    const manager = useglobalStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const initializedRef = useRef<boolean>(false);
    const router = useRouter();

    useEffect(() =>
    {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const socket = new WebSocket("wss://10.13.10.12:8080/api/sockets/games");

        const handleFinished = () =>
        {
            socket.close();
            router.push('/games/tournament');
        };

        socket.onopen = () =>
        {
            const data =
            {
                gameType: "playTournament",
                id: manager.user?.id,
                username: manager.user?.username
            };
            socket.send(JSON.stringify(data));

            socket.onmessage = (msg) =>
            {
                const parsed = JSON.parse(msg.data);
                if (parsed.gm === undefined)
                    return;
                if (canvasRef.current && socket)
                    startGame(canvasRef.current, socket, msg.data, handleFinished);
            };
        };
    }, []);

    return (
        <>
            <GameCanvas canvasRef={canvasRef} width={800} height={600} />
        </>
    )
}

export default TournamentPlayGame;

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
        // Prevent double initialization in Strict Mode
        if (initializedRef.current) return;
        initializedRef.current = true;

        console.log("Creating socket for tournament play");
        const socket = new WebSocket("ws://localhost:4000/sockets/games");

        const handleFinished = () =>
        {
            socket.close();
            router.push('/games/tournament');
        };

        socket.onclose = () =>
        {
            console.log("tournament game socket closed!!!");
        };

        socket.onopen = () =>
        {
            console.log("starting tournament play...", socket.readyState);
            const data = { gameType: "playTournament", id: manager.user?.id, username: manager.user?.username };
            socket.send(JSON.stringify(data));

            socket.onmessage = (msg) =>
            {
                console.log("game received: ", msg.data);
                const parsed = JSON.parse(msg.data);
                if (parsed.gm === undefined)
                    return;
                if (canvasRef.current && socket)
                    startGame(canvasRef.current, socket, msg.data, handleFinished);
            };
        };

        // No cleanup to avoid Strict Mode closing the socket
    }, []);

    return (
        <>
            <GameCanvas canvasRef={canvasRef} width={800} height={600} />
        </>
    )
}

export default TournamentPlayGame;

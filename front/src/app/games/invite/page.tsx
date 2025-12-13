"use client"

import useglobalStore from "@/store/globalStore";
import { startGame } from "@/lib/pong/game";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GameCanvas from "@/components/GameCanvas";



const OnlineGame = () =>
{
    const manager = useglobalStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();
    const params = useSearchParams();
    const code: string | null = params.get('code');
    const invited = useRef<boolean>(false);
    const codeRef = useRef<string>("");

    const handleFinished = (socket?: WebSocket) =>
    {
        if (socket)
            socket.close();
        router.push('/games');
    };

 

    useEffect(() =>
    {
        
        if (!code) {
            router.push('/dashboard');
            return;
        }

        if (invited.current && codeRef.current === code) return;
        invited.current = true;

        codeRef.current = code;

        async function verifyInviteGame() {
        try
            {
            const check = await fetch(`http://localhost:4000/invite?code=${code}`);
            if (!check.ok)
            {
                router.push('/dashboard');
            }
            }
            catch (err)
            {
                console.log(err);
            }
        }
        verifyInviteGame();
        manager.setInvite(null);
        // console.log("create socket for invite game");
        const socket = new WebSocket("ws://localhost:4000/sockets/games");

        socket.onclose = () => {
            console.log("invite game socket closed");
        };

        socket.onopen = () => {
            // console.log("starting invite game...", socket.readyState);
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
            invited.current = false;
            if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
                // console.log("Closing invite socket on page leave...");
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

export default OnlineGame;
"use client"

import useglobalStore from "@/store/globalStore";
import { startGame } from "@/lib/tic-tac-toe/game";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const TicTacToeGame = () =>
{
    const manager = useglobalStore();
    const [start, setStart] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const conditionT = useRef<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        if (conditionT.current) return;
        conditionT.current = true;

        console.log("create socket")
        const socket = new WebSocket("ws://localhost:4000/sockets/games");
        socketRef.current = socket;

        const handleFinished = () => {
            if (socketRef.current) {
                socketRef.current.close();
                if (typeof window === 'undefined' || window.location.pathname !== '/games/tictactoe') {
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
            const data = { gameType: "tictactoe", id: manager.user?.id, username: manager.user?.username };
            socket.send(JSON.stringify(data));
            socket.onmessage = (msg) => {
                setStart(true);
                if (canvasRef.current && socket) {
                    console.log("start tic tac toe");
                    startGame(canvasRef.current, socket, msg.data, handleFinished);
                }
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
            {/* {!start && <div>Loading...</div>} */}
            {<canvas ref={canvasRef} width={800} height={600}>
            if you see this message, than the canvas did not load propraly
        </canvas>}
        </>
    )
}

export default TicTacToeGame;
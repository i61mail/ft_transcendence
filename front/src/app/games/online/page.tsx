"use client"

import useglobalStore from "@/store/globalStore";
import { startGame } from "@/lib/pong/game";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const OnlineGame = () =>
{
    const manager = useglobalStore();
    const [start, setStart] = useState(false);
    const sentRef = useRef<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();

    useEffect(() =>
    {
        if (!manager.gameSocket)
            router.push("/games");
        if (manager.gameSocket && !sentRef.current)
        {
            console.log("starting online game...");
            const data = {gameType: "online", data: {player: {id: manager.user?.id}}};
            manager.gameSocket.send(JSON.stringify(data));
            sentRef.current = true;
            manager.gameSocket.onmessage = (msg) => 
            {
                console.log("starting online", msg.data);
                setStart(true);
                if (canvasRef.current && manager.gameSocket)
                {
                    console.log("start")
                    startGame(canvasRef.current, manager.gameSocket, msg.data);
                }
            }
        }
    }, [])

    return (
        <>
            {<canvas ref={canvasRef} width={800} height={600}>
            if you see this message, than the canvas did not load propraly
        </canvas>}
        </>
    )
}

export default OnlineGame;
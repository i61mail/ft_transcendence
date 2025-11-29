"use client"

import useglobalStore from "@/context/GlobalStore"
import { startGame } from "@/lib/pong/game";
import { useEffect, useRef, useState } from "react";

const OnlineGame = () =>
{
    const manager = useglobalStore();
    const [start, setStart] = useState(false);
    const sentRef = useRef<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() =>
    {
        if (manager.gameSocket && !sentRef.current)
        {
            console.log("starting online game...");
            const data = {gameType: "online", data: {player: {id: manager.user?.id}}};
            manager.gameSocket.send(JSON.stringify(data));
            sentRef.current = true;
            manager.gameSocket.onmessage = (msg) => 
            {
                console.log(msg.data);
                setStart(true);
                if (canvasRef.current && manager.gameSocket)
                {
                    console.log("start")
                    startGame(canvasRef.current, manager.gameSocket, msg.data);
                }
            }
        }
    }, [manager.gameSocket])

    return (
        <>
            {/* {!start && <div>Loading...</div>} */}
            {<canvas ref={canvasRef} width={800} height={600}>
            if you see this message, than the canvas did not load propraly
        </canvas>}
        </>
    )
}

export default OnlineGame;
"use client"

import useglobalStore from "@/store/globalStore";
import { startGame } from "@/lib/pong/game";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import GameCanvas from "@/components/GameCanvas";



const OnlineGame = () =>
{
    const manager = useglobalStore();
    const [start, setStart] = useState(false);
    const sentRef = useRef<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter(); 

    
    const handleFinished = () =>
    {
        if (manager.gameSocket)
        {
            router.push('/games/tournament');
        }
    };
    useEffect(() =>
    {
        if (manager.gameSocket && !sentRef.current)
        {
            sentRef.current = true;
            console.log("start");
            manager.gameSocket.onmessage = (msg) => 
            {
                console.log("bruhhhh");

                if (canvasRef.current && manager.gameSocket)
                {
                    startGame(canvasRef.current, manager.gameSocket, msg.data, handleFinished);
                }
            }
        }
    }, [manager.gameSocket])

    return (
        <>
            {/* {!start && <div>Loading...</div>} */}
            <GameCanvas canvasRef={canvasRef} width={800} height={600} />
        </>
    )
}

export default OnlineGame;
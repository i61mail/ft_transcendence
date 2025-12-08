"use client"

import useglobalStore from "@/store/globalStore";
import { startGame } from "@/lib/tic-tac-toe/game";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";



const TicTacToeGame = () =>
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
            router.push('/games');
        }
    };
    useEffect(() =>
    {
        if (manager.gameSocket && !sentRef.current)
        {
            
            console.log("starting online game...");
            const data = {gameType: "tictactoe", id: manager.user?.id, username: manager.user?.username};
            manager.gameSocket.send(JSON.stringify(data));
            sentRef.current = true;
            manager.gameSocket.onmessage = (msg) => 
            {
                setStart(true);
                if (canvasRef.current && manager.gameSocket)
                {
                    console.log("start tic tac toe");
                    startGame(canvasRef.current, manager.gameSocket, msg.data, handleFinished);
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

export default TicTacToeGame;
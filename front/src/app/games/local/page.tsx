'use client'

import useglobalStore from "@/store/globalStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { startGame } from "@/lib/pong/game";

let hh = 0;

const LocalGame = () =>
{

    const manager = useglobalStore();
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const conditionT = useRef<boolean>(false);

    useEffect(()=>
    {
        if (conditionT.current)
            return ;
        if (manager.gameSocket)
        {
            console.log("starting game...");
            const data = {gameType: "local", data: {player: {id: manager.user?.id}}};
            manager.gameSocket.send(JSON.stringify(data));
            conditionT.current = true;
            manager.gameSocket.onmessage = (msg) =>
            {
                if (canvasRef.current)
                    startGame(canvasRef.current, manager.gameSocket!, msg.data.toString());
            }
        }else
            router.push("/games");
    }, [manager.socket])

    return (
    <>
        <canvas ref={canvasRef} width={800} height={600}>
            if you see this message, than the canvas did not load propraly
        </canvas>

    </>
);
}

export default LocalGame;
'use client'

import useglobalStore from "@/store/globalStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { startGame } from "@/lib/pong/game";
import GameCanvas from "@/components/GameCanvas";

let hh = 0;

const AIGame = () =>
{

    const manager = useglobalStore();
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const conditionT = useRef<boolean>(false);
    const params = useSearchParams();
    const difficulty: string | null = params.get('diff');
    
    const handleFinished = () =>
    {
        if (manager.gameSocket)
        {
            router.push('/games');
        }
    };
    useEffect(()=>
    {
        if (difficulty != 'easy' && difficulty != 'meduim' && difficulty != 'hard')
            router.push('/games');
        if (conditionT.current)
            return ;
        if (manager.gameSocket)
        {
            console.log("starting game...");
            const data =
            {
                gameType: "ai",
                id: manager.user?.id,
                username: manager.user?.username,
                difficulty: difficulty
            };
            manager.gameSocket.send(JSON.stringify(data));
            conditionT.current = true;
            manager.gameSocket.onmessage = (msg) =>
            {
                if (canvasRef.current)
                    startGame(canvasRef.current, manager.gameSocket!, msg.data.toString(), handleFinished);
            }
        }else
            router.push("/games");
    }, [manager.socket])

    return (
    <>
        <GameCanvas canvasRef={canvasRef} width={800} height={600} />
    </>
);
}

export default AIGame;
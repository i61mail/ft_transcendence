'use client'
import useglobalStore from "@/context/GlobalStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";


const LocalGame = () =>
{
    const manager = useglobalStore();
    const router = useRouter();

    useEffect(()=>
    {
        if (manager.gameSocket)
        {
            console.log("starting game...");
            const data = {gameType: "local", data: {player: {id: manager.user?.id}}};
            manager.gameSocket.send(JSON.stringify(data));
            manager.gameSocket.onmessage = (msg) =>
            {
                const packet = JSON.parse(msg.data.toString());
                console.log("received local: ", packet);
            }
        }
    }, [manager.gameSocket])

    return (
    <>
            <div className="h-screen w-screen flex items-center justify-center gap-x-10 ">
                <div onClick={()=>{
                    const data = {gameType: "local", data: {gameType: "local", player: {id: "1"}}};
                    manager.gameSocket?.send(JSON.stringify(data));
                }} className="size-40 bg-green-300 text-[20px] flex items-center justify-center">player1</div>
                <div onClick={()=>{
                    const data = {gameType: "local", data: {gameType: "local", player: {id: "2"}}};
                    manager.gameSocket?.send(JSON.stringify(data));
                }}className="size-40 bg-green-300 text-[20px] flex items-center justify-center">player2</div>
            </div>
        </>
);
}

export default LocalGame;
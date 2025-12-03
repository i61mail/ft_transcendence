'use client'

import useglobalStore from "@/store/globalStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";


const Games = () =>
{
    const manager = useglobalStore();

    useEffect(() =>
    {
        if (manager.gameSocket)
        {
            manager.gameSocket.close();
            manager.updateGameSocket(null);
        }
    }, []);

    const router = useRouter();
    return (
        <>
            <div className="h-screen w-screen flex items-center justify-center gap-x-10 ">
                <div onClick={()=>{
                    router.push('/games/local');
                }} className="size-40 bg-green-300 text-[20px] flex items-center justify-center">Local</div>
                <div onClick={() =>
                    {
                        router.push('/games/online')
                    }
                } className="size-40 bg-green-300 text-[20px] flex items-center justify-center">Online</div>
                <div onClick={() =>
                    {
                        router.push('/games/tournament')
                    }
                } className="size-40 bg-green-300 text-[20px] flex items-center justify-center">Tournament</div>
            </div>
        </>
    )
}

export default Games;
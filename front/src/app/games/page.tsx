'use client'

import useglobalStore from "@/store/globalStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";

const Games = () =>
{
    const manager = useglobalStore();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() =>
    {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));
        
        if (manager.gameSocket)
        {
            manager.gameSocket.close();
            manager.updateGameSocket(null);
        }
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white font-pixelify text-2xl">Loading...</p>
            </div>
        );
    }

    return (
        <>
            <Header user={user} onUserUpdate={setUser} activeRoute="game" />
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-[#bcc3d4]">
                <div className="mb-12 text-center">
                    <h1 className="font-pixelify text-5xl font-bold text-[#2d5a8a] mb-2">
                        SELECT GAME MODE
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-6">
                    {/* Local Mode */}
                    <div 
                        onClick={() => {
                            router.push('/games/local');
                        }}
                        className="bg-[#a8b0c5] rounded-3xl p-8 cursor-pointer hover:bg-[#92A0BD] transition-colors duration-200 border-2 border-[#8aabd6] shadow-md"
                    >
                        <div className="flex flex-col items-center justify-center h-56">
                            <h2 className="font-pixelify text-4xl font-bold text-[#1a237e]">LOCAL</h2>
                        </div>
                    </div>

                    {/* Online Mode */}
                    <div 
                        onClick={() => {
                            router.push('/games/online');
                        }}
                        className="bg-[#a8b0c5] rounded-3xl p-8 cursor-pointer hover:bg-[#92A0BD] transition-colors duration-200 border-2 border-[#8aabd6] shadow-md"
                    >
                        <div className="flex flex-col items-center justify-center h-56">
                            <h2 className="font-pixelify text-4xl font-bold text-[#1a237e]">ONLINE</h2>
                        </div>
                    </div>
                </div>

                {/* Tournament Section */}
                <div className="w-full max-w-4xl">
                    <div 
                        onClick={() => {
                            router.push('/games/tournament');
                        }}
                        className="bg-[#a8b0c5] rounded-3xl p-8 cursor-pointer hover:bg-[#92A0BD] transition-colors duration-200 border-2 border-[#8aabd6] shadow-md"
                    >
                        <div className="flex items-center justify-center">
                            <h2 className="font-pixelify text-4xl font-bold text-[#1a237e]">TOURNAMENT</h2>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Games;
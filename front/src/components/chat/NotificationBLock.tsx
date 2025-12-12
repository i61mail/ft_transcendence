'use client'

import useglobalStore from "@/store/globalStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NotificationBLock = () =>
{
    const manager = useglobalStore();
    const [condition, setCondition] = useState(false);
    const router = useRouter();
    useEffect(()=>
    {
        console.log("checking state of", manager.tournamentNotification);
        if (manager.tournamentNotification)
        {
            setCondition(true);
            if (window.location.pathname != "/tournament")
            {
                console.log("redirecting to game...");
                setTimeout(()=>router.push("/games/tournament"), 1000);
            }
        }
        else
            setCondition(false);
    }, [manager.tournamentNotification])


    return (
     condition && <>
        <div className="fixed inset-0 bg-sky-100/90 flex items-center justify-center z-50">
            <div className="bg-gray-600 text-white text-center p-6 rounded-lg max-w-sm w-full mx-4 shadow-2xl border border-gray-700 flex flex-col items-center gap-4">
                <p className="text-lg">Tournament game starts now, you will be redirected soon</p>
                <span className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></span>
            </div>
        </div>
     </>
    )
}

export default NotificationBLock;
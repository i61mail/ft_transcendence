"use client"


import useglobalStore from "@/context/GlobalStore"
import { useEffect, useRef, useState } from "react";

const Tournament = () =>
{
    const manager = useglobalStore();
    const [start, setStart] = useState(false);
    const sentRef = useRef<boolean>(false);

    useEffect(() =>
    {
        if (manager.gameSocket && !sentRef.current)
        {
            console.log("starting tournament...");
            const data = {gameType: "tournament", data: {player: {id: manager.user?.id}}};
            manager.gameSocket.send(JSON.stringify(data));
            sentRef.current = true;
            manager.gameSocket.onmessage = (msg) =>
            {
                const state = JSON.parse(msg.data.toString());
                console.log("received tournament: ", state);
                setStart(true);
            }
        }
    }, [manager.gameSocket])

    return (
        <>
            {!start && <div>Waiting for others...</div>}
            {start && <div>tournament begins</div>}
        </>
    )
}

export default Tournament;
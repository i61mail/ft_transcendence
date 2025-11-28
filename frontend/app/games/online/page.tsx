"use client"

import useglobalStore from "@/context/GlobalStore"
import { useEffect, useRef, useState } from "react";

const OnlineGame = () =>
{
    const manager = useglobalStore();
    const [start, setStart] = useState(false);
    const sentRef = useRef<boolean>(false);

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
                const state = JSON.parse(msg.data.toString());
                console.log("received online: ", state);
                setStart(true);
            }
        }
    }, [manager.gameSocket])

    return (
        <>
            {!start && <div>Loading...</div>}
            {start && <div>game begins</div>}
        </>
    )
}

export default OnlineGame;
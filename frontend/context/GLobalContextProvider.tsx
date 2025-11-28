"use client"

import {useRef, createContext, useEffect, useContext} from 'react'
import { useAuth } from './AuthProvider';

interface GlobalContextProp
{
    socket:  WebSocket | null,
}


const GlobalContex = createContext<GlobalContextProp | undefined>(undefined)


export const GlobalContexProvider = ({ children }: {children: React.ReactNode}) =>
{
    const socket = useRef<WebSocket | null>(null);
    const auth = useAuth();

    useEffect(()=>
        {
            if (socket.current)
                return ;
            socket.current = new WebSocket("ws://localhost:4000/sockets");
            
            socket.current.onopen = () =>
            {
                const handshake = {type: "handshake", id: auth.user?.id};
                if (socket.current?.readyState === WebSocket.OPEN)
                    socket.current.send(JSON.stringify(handshake));
            }

            socket.current.onmessage = (msg) =>
            {
                console.log("received new data!!");
            }

            return () => {
                socket.current?.close();
            }
        }
    )
    return (
        <GlobalContex.Provider value={{socket: socket.current}}>
            {children}
        </GlobalContex.Provider>
    )
}


export const useGlobalContext = () =>
{
    const context = useContext(GlobalContex);
    if (!context)
        throw new Error("wrong use of global context!");
    return (context);
}
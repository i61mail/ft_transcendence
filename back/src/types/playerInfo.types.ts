import type { WebSocket } from "ws";

export interface playerInfo
{
    id: number;
    socket: WebSocket;
    username: string;
}
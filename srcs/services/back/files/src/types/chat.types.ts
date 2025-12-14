import { WebSocket } from 'ws';

export interface Chat {
    receiver: string;
    sender: string;
}

export interface ChatConnection {
    socket: WebSocket;
    userId: string;
}

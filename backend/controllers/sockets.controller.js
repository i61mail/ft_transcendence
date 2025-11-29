import { WebSocket } from "ws";
import Fastify from "fastify";
import { pongLocal, pongOnline } from "../plugins/pong/gameLogic.js";
import { GameMode } from "../plugins/pong/interfaces.js";
const chatMessageHandler = (socket, request) => {
    const server = request.server;
    socket.on('open', () => {
        console.log("new socket connection...");
    });
    socket.on('close', () => {
        console.log('client closed connection', server.chatConnections.get(socket), server.chatConnections.size);
        server.chatConnections.delete(socket);
    });
    socket.onmessage = (msg) => {
        const { content, type } = JSON.parse(msg.data.toString());
        if (type === "auth") {
            server.chatConnections.set(socket, content);
            console.log("new user", server.chatConnections.get(socket), server.chatConnections.size);
        }
        if (type === "message") {
            console.log("new message", server.chatConnections.get(socket), server.chatConnections.size);
            socket.send(`${JSON.stringify(content)}`);
            server.chatConnections.forEach((user, sock) => {
                if (user == content.friendship_id) {
                    console.log("sending to ", sock.url);
                    sock.send(`${JSON.stringify(content)}`);
                }
            });
            // server.chatPreviewNotifications.forEach((chat, sock) =>
            // {
            //     server.log.info(`checking for ${chat.receiver}`)
            //     if (chat.receiver === content.receiver && chat.sender === content.sender || 
            //         chat.receiver === content.sender && chat.sender === content.receiver
            //     )
            //     {
            //         let reply = {type: "notification", message: content.content};
            //         sock.send(JSON.stringify(reply));
            //     }
            // })
        }
    };
};
export const messageNotification = async (socket, request) => {
    {
        const server = request.server;
        socket.on('close', () => {
            console.log("deleting notification", server.chatPreviewNotifications.get(socket));
            server.chatPreviewNotifications.delete(socket);
        });
        socket.onmessage = (msg) => {
            const { type, sender, receiver, message } = JSON.parse(msg.data.toString());
            if (type === "registration") {
                const newChatPreview = { receiver: receiver, sender: sender };
                server.chatPreviewNotifications.set(socket, newChatPreview);
                console.log("new chat preview ", server.chatPreviewNotifications.get(socket));
            }
            if (type === "notification") {
                socket.send(JSON.stringify(message));
            }
        };
    }
};
export const createGlobalSocket = async (socket, request) => {
    const server = request.server;
    socket.on('close', () => {
        console.log("closed global connection");
        server.globalSockets.delete(socket);
    });
    socket.onmessage = (msg) => {
        const { type, content } = JSON.parse(msg.data.toString());
        console.log("received", type, content);
        if (type == "handshake") {
            console.log("creating new global socket for", content);
            server.globalSockets.set(socket, content);
        }
        else if (type === "message") {
            console.log("new message", server.globalSockets.get(socket), server.globalSockets.size);
            socket.send(`${JSON.stringify(content)}`);
            server.globalSockets.forEach((user, sock) => {
                console.log(user, content.friendship_id);
                if ((user === content.receiver || user === content.sender) && sock !== socket) {
                    console.log("sending to ", user);
                    sock.send(`${JSON.stringify(content)}`);
                }
            });
        }
    };
};
class Queue {
    items = [];
    offset = 0;
    enqueue(item) {
        this.items.push(item);
    }
    dequeue() {
        if (this.size() === 0)
            return undefined;
        const item = this.items[this.offset];
        this.offset++;
        if (this.offset * 2 >= this.items.length) {
            this.items = this.items.slice(this.offset);
            this.offset = 0;
        }
        return item;
    }
    peek() {
        return this.items[this.offset];
    }
    size() {
        return this.items.length - this.offset;
    }
    isEmpty() {
        return this.size() === 0;
    }
    contains(item) {
        const found = this.items.find(val => val.socket === item.socket);
        if (found)
            return (true);
        return (false);
    }
    remove(item) {
        this.items = this.items.filter(p => p !== item);
    }
}
const queue = new Queue;
const handleOnlineGame = async (socket, player) => {
    const p1 = { socket: socket, id: player };
    socket.onclose = () => {
        queue.remove(p1);
    };
    if (!queue.size()) {
        console.log("finding second player for", player, queue.size());
        queue.enqueue(p1);
    }
    else {
        console.log("starting online game now...", queue.size());
        const p2 = queue.dequeue();
        if (p1 && p2) {
            p1.socket.send(JSON.stringify({ gm: GameMode.online, playerIndex: 0 }));
            p2.socket.send(JSON.stringify({ gm: GameMode.online, playerIndex: 1 }));
            pongOnline(p1, p2);
        }
    }
};
const handleTournament = async (socket, player) => {
    const p = { socket: socket, id: player };
    if (queue.size() < 3) {
        console.log("waiting for other players to join...");
        queue.enqueue(p);
    }
    else {
        const p1 = queue.dequeue();
        const p2 = queue.dequeue();
        const p3 = queue.dequeue();
        const p4 = p;
        if (p1 && p2 && p3 && p4) {
            p1.socket.send(JSON.stringify({ state: "true" }));
            p2.socket.send(JSON.stringify({ state: "true" }));
            p3.socket.send(JSON.stringify({ state: "true" }));
            p4.socket.send(JSON.stringify({ state: "true" }));
        }
    }
};
let lists = [];
export const gameController = async (socket, request) => {
    const server = request.server;
    socket.onmessage = (msg) => {
        const { gameType, data } = JSON.parse(msg.data.toString());
        if (gameType === "init") {
            console.log("created new game socket...");
        }
        else if (gameType === "local") {
            console.log("local .... dsafd");
            socket.send(JSON.stringify({ gm: GameMode.local, plyI: 0 }));
            pongLocal({ id: data, socket: socket });
        }
        else if (gameType === "online")
            handleOnlineGame(socket, data);
        else if (gameType === "tournament")
            handleTournament(socket, data);
    };
    socket.onclose = () => {
        console.log("closed game socket....");
    };
};
export default chatMessageHandler;

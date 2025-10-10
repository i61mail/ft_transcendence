import { WebSocket } from "ws";
import Fastify from "fastify";
import type { Chat } from "types/chat.types.js";

const chatMessageHandler = (socket:WebSocket, request: Fastify.FastifyRequest) =>
{
    const server = request.server;

    socket.on('open', () =>
        {
        })
        socket.on('close', () =>
        {
            console.log('client closed connection', server.chatConnections.get(socket), server.chatConnections.size)
            server.chatConnections.delete(socket);
        })
        socket.onmessage = (msg) =>
        {
            const {content, type} = JSON.parse(msg.data.toString());
            if (type === "auth")
            {
                server.chatConnections.set(socket, content);
                console.log("new user", server.chatConnections.get(socket));
            }
            if (type === "message")
            {
                socket.send(`${JSON.stringify(content)}`);
                server.chatConnections.forEach((user, sock) => {
                    if (user === content.receiver)
                    {
                        sock.send(`${JSON.stringify(content)}`)
                    }
                });
                server.chatPreviewNotifications.forEach((chat, sock) =>
                {
                    server.log.info(`checking for ${chat.receiver}`)
                    if (chat.receiver === content.receiver && chat.sender === content.sender || 
                        chat.receiver === content.sender && chat.sender === content.receiver
                    )
                    {
                        let reply = {type: "notification", message: content.content};
                        sock.send(JSON.stringify(reply));
                    }
                })
            }
        }
}

export const messageNotification = async (socket: WebSocket, request: Fastify.FastifyRequest) =>
{
    {
        const server = request.server;
        socket.on('close', () =>
        {
            console.log("deleting notification", server.chatPreviewNotifications.get(socket));
            server.chatPreviewNotifications.delete(socket);
        })

        socket.onmessage = (msg) =>
        {
            const {type, sender, receiver, message} = JSON.parse(msg.data.toString());
            if (type === "registration")
            {
                const newChatPreview: Chat = {receiver: receiver, sender: sender}; 
                server.chatPreviewNotifications.set(socket, newChatPreview);
                console.log("new chat preview ", server.chatPreviewNotifications.get(socket));
            }
            if (type === "notification")
            {
                socket.send(JSON.stringify(message));
            }
        }
    }
}

export default chatMessageHandler;
import Fastify, { type FastifyInstance } from "fastify";
import fastifyOptions from "./plugins/fastify.plugin.js";
import fp from "fastify-plugin";
import cors from "@fastify/cors";
import corsOptions from "./plugins/cors.plugin.js";
import ws from '@fastify/websocket'
import { WebSocket } from "ws";
import dbConnector from "./plugins/database.plugin.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import socketRoutes from "./routes/socket.routes.js";
import type { Chat } from "types/chat.types.js";
import friendsRoutes from "./routes/friendship.routes.js";

const server: FastifyInstance = Fastify(fastifyOptions);

async function startServer()
{
    server.decorate("chatConnections", new Map<WebSocket, string>());
    server.decorate("chatPreviewNotifications", new Map<WebSocket, Chat>());
    server.decorate("globalSockets", new Map<WebSocket, number>());
    server.decorate("gameSockets", new Map<WebSocket, number>());
    await server.register(fp(dbConnector));
    await server.register(cors, corsOptions);
    await server.register(ws);
    await server.register(userRoutes);
    await server.register(messageRoutes);
    await server.register(socketRoutes);
    await server.register(friendsRoutes);

    server.listen({port:4000}, (err, address)=>
    {
        if (err)
            {
                server.log.error(err);
                process.exit(1);
            }
            server.log.info(`Server is listening on ${address}`);
    })
}

startServer();
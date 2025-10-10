import Fastify from "fastify";
import chatMessageHandler, { messageNotification } from "../controllers/sockets.controller.js";
import type { Chat } from "types/chat.types.js";


const socketRoutes = async (server: Fastify.FastifyInstance) =>
{
    server.get('/sockets/messages', {websocket: true}, chatMessageHandler);
    server.get('/sockets/notifications/chatPreview', {websocket: true}, messageNotification)
}

export default socketRoutes;
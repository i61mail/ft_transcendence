import Fastify from "fastify";
import chatMessageHandler, { messageNotification } from "../controllers/sockets.controller.js";
import { createGlobalSocket, gameController } from "../controllers/sockets.controller.js";
const socketRoutes = async (server) => {
    // server.get('/sockets/messages', {websocket: true}, chatMessageHandler);
    server.get('/sockets/notifications/chatPreview', { websocket: true }, messageNotification);
    server.get('/sockets', { websocket: true }, createGlobalSocket);
    server.get('/sockets/games', { websocket: true }, gameController);
};
export default socketRoutes;

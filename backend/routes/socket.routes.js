import Fastify from "fastify";
import chatMessageHandler, { messageNotification } from "../controllers/sockets.controller.js";
const socketRoutes = async (server) => {
    server.get('/sockets/messages', { websocket: true }, chatMessageHandler);
    server.get('/sockets/notifications/chatPreview', { websocket: true }, messageNotification);
};
export default socketRoutes;

import Fastify from "fastify";
import { postMessageHandler, getAllMessages, deleteAllMessages, getMessagesInFriendship } from "../controllers/message.controller.js";
import postMessageSchema from "../schemas/message.schemas.js";
const messageRoutes = async (server) => {
    server.get("/messages", getAllMessages);
    server.get("/messages/friendship/:id", getMessagesInFriendship);
    server.post('/messages', { schema: postMessageSchema }, postMessageHandler);
    server.delete("/messages", deleteAllMessages);
};
export default messageRoutes;

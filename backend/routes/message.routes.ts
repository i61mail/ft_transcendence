import Fastify from "fastify";
import type {Message} from "../types/message.types.js"
import { postMessageHandler, getAllMessages, deleteAllMessages, getMessagesInFriendship } from "../controllers/message.controller.js";
import postMessageSchema from "../schemas/message.schemas.js";


const messageRoutes = async (server: Fastify.FastifyInstance) =>
{
	server.get("/messages", getAllMessages);
    server.get<{Params: {id: number}}>("/messages/friendship/:id", getMessagesInFriendship);
    server.post<{Body: Message}>('/messages', {schema: postMessageSchema},postMessageHandler)
    server.delete("/messages", deleteAllMessages);
}

export default messageRoutes;
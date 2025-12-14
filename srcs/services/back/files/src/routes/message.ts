import { FastifyInstance } from 'fastify';
import { Message } from '../types/message.types';
import {
  postMessageHandler,
  getAllMessages,
  deleteAllMessages,
  getMessagesInFriendship,
} from '../controllers/message.controller';

const messageRoutes = async (server: FastifyInstance) => {
  server.get('/messages', getAllMessages);
  server.get<{ Params: { id: string }; Querystring: { user_id?: string } }>(
    '/messages/friendship/:id',
    getMessagesInFriendship
  );
  server.post<{ Body: Message }>('/messages', postMessageHandler);
  server.delete('/messages', deleteAllMessages);
};

export default messageRoutes;

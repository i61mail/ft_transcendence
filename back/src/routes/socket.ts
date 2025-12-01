import { FastifyInstance } from 'fastify';
import chatMessageHandler, {
  messageNotification,
  createGlobalSocket,
} from '../controllers/socket.controller';

const socketRoutes = async (server: FastifyInstance) => {
  server.get('/sockets/notifications/chatPreview', { websocket: true }, messageNotification);
  server.get('/sockets', { websocket: true }, createGlobalSocket);
};

export default socketRoutes;

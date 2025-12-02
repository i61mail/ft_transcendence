import { FastifyInstance } from 'fastify';
import chatMessageHandler, {
  messageNotification,
  createGlobalSocket,
  gameController
} from '../controllers/socket.controller';

const socketRoutes = async (server: FastifyInstance) => {
  server.get('/sockets/notifications/chatPreview', { websocket: true }, messageNotification);
  server.get('/sockets', { websocket: true }, createGlobalSocket);
  server.get('/sockets/games', {websocket: true}, gameController);
};

export default socketRoutes;

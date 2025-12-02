import { FastifyInstance } from 'fastify';
import {
  deleteFriendship,
  extractFriendships,
  registerFriendship,
} from '../controllers/friendship.controller';
import { FriendshipRequest, FriendshipParams } from '../types/friendship.types';

const friendshipRoutes = async (server: FastifyInstance) => {
  server.post<{ Body: FriendshipRequest }>(
    '/friendships',
    registerFriendship
  );
  server.delete<{ Params: FriendshipParams }>(
    '/friendships/:id',
    deleteFriendship
  );
  server.get<{ Params: FriendshipParams }>(
    '/friendships/:id',
    extractFriendships
  );
};

export default friendshipRoutes;

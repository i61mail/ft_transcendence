import { FastifyInstance } from 'fastify';
import {
  blockUser,
  unblockUser,
  getBlockedUsers,
  checkBlocked,
} from '../controllers/block.controller';

const blockRoutes = async (server: FastifyInstance) => {
  server.post('/blocks/:userId', blockUser); // Block a user
  server.delete('/blocks/:userId', unblockUser); // Unblock a user
  server.get('/blocks/:userId', getBlockedUsers); // Get all blocked users for a user
  server.get('/blocks/:userId/check/:targetUserId', checkBlocked); // Check if user is blocked
};

export default blockRoutes;

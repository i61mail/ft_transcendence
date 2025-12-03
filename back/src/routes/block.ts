import { FastifyInstance } from 'fastify';
import {
  blockUser,
  unblockUser,
  getBlockedUsers,
  checkBlocked,
} from '../controllers/block.controller';

const blockRoutes = async (server: FastifyInstance) => {
  // Block a user
  server.post('/blocks/:userId', blockUser);

  // Unblock a user
  server.delete('/blocks/:userId', unblockUser);

  // Get all blocked users for a user
  server.get('/blocks/:userId', getBlockedUsers);

  // Check if user is blocked
  server.get('/blocks/:userId/check/:targetUserId', checkBlocked);
};

export default blockRoutes;

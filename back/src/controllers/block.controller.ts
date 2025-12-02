import { FastifyRequest, FastifyReply } from 'fastify';

interface BlockParams {
  userId: string;
}

interface BlockBody {
  blocker_id: number;
}

// Block a user
export const blockUser = async (
  request: FastifyRequest<{ Params: BlockParams; Body: BlockBody }>,
  reply: FastifyReply
) => {
  try {
    const blockerId = request.body.blocker_id;
    const blockedId = parseInt(request.params.userId);

    if (!blockerId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    if (blockerId === blockedId) {
      return reply.code(400).send({ error: 'Cannot block yourself' });
    }

    const db = request.server.db;

    // Check if already blocked
    const existing = db
      .prepare('SELECT * FROM blocks WHERE blocker_id = ? AND blocked_id = ?')
      .get(blockerId, blockedId);

    if (existing) {
      return reply.code(400).send({ error: 'User already blocked' });
    }

    // Insert block
    db.prepare('INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)').run(
      blockerId,
      blockedId
    );

    return reply.code(201).send({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    return reply.code(500).send({ error: 'Failed to block user' });
  }
};

// Unblock a user
export const unblockUser = async (
  request: FastifyRequest<{ Params: BlockParams; Body: BlockBody }>,
  reply: FastifyReply
) => {
  try {
    const blockerId = request.body.blocker_id;
    const blockedId = parseInt(request.params.userId);

    if (!blockerId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const db = request.server.db;

    const result = db
      .prepare('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?')
      .run(blockerId, blockedId);

    if (result.changes === 0) {
      return reply.code(404).send({ error: 'Block not found' });
    }

    return reply.send({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock user error:', error);
    return reply.code(500).send({ error: 'Failed to unblock user' });
  }
};

// Get list of blocked users
export const getBlockedUsers = async (
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = parseInt(request.params.userId);

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const db = request.server.db;

    const blockedUsers = db
      .prepare(
        `SELECT u.id, u.username, u.display_name, u.avatar_url, b.created_at as blocked_at
         FROM blocks b
         JOIN users u ON u.id = b.blocked_id
         WHERE b.blocker_id = ?`
      )
      .all(userId);

    return reply.send(blockedUsers);
  } catch (error) {
    console.error('Get blocked users error:', error);
    return reply.code(500).send({ error: 'Failed to get blocked users' });
  }
};

// Check if a user is blocked
export const checkBlocked = async (
  request: FastifyRequest<{ Params: { userId: string; targetUserId: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = parseInt(request.params.userId);
    const targetUserId = parseInt(request.params.targetUserId);

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const db = request.server.db;

    const block = db
      .prepare('SELECT * FROM blocks WHERE blocker_id = ? AND blocked_id = ?')
      .get(userId, targetUserId);

    return reply.send({ blocked: !!block });
  } catch (error) {
    console.error('Check blocked error:', error);
    return reply.code(500).send({ error: 'Failed to check block status' });
  }
};

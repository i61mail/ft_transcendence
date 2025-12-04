import { FastifyRequest, FastifyReply } from 'fastify';
import { FriendshipParams, Friendship, FriendshipRequest } from '../types/friendship.types';

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  display_name?: string;
}

export const extractFriendships = async (
  request: FastifyRequest<{
    Params: FriendshipParams;
  }>,
  reply: FastifyReply
) => {
  try {
    const extractList = request.server.db.prepare<[number, number, number], Friendship>(
      'SELECT id, (CASE WHEN user1_id = ? THEN user2_id ELSE user1_id END) AS friend_id FROM friendships WHERE user1_id = ? OR user2_id = ?'
    );
    const friendList = extractList.all(
      request.params.id,
      request.params.id,
      request.params.id
    );
    friendList.forEach((friend) => {
      const extractUserInfo = request.server.db.prepare<[number], User>(
        'SELECT id, username, email, avatar_url, display_name FROM users WHERE id = ?'
      );
      const user = extractUserInfo.get(friend.friend_id || request.params.id);
      if (user !== undefined) {
        friend.username = user.username;
        friend.avatar_url = user.avatar_url;
        friend.display_name = user.display_name;
      }
    });
    console.log(friendList);
    reply.send(friendList);
  } catch (err) {
    request.server.log.error(err);
    reply.status(500).send(err);
  }
};

export const deleteFriendship = async (
  request: FastifyRequest<{
    Params: FriendshipParams;
  }>,
  reply: FastifyReply
) => {
  try {
    const id = request.params.id;
    const statement = request.server.db.prepare<[number]>(
      'DELETE FROM friendships WHERE id = ?'
    );
    statement.run(id);
    reply.send({ success: true });
  } catch (err) {
    console.log('failed to delete friendship');
    request.server.log.error(err);
    reply.status(500).send(err);
  }
};

export const registerFriendship = async (
  request: FastifyRequest<{ Body: FriendshipRequest }>,
  reply: FastifyReply
) => {
  const { user1, user2 } = request.body;
  const db = request.server.db;

  try {
    const registerFriendship = db.prepare(
      'INSERT INTO friendships (user1_id, user2_id) VALUES (?, ?)'
    );
    const result = registerFriendship.run(user1, user2);
    reply.send({ id: result.lastInsertRowid, user1_id: user1, user2_id: user2 });
  } catch (err) {
    request.server.log.error(err);
    reply.status(500).send(err);
  }
};

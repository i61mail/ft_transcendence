import { FastifyRequest, FastifyReply } from 'fastify';
import { Message } from '../types/message.types';

export const postMessageHandler = async (
  request: FastifyRequest<{
    Body: Message;
  }>,
  reply: FastifyReply
) => {
  const server = request.server;
  try {
    const { sender, receiver, content, friendship_id } = request.body;
    const db = server.db;
    
    // Check if either user has blocked the other
    const blockCheck = db.prepare(
      `SELECT * FROM blocks 
       WHERE (blocker_id = ? AND blocked_id = ?) 
       OR (blocker_id = ? AND blocked_id = ?)`
    ).get(sender, receiver, receiver, sender);

    // Save the message but mark it as blocked if there's a block relationship
    const isBlocked = blockCheck ? 1 : 0;
    const insertStm = db.prepare(
      `INSERT INTO messages (friendship_id, sender, receiver, content, is_blocked) VALUES (?,?,?,?,?)`
    );
    const result = insertStm.run(friendship_id, sender, receiver, content, isBlocked);
    
    reply.send({
      sender: sender,
      receiver: receiver,
      content: content,
      id: result.lastInsertRowid,
      friendship_id: friendship_id,
    });
  } catch (err) {
    console.log('failed to send message');
    reply.status(500).send(err);
  }
};

export const getAllMessages = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const statement = request.server.db.prepare<[], Message>(
    `SELECT * FROM messages ORDER BY created_at ASC`
  );
  const allData: Message[] = statement.all();
  if (allData) {
    reply.send(
      allData.map((message) => ({
        id: message.id,
        receiver: message.receiver,
        sender: message.sender,
        content: message.content,
        date: message.created_at,
      }))
    );
  }
};

export const deleteAllMessages = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const statement = request.server.db.prepare('DELETE FROM messages');
  statement.run();
  reply.send({ success: true });
};

export const getMessagesInFriendship = async (
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Querystring: {
      user_id?: string;
    };
  }>,
  reply: FastifyReply
) => {
  const friendshipId = parseInt(request.params.id);
  const userId = request.query.user_id ? parseInt(request.query.user_id) : null;
  
  let messages;
  
  // If user_id is provided, filter to show:
  // - All non-blocked messages (is_blocked = 0)
  // - Blocked messages sent by this user (is_blocked = 1 AND sender = user_id)
  if (userId) {
    const findMessages = request.server.db.prepare<[number, number], Message>(
      'SELECT * FROM messages WHERE friendship_id = ? AND (is_blocked = 0 OR (is_blocked = 1 AND sender = ?))'
    );
    messages = findMessages.all(friendshipId, userId);
  } else {
    const findMessages = request.server.db.prepare<[number], Message>(
      'SELECT * FROM messages WHERE friendship_id = ?'
    );
    messages = findMessages.all(friendshipId);
  }
  
  reply.send(messages);
};

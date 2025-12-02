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
    const insertStm = db.prepare(
      `INSERT INTO messages (friendship_id, sender, receiver, content) VALUES (?,?,?,?)`
    );
    const result = insertStm.run(friendship_id, sender, receiver, content);
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
  }>,
  reply: FastifyReply
) => {
  const findMessages = request.server.db.prepare<[number], Message>(
    'SELECT * FROM messages WHERE friendship_id = ?'
  );
  const messages = findMessages.all(parseInt(request.params.id));
  reply.send(messages);
};

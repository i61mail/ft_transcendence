import Fastify from "fastify";
const postMessageHandler = async (request, reply) => {
    const server = request.server;
    try {
        const { sender, receiver, content, friendship_id } = request.body;
        const db = server.db;
        const insertStm = db.prepare(`INSERT INTO messages (friendship_id, sender, receiver, content) VALUES (?,?,?,?)`);
        const result = insertStm.run(friendship_id, sender, receiver, content);
        reply.send({ sender: sender, receiver: receiver, content: content, id: result.lastInsertRowid, friendship_id: friendship_id });
    }
    catch (err) {
        console.log("failed to send message");
        reply.send(err);
    }
};
const getAllMessages = async (request, reply) => {
    const statement = request.server.db.prepare(`SELECT * FROM messages ORDER BY created_at ASC`);
    const allData = statement.all();
    if (allData) {
        reply.send(allData.map(message => ({
            id: message.id,
            receiver: message.receiver,
            sender: message.sender,
            content: message.content,
            date: message.createdAt
        })));
    }
};
const deleteAllMessages = async (request, reply) => {
    const statement = request.server.db.prepare("DELETE FROM messages");
    statement.run();
};
const getMessagesInFriendship = async (request, reply) => {
    const findMessages = request.server.db.prepare("SELECT * FROM messages WHERE friendship_id = ?");
    const messages = findMessages.all(request.params.id);
    reply.send(messages);
};
export { postMessageHandler, getAllMessages, deleteAllMessages, getMessagesInFriendship };

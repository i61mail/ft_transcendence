import Fastify from "fastify";
const createUserHandler = async (request, reply) => {
    const server = request.server;
    try {
        const { email, password, username } = request.body;
        const db = server.db;
        const insertStm = db.prepare(`INSERT INTO users (email, username, password) VALUES (?,?,?)`);
        insertStm.run(email, username, password);
        reply.send(`User ${username} is created`);
    }
    catch (err) {
        console.log("failed to add new user");
        reply.send(err);
    }
};
const getUserById = async (request, reply) => {
    const id = request.params.id;
    const getUser = request.server.db.prepare(`SELECT * FROM users WHERE id = ?`);
    const foundUser = getUser.get(id);
    if (!foundUser)
        reply.status(404).send("not found!");
    else
        reply.send({
            username: foundUser.username
        });
};
const getAllUsers = async (request, reply) => {
    const statement = request.server.db.prepare(`SELECT * FROM users`);
    const allData = statement.all();
    if (allData) {
        reply.send(allData.map(user => ({
            id: user.id,
            username: user.username
        })));
    }
};
export default createUserHandler;
export { getUserById, getAllUsers };

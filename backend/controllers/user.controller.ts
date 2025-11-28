import Fastify from "fastify"
import type {User, UserParams} from "../types/user.types.js";

const createUserHandler = async (request: Fastify.FastifyRequest<{Body: User}>, reply: Fastify.FastifyReply<{Body: User}>) =>
{
    const server = request.server;

    try
    {
        const {email, password, username} = request.body;
        const db = server.db;
        const insertStm = db.prepare(`INSERT INTO users (email, username, password) VALUES (?,?,?)`)
        insertStm.run(email, username, password);
        reply.send(`User ${username} is created`);
    }
    catch (err)
    {
        console.log("failed to add new user");
        reply.send(err);
    }
}


const getUserById = async (request: Fastify.FastifyRequest<{
    Params: UserParams;
}>, reply:Fastify.FastifyReply<{
    Params: UserParams;
}>) =>
{
    const id: number = request.params.id;
    const getUser = request.server.db.prepare<[number], User>(`SELECT * FROM users WHERE id = ?`);
    const foundUser = getUser.get(id);
    if (!foundUser)
        reply.status(404).send("not found!");
    else
        reply.send({
                username: foundUser.username
        });
}

const getAllUsers = async (request: Fastify.FastifyRequest, reply: Fastify.FastifyReply) =>
{
    const statement = request.server.db.prepare<[],User>(`SELECT * FROM users`);
    const allData:User[] = statement.all();
    if (allData)
    {
        reply.send(allData.map(user => (
            {
                id: user.id,
                username: user.username
            }
        )
        ))
    }
}

export default createUserHandler;
export {getUserById, getAllUsers};
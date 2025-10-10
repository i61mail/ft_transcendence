import Fastify from "fastify"
import {postUserSchema, userParamsSchema} from "../schemas/user.schemas.js"
import createUserHandler from "../controllers/user.controller.js";
import type {User, UserParams} from "../types/user.types.js"
import { getUserById, getAllUsers } from "../controllers/user.controller.js";


const userRoutes = async (server: Fastify.FastifyInstance) =>
{
    server.post<{Body: User}>('/users', {schema: postUserSchema}, createUserHandler);    
    server.get<{Params:UserParams}>('/users/:id', {schema: {params: userParamsSchema}}, getUserById);
    server.get("/users", getAllUsers);
}

export default userRoutes;
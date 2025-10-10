import Fastify from "fastify";
import { postUserSchema, userParamsSchema } from "../schemas/user.schemas.js";
import createUserHandler from "../controllers/user.controller.js";
import { getUserById, getAllUsers } from "../controllers/user.controller.js";
const userRoutes = async (server) => {
    server.post('/users', { schema: postUserSchema }, createUserHandler);
    server.get('/users/:id', { schema: { params: userParamsSchema } }, getUserById);
    server.get("/users", getAllUsers);
};
export default userRoutes;

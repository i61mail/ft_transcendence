import type { FastifyInstance } from "fastify";
import { deleteFriendship, extractFriendships, registerFriendship } from "../controllers/friendship.controllers.js";
import type { FriendShipRequest, FriendshipParams } from "types/friendship.types.js";
import registerFriendSchema from "../schemas/friendship.schemas.js";

const friendsRoutes = async (server: FastifyInstance) =>
{
    server.post<{Body: FriendShipRequest}>("/friendships", {schema: registerFriendSchema}, registerFriendship)
    server.delete<{Params: FriendshipParams}>("/friendships/:id", deleteFriendship)
    server.get<{Params: FriendshipParams}>("/friendships/:id", extractFriendships);
}

export default friendsRoutes;
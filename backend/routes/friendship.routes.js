import { deleteFriendship, extractFriendships, registerFriendship } from "controllers/friendship.controllers.js";
import registerFriendSchema from "schemas/friendship.schemas.js";
const friendsRoutes = async (server) => {
    server.post("/friendships", { schema: registerFriendSchema }, registerFriendship);
    server.delete("/friendships/:id", deleteFriendship);
    server.get("/friendships/:id", extractFriendships);
};
export default friendsRoutes;

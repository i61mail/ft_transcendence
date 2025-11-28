export const extractFriendships = async (request, reply) => {
    try {
        const extractList = request.server.db.prepare("SELECT id, (CASE WHEN user1_id = ? THEN user2_id ELSE user1_id END) AS friend_id FROM friendships where user1_id = ? OR user2_id = ?");
        const friendList = extractList.all(request.params.id, request.params.id, request.params.id);
        friendList.forEach((friend) => {
            const extractUserInfo = request.server.db.prepare("select * from users where id = ?");
            const user = extractUserInfo.get(friend.friend_id || request.params.id);
            if (user !== undefined)
                friend.username = user.username;
        });
        console.log(friendList);
        reply.send(friendList);
    }
    catch (err) {
        request.server.log.error(err);
        reply.send(err);
    }
};
export const deleteFriendship = async (request, reply) => {
    try {
        const id = request.params.id;
        const statement = request.server.db.prepare("DELETE FROM friendships where id = ?");
        statement.run(id);
    }
    catch (err) {
        console.log("failed to delete friendship");
        request.server.log.error(err);
    }
};
export const registerFriendship = async (request, reply) => {
    const { user1, user2 } = request.body;
    const db = request.server.db;
    try {
        const registerFriendship = db.prepare("INSERT INTO friendships (user1_id, user2_id) VALUES (?, ?)");
        registerFriendship.run(user1, user2);
    }
    catch (err) {
        request.server.log.error(err);
    }
};

export const extractFriendships = async (request, reply) => {
    try {
        const extractList = request.server.db.prepare("SELECT * FROM friendships where user1_id = ? OR user2_id = ?");
        const friendList = extractList.all(request.params.id, request.params.id);
        friendList.forEach((friend) => {
            const extractUserInfo = request.server.db.prepare("select * from users where id = ?");
            const user = extractUserInfo.get(friend.user1_id == request.params.id ? friend.user2_id : friend.user1_id);
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
        const statement = db.prepare("SELECT * FROM users WHERE username=?");
        const requester = statement.get(user1);
        const requestee = statement.get(user2);
        const registerFriendship = db.prepare("INSERT INTO friendships (user1_id, user2_id) VALUES (?, ?)");
        registerFriendship.run(requester?.id, requestee?.id);
    }
    catch (err) {
        request.server.log.error(err);
    }
};

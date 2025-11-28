const registerFriendSchema = {
    body: {
        type: "object",
        properties: {
            user1: { type: "number" },
            user2: { type: "number" },
        },
        required: ["user1", "user2"],
        additionalProperties: false
    }
};
export default registerFriendSchema;

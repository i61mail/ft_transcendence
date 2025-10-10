const registerFriendSchema = {
    body:
    {
        type: "object",
        properties: 
        {
            user1: {type: "string"},
            user2: {type: "string"},
        },
        required: ["user1", "user2"],
        additionalProperties: false
    }
}

export default registerFriendSchema;
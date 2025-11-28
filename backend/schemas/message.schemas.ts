const postMessageSchema = {
    body:
    {
        type: "object",
        properties: {
            sender: {type: "number"},
            receiver: {type: "number"},
            content: {type: "string"},
            friendship_id : {type: "number"}
        },
        required: ["sender", "receiver", "content", "friendship_id"],
        additionalProperties: false
    }
}

export default postMessageSchema;
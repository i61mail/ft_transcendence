const postMessageSchema = {
    body:
    {
        type: "object",
        properties: {
            sender: {type: "string"},
            receiver: {type: "string"},
            content: {type: "string"},
            friendship_id : {type: "number"}
        },
        required: ["sender", "receiver", "content", "friendship_id"],
        additionalProperties: false
    }
}

export default postMessageSchema;
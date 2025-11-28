const userParamsSchema = {
    type: "object",
    properties: {
        id: { type: "string" }
    }
};
const postUserSchema = {
    body: {
        type: "object",
        properties: {
            password: { type: "string" },
            username: { type: "string" },
            email: { type: "string" }
        },
        required: ["username", "password", "email"],
        additionalProperties: false
    }
};
export { userParamsSchema, postUserSchema };

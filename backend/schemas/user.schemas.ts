const userParamsSchema = 
{
    type: "object",
    properties: {
        id: {type: "string"}
    }
}


const postUserSchema = {
    body:
    {
        type: "object",
        properties: {
            name: {type: "string"},
            lastName: {type: "string"},
            password: {type: "string"},
            username: {type: "string"}        
        },
        required: ["username", "name", "lastName", "password"],
        additionalProperties: false
    }
}

export {userParamsSchema, postUserSchema}
import { FastifyInstance } from 'fastify';


const inviteRoutes = async(server: FastifyInstance) =>
{
    server.get<{Querystring: { code: string}}>('/invite', async (request, reply) => {
        const {code} = request.query;


        if (server.inviteQueue.has(code))
        {
            return reply.send(JSON.stringify(code));
        }

        return reply.code(404).send({message: "Invite code not found or expired"});
    })
}

export default inviteRoutes;
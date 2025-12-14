import { FastifyInstance } from "fastify";
import {register, updateMetrics} from "../utils/metrics"



export default async function apiRoutes(app: FastifyInstance)
{
    app.get("/metrics", async (request, reply) => {
        await updateMetrics(app);
        reply.header("Content-Type", register.contentType).send(await register.metrics());
      });
}
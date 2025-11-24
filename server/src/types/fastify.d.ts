import 'fastify';
import type { Database as DatabaseInstance } from 'better-sqlite3';

declare module 'fastify' {
  interface FastifyInstance {
    db: DatabaseInstance;
  }
}

import 'fastify';
import { Database } from 'better-sqlite3';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }

  interface FastifyRequest {
    cookies: { [key: string]: string | undefined };
  }

  interface FastifyReply {
    setCookie(name: string, value: string, options?: any): this;
    clearCookie(name: string, options?: any): this;
  }
}

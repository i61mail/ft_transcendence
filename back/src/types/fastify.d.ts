import 'fastify';
import { Database } from 'better-sqlite3';
import { WebSocket } from 'ws';
import { Chat } from './chat.types';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
    chatConnections: Map<WebSocket, string>;
    chatPreviewNotifications: Map<WebSocket, Chat>;
    globalSockets: Map<WebSocket, number>;
    gameSockets: Map<WebSocket, number>;
  }

  interface FastifyRequest {
    cookies: { [key: string]: string | undefined };
  }

  interface FastifyReply {
    setCookie(name: string, value: string, options?: any): this;
    clearCookie(name: string, options?: any): this;
  }
}

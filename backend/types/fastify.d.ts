import Database from "better-sqlite3";
import type { WebSocket } from "ws";
import type { Chat } from "./chat.types.ts";


declare module 'fastify' {
    interface FastifyInstance {
        db: Database.Database;
        chatConnections: Map<WebSocket, string>,
        chatPreviewNotifications: Map<WebSocket, Chat>
    }
}

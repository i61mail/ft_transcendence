import Database from "better-sqlite3";
import {} from "fastify";
export default async function dbConnector(fastify) {
    const db = new Database("./main.db");
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            avatar_url TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY,
            friendship_id INTEGER NOT NULL,
            sender INTEGER NOT NULL,
            receiver INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS friendships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_id INTEGER NOT NULL,
            user2_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP 
        )
    `);
    fastify.decorate("db", db);
    fastify.addHook('onClose', (fastify, done) => {
        db.close();
        done();
    });
    console.log("DATABASE IS CONNECTED!");
}

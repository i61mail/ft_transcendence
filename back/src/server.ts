import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import cookie from '@fastify/cookie';
import websocket from '@fastify/websocket';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import authRoutes from './routes/auth';
import oauthRoutes from './routes/oauth';
import profileRoutes from './routes/profile';
import messageRoutes from './routes/message';
import friendshipRoutes from './routes/friendship';
import blockRoutes from './routes/block';
import socketRoutes from './routes/socket';
import twofaRoutes from './routes/twofa';
import fastifyStatic from '@fastify/static';
import { WebSocket } from 'ws';
import { Chat } from './types/chat.types';
import { Queue } from './controllers/socket.controller';
import inviteRoutes from './routes/invite';
import apiRoutes from './routes/api';

const app = Fastify({ logger: true });

// Register CORS
app.register(cors,
{
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

app.decorate('chatConnections', new Map<WebSocket, string>());
app.decorate('chatPreviewNotifications', new Map<WebSocket, Chat>());
app.decorate('globalSockets', new Map<WebSocket, number>());
app.decorate('gameSockets', new Map<WebSocket, number>());
app.decorate('inviteQueue', new Map<string, Queue>)

app.register(websocket);
app.register(cookie);
app.register(jwt,
{
  secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production', // need to be removed
});
app.register(multipart,
{
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

const db = new Database(path.join(__dirname, '../database.db'));


//register metrics endpoint
app.register(apiRoutes);

// Attach database to Fastify instance
app.decorate('db', db);
const initSQL = fs.readFileSync(
  path.join(__dirname, 'database/init.sql'),
  'utf-8'
);
db.exec(initSQL);
app.log.info('✅ Database initialized');

try
{
  const cols = db.prepare("PRAGMA table_info('users')").all() as Array<{ name: string }>;
  const colNames = new Set(cols.map((c) => c.name));

  if (!colNames.has('google_id'))
    db.exec("ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE DEFAULT NULL");
  if (!colNames.has('auth_provider'))
    db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'");
  if (!colNames.has('display_name'))
  {
    db.exec("ALTER TABLE users ADD COLUMN display_name TEXT DEFAULT NULL");
    db.exec("UPDATE users SET display_name = username WHERE display_name IS NULL");
  }
  if (!colNames.has('twofa_secret'))
  {
    db.exec("ALTER TABLE users ADD COLUMN twofa_secret TEXT DEFAULT NULL");
    db.exec("ALTER TABLE users ADD COLUMN twofa_enabled INTEGER DEFAULT 0");
  }
}
catch (e)
{
  app.log.error({ err: e }, 'Database migration step failed');
}


app.register(fastifyStatic, {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/',
});

try
{
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const defaultAvatarPath = path.join(uploadsDir, 'default-avatar.png');
  if (!fs.existsSync(defaultAvatarPath))
  {
    const frontendDefault = path.join(__dirname, '../../front/public/default-avatar.png');
    if (fs.existsSync(frontendDefault))
      fs.copyFileSync(frontendDefault, defaultAvatarPath);
    else
      app.log.warn('Default avatar not found in front/public. Consider adding default-avatar.png');
  }

  const DEFAULT_AVATAR = '/uploads/default-avatar.png';
  db.prepare('UPDATE users SET avatar_url = ? WHERE avatar_url IS NULL').run(DEFAULT_AVATAR);
}
catch (e)
{
  app.log.error({ err: e }, 'Failed to ensure default avatar in uploads');
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.JWT_SECRET) {
  app.log.warn('Google OAuth environment variables missing (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET). OAuth route will fail.');
}

app.register(authRoutes, { prefix: '/auth' });
app.register(oauthRoutes, { prefix: '/auth' });
app.register(twofaRoutes, { prefix: '/auth/2fa' });
app.register(profileRoutes, { prefix: '/profile' });
app.register(messageRoutes);
app.register(friendshipRoutes);
app.register(blockRoutes);
app.register(socketRoutes);
app.register(inviteRoutes);

app.get('/', async (request, reply) => {
  return { status: 'ok', message: 'ft_transcendence backend is running!' };
});

app.addHook('onClose', async (instance) => {
  db.close();
  instance.log.info('Database connection closed');
});

// Start the server
const start = async () => {
  try
  {
    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running on https://localhost:${port}`);
  }
  catch (err)
  {
    app.log.error(err);
    process.exit(1);
  }
};

start();

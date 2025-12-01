// Load environment variables from .env
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import cookie from '@fastify/cookie';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import authRoutes from './routes/auth';
import oauthRoutes from './routes/oauth';
import profileRoutes from './routes/profile';
import fastifyStatic from '@fastify/static';

const app = Fastify({
  logger: true,
});

// Register CORS
app.register(cors, {
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});


// Register cookie plugin
app.register(cookie);

// Register JWT plugin
app.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
});

// Register multipart plugin for file uploads
app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Create and attach SQLite database manually
const db = new Database(path.join(__dirname, '../database.db'));

// Attach database to Fastify instance
app.decorate('db', db);

// Initialize database tables
const initSQL = fs.readFileSync(
  path.join(__dirname, 'database/init.sql'),
  'utf-8'
);
db.exec(initSQL);
app.log.info('✅ Database initialized');

// Perform light, idempotent migrations for older databases
try {
  const cols = db.prepare("PRAGMA table_info('users')").all() as Array<{ name: string }>;
  const colNames = new Set(cols.map((c) => c.name));

  if (!colNames.has('google_id')) {
    app.log.warn("Applying migration: adding 'google_id' column to users table");
    db.exec("ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE DEFAULT NULL");
  }

  if (!colNames.has('auth_provider')) {
    app.log.warn("Applying migration: adding 'auth_provider' column to users table");
    db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'");
  }

  if (!colNames.has('display_name')) {
    app.log.warn("Applying migration: adding 'display_name' column to users table");
    db.exec("ALTER TABLE users ADD COLUMN display_name TEXT DEFAULT NULL");
    // Backfill: set display_name = username for existing users
    db.exec("UPDATE users SET display_name = username WHERE display_name IS NULL");
  }
} catch (e) {
  app.log.error({ err: e }, 'Database migration step failed');
}


app.register(fastifyStatic, {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/',
});

// Ensure uploads directory and default avatar exist
try {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const defaultAvatarPath = path.join(uploadsDir, 'default-avatar.png');
  if (!fs.existsSync(defaultAvatarPath)) {
    // Try to copy from frontend public assets if available
    const frontendDefault = path.join(__dirname, '../../front/public/default-avatar.png');
    if (fs.existsSync(frontendDefault)) {
      fs.copyFileSync(frontendDefault, defaultAvatarPath);
      app.log.info('📷 Default avatar copied to uploads/default-avatar.png');
    } else {
      app.log.warn('Default avatar not found in front/public. Consider adding default-avatar.png');
    }
  }

  // Backfill existing users without avatar
  const DEFAULT_AVATAR = '/uploads/default-avatar.png';
  db.prepare('UPDATE users SET avatar_url = ? WHERE avatar_url IS NULL').run(DEFAULT_AVATAR);
} catch (e) {
  app.log.error({ err: e }, 'Failed to ensure default avatar in uploads');
}

// Register routes
// Warn if Google OAuth env vars missing
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  app.log.warn('Google OAuth environment variables missing (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET). OAuth route will fail.');
}

app.register(authRoutes, { prefix: '/auth' });
app.register(oauthRoutes, { prefix: '/auth' });
app.register(profileRoutes, { prefix: '/profile' });

// Health check endpoint
app.get('/', async (request, reply) => {
  return { status: 'ok', message: 'ft_transcendence backend is running!' };
});

// Graceful shutdown - close database connection
app.addHook('onClose', async (instance) => {
  db.close();
  instance.log.info('Database connection closed');
});

// Start the server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

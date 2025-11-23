import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import fastifyStatic from '@fastify/static';

const app = Fastify({
  logger: true,
});

// Register CORS
app.register(cors, {
  origin: 'http://localhost:3000',
  credentials: true,
});

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


app.register(fastifyStatic, {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/',
});

// Register routes
app.register(authRoutes, { prefix: '/auth' });
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

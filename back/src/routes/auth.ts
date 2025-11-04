import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

// Type definitions for request bodies
interface RegisterBody {
  email: string;
  username: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export default async function authRoutes(app: FastifyInstance) {
  
  // ═══════════════════════════════════════════════════════════
  // POST /auth/register - Register a new user
  // ═══════════════════════════════════════════════════════════
  app.post('/register', async (
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) => {
    const { email, username, password } = request.body;

    // Validate input
    if (!email || !username || !password) {
      return reply.code(400).send({
        error: 'Missing required fields: email, username, password',
      });
    }

    // Validate password length
    if (password.length < 8) {
      return reply.code(400).send({
        error: 'Password must be at least 8 characters long',
      });
    }

    try {
      // Check if user already exists
      const existingUser = app.db
        .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
        .get(email, username);

      if (existingUser) {
        return reply.code(409).send({
          error: 'User with this email or username already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const result = app.db
        .prepare(
          'INSERT INTO users (email, username, password) VALUES (?, ?, ?)'
        )
        .run(email, username, hashedPassword);

      // Generate JWT token
      const token = generateToken(app, result.lastInsertRowid as number, email);

      return reply.code(201).send({
        message: 'User registered successfully',
        token,
        user: {
          id: result.lastInsertRowid,
          email,
          username,
        },
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({
        error: 'Failed to register user',
      });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // POST /auth/login - Login existing user
  // ═══════════════════════════════════════════════════════════
  app.post('/login', async (
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) => {
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      return reply.code(400).send({
        error: 'Missing required fields: email, password',
      });
    }

    try {
      // Find user by email
      const user = app.db
        .prepare('SELECT * FROM users WHERE email = ?')
        .get(email) as { id: number; email: string; username: string; password: string } | undefined;

      if (!user) {
        return reply.code(401).send({
          error: 'Invalid email or password',
        });
      }

      // Compare password with hash
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return reply.code(401).send({
          error: 'Invalid email or password',
        });
      }

      // Generate JWT token
      const token = generateToken(app, user.id, user.email);

      return reply.code(200).send({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({
        error: 'Failed to login',
      });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // GET /auth/me - Get current user info (protected route example)
  // ═══════════════════════════════════════════════════════════
  app.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          error: 'Missing or invalid authorization header',
        });
      }

      const token = authHeader.replace('Bearer ', '');

      // Verify token
      const decoded = app.jwt.verify(token) as { id: number; email: string };

      // Get user from database
      const user = app.db
        .prepare('SELECT id, email, username, created_at FROM users WHERE id = ?')
        .get(decoded.id);

      if (!user) {
        return reply.code(404).send({
          error: 'User not found',
        });
      }

      return reply.code(200).send({
        user,
      });
    } catch (err) {
      return reply.code(401).send({
        error: 'Invalid or expired token',
      });
    }
  });
}

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
const speakeasy = require('speakeasy');

// Type definitions for request bodies
interface RegisterBody {
  email: string;
  username: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
  twofa_token?: string;
}

export default async function authRoutes(app: FastifyInstance) {

  // ═══════════════════════════════════════════════════════════
  // POST /auth/register - Register a new user (with schema)
  // ═══════════════════════════════════════════════════════════
  app.post('/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'username', 'password'],
          properties: {
            email: { type: 'string', format: 'email', maxLength: 254 },
            username: {
              type: 'string',
              minLength: 3,              // enforce >= 3 chars
              maxLength: 20,             // optional cap
              pattern: '^[a-zA-Z0-9_]+$' // optional charset (letters, numbers, _)
            },
            password: { type: 'string', minLength: 8, maxLength: 72 },
            display_name: { type: 'string', maxLength: 50 }
          },
          additionalProperties: false
        },
        response: {
          201: {
            type: 'object',
            required: ['message', 'user'],
            properties: {
              message: { type: 'string' },
              user: {
                type: 'object',
                required: ['id', 'email', 'username'],
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                  display_name: { type: 'string' },
                  avatar_url: { anyOf: [ { type: 'string' }, { type: 'null' } ] }
                }
              }
            }
          }
        }
      }
    },
    async (
      request: FastifyRequest<{ Body: RegisterBody & { display_name?: string } }>,
      reply: FastifyReply
    ) => {
      const { email, username, password, display_name } = request.body;

      // You may keep manual checks as a safety net (optional)
      if (password.length < 8) {
        return reply.code(400).send({ error: 'Password must be at least 8 characters long' });
      }

      try {
        const DEFAULT_AVATAR = '/uploads/default-avatar.png';
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
            'INSERT INTO users (email, username, password, avatar_url, display_name) VALUES (?, ?, ?, ?, ?)'
          )
          .run(email, username, hashedPassword, DEFAULT_AVATAR, display_name ?? username);

        // Generate JWT token
        const token = generateToken(app, result.lastInsertRowid as number, email);

        // Set HTTP-only cookie
        reply.setCookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return reply.code(201).send({
          message: 'User registered successfully',
          user: {
            id: result.lastInsertRowid,
            email,
            username,
            display_name: display_name ?? username,
            avatar_url: DEFAULT_AVATAR,
          },
        });
      } catch (err) {
        app.log.error(err);
        return reply.code(500).send({
          error: 'Failed to register user',
        });
      }
    }
  );

  // ═══════════════════════════════════════════════════════════
  // POST /auth/login - Login existing user (with schema)
  // ═══════════════════════════════════════════════════════════
  app.post('/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', maxLength: 254 },
            password: { type: 'string', minLength: 8, maxLength: 72 },
            twofa_token: { type: 'string', maxLength: 6 }
          },
          additionalProperties: false
        }
      }
    },
    async (
      request: FastifyRequest<{ Body: LoginBody }>,
      reply: FastifyReply
    ) => {
      const { email, password, twofa_token } = request.body;

      console.log('Login request body:', { email, password: '***', twofa_token, hasToken: !!twofa_token });

      try {
        // Find user by email
        const user = app.db
          .prepare('SELECT * FROM users WHERE email = ?')
          .get(email) as {
            id: number;
            email: string;
            username: string;
            password: string | null;
            avatar_url: string | null;
            display_name: string | null;
            auth_provider?: string | null;
            twofa_enabled?: number;
            twofa_secret?: string | null;
          } | undefined;

        if (!user) {
          return reply.code(401).send({
            error: 'Invalid email or password',
          });
        }

        // If this account was created via OAuth, it may not have a password
        if (!user.password) {
          return reply.code(400).send({
            error: 'This account uses Google sign-in. Please click "Sign in with Google".',
          });
        }

        // Compare password with hash
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return reply.code(401).send({
            error: 'Invalid email or password',
          });
        }

        // Check if 2FA is enabled
        if (user.twofa_enabled && user.twofa_secret) {
          if (!twofa_token) {
            // User needs to provide 2FA code
            return reply.code(200).send({
              requires2FA: true,
              message: 'Please provide 2FA code'
            });
          }

          // Verify 2FA token
          const verified = speakeasy.totp.verify({
            secret: user.twofa_secret,
            encoding: 'base32',
            token: twofa_token,
            window: 2
          });

          if (!verified) {
            return reply.code(401).send({
              error: 'Invalid 2FA code'
            });
          }
        }

        // Generate JWT token
        const token = generateToken(app, user.id, user.email);

        // Set HTTP-only cookie
        reply.setCookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return reply.code(200).send({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
          },
        });
      } catch (err) {
        app.log.error(err);
        return reply.code(500).send({
          error: 'Failed to login',
        });
      }
    }
  );

  // ═══════════════════════════════════════════════════════════
  // GET /auth/me - Get current user info (protected route example)
  // ═══════════════════════════════════════════════════════════
  app.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Try to get token from cookie first, then fallback to Authorization header
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;

      if (!token) {
        return reply.code(401).send({
          error: 'Missing or invalid authorization',
        });
      }

      // Verify token
      const decoded = app.jwt.verify(token) as { id: number; email: string };

      // Get user from database
      const user = app.db
        .prepare('SELECT id, email, username, display_name, avatar_url, created_at FROM users WHERE id = ?')
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

  // ═══════════════════════════════════════════════════════════
  // POST /auth/logout - Logout user and clear cookie
  // ═══════════════════════════════════════════════════════════
  app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie('access_token', { path: '/' });
    return reply.code(204).send();
  });
}

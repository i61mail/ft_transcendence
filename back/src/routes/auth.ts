import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import speakeasy from 'speakeasy';

interface RegisterBody
{
  email: string;
  username: string;
  password: string;
}

interface LoginBody
{
  email: string;
  password: string;
  twofa_token?: string;
}

export default async function authRoutes(app: FastifyInstance)
{
  // register users
  app.post('/register',
    {
      schema:
      {
        body:
        {
          type: 'object',
          required: ['email', 'username', 'password'],
          properties:
          {
            email: { type: 'string', format: 'email'},
            username:
            {
              type: 'string',
              pattern: '^[a-zA-Z0-9_]+$'
            },
            password: { type: 'string', minLength: 8, maxLength: 30 },
            display_name: { type: 'string', maxLength: 15 }
          },
          additionalProperties: false
        },
        response:
        {
          201:
          {
            type: 'object',
            required: ['message', 'user'],
            properties:
            {
              message: { type: 'string' },
              user:
              {
                type: 'object',
                required: ['id', 'email', 'username'],
                properties:
                {
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

      if (username.length < 3)
        return reply.code(400).send({ error: 'Username cannot be less than 3 characters' });
      if (username.length > 15)
        return reply.code(400).send({ error: 'Username must be between 3 and 15 characters long' });

      if (password.length < 8)
        return reply.code(400).send({ error: 'Password must be at least 8 characters long' });
      try
      {
        const DEFAULT_AVATAR = '/uploads/default-avatar.png';
        const existingUser = app.db
          .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
          .get(email, username);

        if (existingUser)
          return reply.code(409).send({ error: 'User with this email or username already exists' });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const inserting = app.db
          .prepare(
            'INSERT INTO users (email, username, password, avatar_url, display_name) VALUES (?, ?, ?, ?, ?)'
          )
          .run(email, username, hashedPassword, DEFAULT_AVATAR, display_name ?? username);

        const token = generateToken(app, inserting.lastInsertRowid as number, email);

        reply.setCookie('access_token', token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return reply.code(201).send({
          message: 'User registered successfully',
          user:
          {
            id: inserting.lastInsertRowid,
            email,
            username,
            display_name: display_name ?? username,
            avatar_url: DEFAULT_AVATAR,
          },
        });
      }
      catch (err)
      {
        app.log.error(err);
        return reply.code(500).send({ error: 'Failed to register user' });
      }
    }
  );


  // logging existing users
  app.post('/login',
    {
      schema: {
        body:
        {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', maxLength: 50 },
            password: { type: 'string', minLength: 8, maxLength: 30 },
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

      try
      {
        const user = app.db
          .prepare('SELECT * FROM users WHERE email = ?')
          .get(email) as
          {
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

        if (!user) // User not found
          return reply.code(401).send({ error: 'Invalid email or password' });

        if (!user.password)
          return reply.code(400).send({ error: 'This account uses Google sign-in. Please click "Sign in with Google"' });

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid)
          return reply.code(401).send({ error: 'Invalid password' });

        // Check for 2FA
        if (user.twofa_enabled && user.twofa_secret)
        {
          // insert 2FA token if not provided
          if (!twofa_token)
          {
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

          // invalid 2FA code
          if (!verified)
          {
            return reply.code(401).send({
              error: 'Invalid 2FA code'
            });
          }
        }

        const token = generateToken(app, user.id, user.email);
        reply.setCookie('access_token', token, 
        {
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
      
      } 
      catch (err)
      {
        app.log.error(err);
        return reply.code(500).send({ error: 'Failed to login' });
      }
    }
  );

  // GET current user
  app.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    try
    {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;

      if (!token)
        return reply.code(401).send({ error: 'Missing or invalid authorization' });

      const decoded = app.jwt.verify(token) as { id: number; email: string };
      const user = app.db
        .prepare('SELECT id, email, username, display_name, avatar_url, created_at FROM users WHERE id = ?')
        .get(decoded.id);

      if (!user)
        return reply.code(404).send({ error: 'User not found' });

      return reply.code(200).send({ user });
    }
    catch (err)
    {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });

  // logout users
  app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie('access_token', { path: '/' });
    return reply.code(204).send();
  });
}

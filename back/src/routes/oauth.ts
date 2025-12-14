import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyOauth2 from '@fastify/oauth2';
import { generateToken } from '../utils/jwt';

export default async function oauthRoutes(app: FastifyInstance)
{
  // Register Google OAuth2
  app.register(fastifyOauth2, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials:
    {
      client:
      {
        id: process.env.GOOGLE_CLIENT_ID || '',
        secret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },

    startRedirectPath: '/google',
    callbackUri: process.env.GOOGLE_CALLBACK_URL || 'https://localhost:8080/api/auth/google/callback',
  });

  // handle Google OAuth2 callback
  app.get('/google/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    try
    {
      // Exchange authorization code for access token
      const { token } = await (app as any).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });
      if (!response.ok)
        throw new Error('Failed to fetch user info from Google');

      const googleUser = await response.json() as
      {
        id: string;
        email: string;
        name: string;
        picture?: string;
      };
      const DEFAULT_AVATAR = '/uploads/default-avatar.png';
      let user = app.db
        .prepare('SELECT * FROM users WHERE google_id = ?')
        .get(googleUser.id) as
        {
          id: number;
          email: string;
          username: string;
          avatar_url: string | null;
        } | undefined;

      if (user && !user.avatar_url)
      {
        const avatarUrl = googleUser.picture || DEFAULT_AVATAR;
        app.db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, user.id);
        user.avatar_url = avatarUrl;
      }
      if (!user)
      {
        user = app.db
          .prepare('SELECT * FROM users WHERE email = ?')
          .get(googleUser.email) as {
            id: number;
            email: string;
            username: string;
            google_id: string | null;
            avatar_url: string | null;
          } | undefined;

        if (user)
        {
          // Link Google account to existing user
          app.db
            .prepare('UPDATE users SET google_id = ?, auth_provider = ? WHERE id = ?')
            .run(googleUser.id, 'google', user.id);
          if (!user.avatar_url)
          {
            const avatarUrl = googleUser.picture || DEFAULT_AVATAR;
            app.db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, user.id);
            user.avatar_url = avatarUrl;
          }
        }
        else
        {
          let username = googleUser.name.replace(/\s+/g, '_').toLowerCase();
          const existingUsername = app.db
            .prepare('SELECT id FROM users WHERE username = ?')
            .get(username);
          
          if (existingUsername)
            username = `${username}_${Date.now()}`;
          
          const avatarUrl = googleUser.picture || DEFAULT_AVATAR;
          const result = app.db
            .prepare(`
              INSERT INTO users (email, username, password, google_id, avatar_url, auth_provider)
              VALUES (?, ?, NULL, ?, ?, ?)
            `)
            .run(
              googleUser.email,
              username,
              googleUser.id,
              avatarUrl,
              'google'
            );

          user = {
            id: result.lastInsertRowid as number,
            email: googleUser.email,
            username,
            avatar_url: avatarUrl,
          };
        }
      }
      // Generate JWT token
      const jwtToken = generateToken(app, user.id, user.email);
      reply.setCookie('access_token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      // Redirect to frontend dashboard
      const frontendUrl = process.env.FRONTEND_ORIGIN || 'https://localhost:8080';
      return reply.redirect(`${frontendUrl}/dashboard`);
    }
    catch (err)
    {
      app.log.error(err);
      const frontendUrl = process.env.FRONTEND_ORIGIN || 'https://localhost:8080';
      return reply.redirect(`${frontendUrl}?error=oauth_failed`);
    }
  });
}

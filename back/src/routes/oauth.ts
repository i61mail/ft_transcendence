import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyOauth2 from '@fastify/oauth2';
import { generateToken } from '../utils/jwt';

export default async function oauthRoutes(app: FastifyInstance) {
  // Register Google OAuth2
  app.register(fastifyOauth2, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID || '',
        secret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
  // startRedirectPath is relative to this router's prefix in server.ts.
  // We register oauthRoutes with prefix '/auth', so the final route is '/auth/google'.
  startRedirectPath: '/google',
    callbackUri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
  });

  // ═══════════════════════════════════════════════════════════
  // GET /auth/google/callback - Handle Google OAuth callback
  // ═══════════════════════════════════════════════════════════
  app.get('/google/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Exchange authorization code for access token
      const { token } = await (app as any).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

      // Fetch user info from Google
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const googleUser = await response.json() as {
        id: string;
        email: string;
        name: string;
        picture?: string;
      };

      // Default avatar reference (served by static uploads)
      const DEFAULT_AVATAR = '/uploads/default-avatar.png';

      // Check if user exists by Google ID
      let user = app.db
        .prepare('SELECT * FROM users WHERE google_id = ?')
        .get(googleUser.id) as {
          id: number;
          email: string;
          username: string;
          avatar_url: string | null;
        } | undefined;

      // If user found by Google ID but has no avatar, backfill it
      if (user && !user.avatar_url) {
        const avatarUrl = googleUser.picture || DEFAULT_AVATAR;
        app.db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, user.id);
        user.avatar_url = avatarUrl;
      }

      if (!user) {
        // Check if user exists by email
        user = app.db
          .prepare('SELECT * FROM users WHERE email = ?')
          .get(googleUser.email) as {
            id: number;
            email: string;
            username: string;
            google_id: string | null;
            avatar_url: string | null;
          } | undefined;

        if (user) {
          // Link Google account to existing user
          app.db
            .prepare('UPDATE users SET google_id = ?, auth_provider = ? WHERE id = ?')
            .run(googleUser.id, 'google', user.id);

          // If existing user has no avatar, set Google picture or default
          if (!user.avatar_url) {
            const avatarUrl = googleUser.picture || DEFAULT_AVATAR;
            app.db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, user.id);
            user.avatar_url = avatarUrl;
          }
        } else {
          // Create new user
          // Generate unique username from Google name
          let username = googleUser.name.replace(/\s+/g, '_').toLowerCase();
          
          // Check if username exists and make it unique
          const existingUsername = app.db
            .prepare('SELECT id FROM users WHERE username = ?')
            .get(username);
          
          if (existingUsername) {
            username = `${username}_${Date.now()}`;
          }

          // Insert OAuth user; password left NULL (or placeholder if column still exists)
          // Use Google picture if present, else default avatar.
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

      // Set HTTP-only cookie
      reply.setCookie('access_token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // Redirect to frontend dashboard
      const frontendUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
      return reply.redirect(`${frontendUrl}/dashboard`);
    } catch (err) {
      app.log.error(err);
      const frontendUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
      return reply.redirect(`${frontendUrl}?error=oauth_failed`);
    }
  });
}

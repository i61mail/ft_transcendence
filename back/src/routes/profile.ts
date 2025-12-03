import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);

export default async function profileRoutes(app: FastifyInstance) {
  
  // ═══════════════════════════════════════════════════════════
  // GET /profile - Get current user's profile
  // ═══════════════════════════════════════════════════════════
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
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

      // Get user profile from database
      const user = app.db
        .prepare('SELECT id, email, username, display_name, avatar_url, created_at FROM users WHERE id = ?')
        .get(decoded.id) as any;

      if (!user) {
        return reply.code(404).send({
          error: 'User not found',
        });
      }

      return reply.code(200).send({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
        },
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({
        error: 'Failed to fetch profile',
      });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // GET /profile/:id - Get a user's profile by ID
  // ═══════════════════════════════════════════════════════════
  app.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
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

      // Verify token (authentication required to view profiles)
      app.jwt.verify(token) as { id: number; email: string };

      const userId = parseInt(request.params.id);
      if (isNaN(userId)) {
        return reply.code(400).send({
          error: 'Invalid user ID',
        });
      }

      // Get user profile from database (exclude sensitive info like email for other users)
      const user = app.db
        .prepare('SELECT id, username, display_name, avatar_url, created_at FROM users WHERE id = ?')
        .get(userId) as any;

      if (!user) {
        return reply.code(404).send({
          error: 'User not found',
        });
      }

      return reply.code(200).send({
        user: {
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
        },
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({
        error: 'Failed to fetch profile',
      });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // POST /profile/avatar - Upload user avatar
  // ═══════════════════════════════════════════════════════════
  app.post('/avatar', async (request: FastifyRequest, reply: FastifyReply) => {
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

      // Get uploaded file
      const data = await request.file();

      if (!data) {
        return reply.code(400).send({
          error: 'No file uploaded',
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.code(400).send({
          error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
        });
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = data.mimetype.split('/')[1];
      const filename = `avatar-${decoded.id}-${Date.now()}.${fileExtension}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file
      await pump(data.file, fs.createWriteStream(filepath));

      // Update database with avatar URL
      const avatarUrl = `/uploads/${filename}`;
      app.db
        .prepare('UPDATE users SET avatar_url = ? WHERE id = ?')
        .run(avatarUrl, decoded.id);

      return reply.code(200).send({
        message: 'Avatar uploaded successfully',
        avatar_url: avatarUrl,
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({
        error: 'Failed to upload avatar',
      });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // PUT /profile - Update basic user information (e.g., username)
  // ═══════════════════════════════════════════════════════════
  app.put('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          display_name: { type: 'string', minLength: 2 },
        },
        additionalProperties: false,
      }
    }
  }, async (request: FastifyRequest<{ Body: { display_name?: string } }>, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;

      if (!token) {
        app.log.warn('PUT /profile: Missing auth token');
        return reply.code(401).send({ error: 'Missing or invalid authorization' });
      }

      const decoded = app.jwt.verify(token) as { id: number; email: string };

      const { display_name } = request.body || {};
      if (display_name) {
        if (display_name.trim().length < 2) {
          return reply.code(400).send({ error: 'Display name must be at least 2 characters' });
        }
        app.db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(display_name.trim(), decoded.id);
        app.log.info(`Updated display_name for user ${decoded.id} to "${display_name.trim()}"`);
      }

      const updated = app.db
        .prepare('SELECT id, email, username, display_name, avatar_url, created_at FROM users WHERE id = ?')
        .get(decoded.id);

      return reply.code(200).send({ message: 'Profile updated', user: updated });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update profile' });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // GET /profile/search?username=... - Search for users by username
  // ═══════════════════════════════════════════════════════════
  app.get('/search', async (request: FastifyRequest<{ Querystring: { username?: string } }>, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;

      if (!token) {
        return reply.code(401).send({ error: 'Missing or invalid authorization' });
      }

      const decoded = app.jwt.verify(token) as { id: number; email: string };
      const { username } = request.query;

      if (!username || username.trim().length === 0) {
        return reply.code(400).send({ error: 'Username query parameter is required' });
      }

      // Search for users by username (case-insensitive, partial match)
      const users = app.db
        .prepare('SELECT id, username, display_name, avatar_url FROM users WHERE username LIKE ? AND id != ? LIMIT 10')
        .all(`%${username.trim()}%`, decoded.id);

      // Check friendship status for each user
      const usersWithFriendshipStatus = users.map((user: any) => {
        const friendship = app.db
          .prepare('SELECT id FROM friendships WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)')
          .get(decoded.id, user.id, user.id, decoded.id);
        
        return {
          ...user,
          isFriend: !!friendship
        };
      });

      return reply.code(200).send({ users: usersWithFriendshipStatus });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to search users' });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // GET /profile/match-history - Get current user's match history
  // ═══════════════════════════════════════════════════════════
  app.get('/match-history', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;

      if (!token) {
        return reply.code(401).send({ error: 'Missing or invalid authorization' });
      }

      const decoded = app.jwt.verify(token) as { id: number; email: string };

      // Get pong matches where user is either left or right player
      const matches = app.db
        .prepare(`
          SELECT 
            pm.id,
            pm.game_mode,
            pm.left_player_id,
            pm.right_player_id,
            pm.winner,
            pm.left_score,
            pm.right_score,
            pm.ai_difficulty,
            pm.created_at,
            u1.username as left_player_username,
            u1.display_name as left_player_display_name,
            u1.avatar_url as left_player_avatar,
            u2.username as right_player_username,
            u2.display_name as right_player_display_name,
            u2.avatar_url as right_player_avatar
          FROM pong_matches pm
          LEFT JOIN users u1 ON pm.left_player_id = u1.id
          LEFT JOIN users u2 ON pm.right_player_id = u2.id
          WHERE pm.left_player_id = ? OR pm.right_player_id = ?
          ORDER BY pm.created_at DESC
          LIMIT 50
        `)
        .all(decoded.id, decoded.id);

      // Calculate stats
      let wins = 0;
      let losses = 0;

      matches.forEach((match: any) => {
        const isLeftPlayer = match.left_player_id === decoded.id;
        const isWinner = (isLeftPlayer && match.winner === 'left') || (!isLeftPlayer && match.winner === 'right');
        
        if (isWinner) wins++;
        else losses++;
      });

      const totalGames = wins + losses;
      const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

      return reply.code(200).send({
        stats: {
          wins,
          losses,
          totalGames,
          winRate
        },
        matches
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch match history' });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // GET /profile/:id/match-history - Get a user's match history by ID
  // ═══════════════════════════════════════════════════════════
  app.get('/:id/match-history', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;

      if (!token) {
        return reply.code(401).send({ error: 'Missing or invalid authorization' });
      }

      // Verify token (authentication required)
      app.jwt.verify(token) as { id: number; email: string };

      const userId = parseInt(request.params.id);
      if (isNaN(userId)) {
        return reply.code(400).send({ error: 'Invalid user ID' });
      }

      // Check if user exists
      const user = app.db
        .prepare('SELECT id FROM users WHERE id = ?')
        .get(userId);

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      // Get pong matches where user is either left or right player
      const matches = app.db
        .prepare(`
          SELECT 
            pm.id,
            pm.game_mode,
            pm.left_player_id,
            pm.right_player_id,
            pm.winner,
            pm.left_score,
            pm.right_score,
            pm.ai_difficulty,
            pm.created_at,
            u1.username as left_player_username,
            u1.display_name as left_player_display_name,
            u1.avatar_url as left_player_avatar,
            u2.username as right_player_username,
            u2.display_name as right_player_display_name,
            u2.avatar_url as right_player_avatar
          FROM pong_matches pm
          LEFT JOIN users u1 ON pm.left_player_id = u1.id
          LEFT JOIN users u2 ON pm.right_player_id = u2.id
          WHERE pm.left_player_id = ? OR pm.right_player_id = ?
          ORDER BY pm.created_at DESC
          LIMIT 50
        `)
        .all(userId, userId);

      // Calculate stats
      let wins = 0;
      let losses = 0;

      matches.forEach((match: any) => {
        const isLeftPlayer = match.left_player_id === userId;
        const isWinner = (isLeftPlayer && match.winner === 'left') || (!isLeftPlayer && match.winner === 'right');
        
        if (isWinner) wins++;
        else losses++;
      });

      const totalGames = wins + losses;
      const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

      return reply.code(200).send({
        stats: {
          wins,
          losses,
          totalGames,
          winRate
        },
        matches
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch match history' });
    }
  });
}

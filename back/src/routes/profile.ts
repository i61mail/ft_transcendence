import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import bcrypt from 'bcrypt';

const pump = promisify(pipeline);

export default async function profileRoutes(app: FastifyInstance)
{
  // get /profile
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
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
        .get(decoded.id) as any;

      if (!user)
        return reply.code(404).send({ error: 'User not found' });

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
    } 
    catch (err)
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch profile' });
    }
  });

  // get top players leaderboard
  app.get('/leaderboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try
    {
      const users = app.db
        .prepare('SELECT id, username, display_name, avatar_url, created_at FROM users')
        .all() as any[];
      const leaderboard = users.map((user) => {
        // Get pong matches (online and tournament only)
        const pongMatches = app.db
          .prepare(`
            SELECT 
              game_mode,
              left_player_id,
              right_player_id,
              winner
            FROM pong_matches
            WHERE (left_player_id = ? OR right_player_id = ?)
            AND game_mode IN ('online', 'tournament')
          `)
          .all(user.id, user.id) as any[];

        // Get tic-tac-toe matches
        const tttMatches = app.db
          .prepare(`
            SELECT 
              x_player_id as left_player_id,
              o_player_id as right_player_id,
              CASE 
                WHEN winner = 'x' THEN 'left'
                WHEN winner = 'o' THEN 'right'
                ELSE 'draw'
              END as winner
            FROM tic_tac_toe_matches
            WHERE x_player_id = ? OR o_player_id = ?
          `)
          .all(user.id, user.id) as any[];

        let wins = 0;
        let losses = 0;

        pongMatches.forEach((match) => {
          const isLeftPlayer = match.left_player_id === user.id;
          const isWinner = (isLeftPlayer && match.winner === 'left') || (!isLeftPlayer && match.winner === 'right');
          
          if (isWinner)
            wins++;
          else
            losses++;
        });
        tttMatches.forEach((match) => {
          if (match.winner === 'draw')
            return;
          const isLeftPlayer = match.left_player_id === user.id;
          const isWinner = (isLeftPlayer && match.winner === 'left') || (!isLeftPlayer && match.winner === 'right');
          
          if (isWinner)
            wins++;
          else
            losses++;
        });

        const totalGames = wins + losses;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

        return {
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          wins,
          losses,
          totalGames,
          winRate,
          created_at: user.created_at
        };
      });

      leaderboard.sort((a, b) => {
        if (a.totalGames > 0 && b.totalGames > 0)
        {
          if (b.winRate !== a.winRate)
            return b.winRate - a.winRate;
          return b.totalGames - a.totalGames;
        }
        if (a.totalGames > 0)
          return -1;
        if (b.totalGames > 0)
          return 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      const topPlayers = leaderboard.slice(0, 10);
      return reply.code(200).send({
        leaderboard: topPlayers
      });
    } 
    catch (err) 
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch leaderboard' });
    }
  });

  // get /profile by ID
  app.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try
    {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;
      
      if (!token)
        return reply.code(401).send({ error: 'Missing or invalid authorization' });
      app.jwt.verify(token) as { id: number; email: string };

      const userId = parseInt(request.params.id);
      if (isNaN(userId))
        return reply.code(400).send({ error: 'Invalid user ID' });

      const user = app.db
        .prepare('SELECT id, username, display_name, avatar_url, created_at FROM users WHERE id = ?')
        .get(userId) as any;

      if (!user)
        return reply.code(404).send({ error: 'User not found' });
      return reply.code(200).send({
        user: {
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
        },
      });
    }
    catch (err)
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch profile' });
    }
  });

  // post user avatar
  app.post('/avatar', async (request: FastifyRequest, reply: FastifyReply) => {
    try
    {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;
      
      if (!token)
        return reply.code(401).send({ error: 'Missing or invalid authorization' });
      const decoded = app.jwt.verify(token) as { id: number; email: string };
      const data = await request.file();

      if (!data)
        return reply.code(400).send({ error: 'No file uploaded' });

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(data.mimetype))
        return reply.code(400).send({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' });

      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir))
        fs.mkdirSync(uploadsDir, { recursive: true });

      const fileExtension = data.mimetype.split('/')[1];
      const filename = `avatar-${decoded.id}-${Date.now()}.${fileExtension}`;
      const filepath = path.join(uploadsDir, filename);

      await pump(data.file, fs.createWriteStream(filepath));
      const avatarUrl = `/uploads/${filename}`;
      app.db
        .prepare('UPDATE users SET avatar_url = ? WHERE id = ?')
        .run(avatarUrl, decoded.id);

      return reply.code(200).send({ message: 'Avatar uploaded successfully', avatar_url: avatarUrl });
    }
    catch (err)
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to upload avatar' });
    }
  });

 // update user information 
  app.put('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          display_name: { type: 'string', maxLength: 15 },
          username: { type: 'string', minLength: 3, maxLength: 15, pattern: '^[a-zA-Z0-9_]+$' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, maxLength: 30},
        },
        additionalProperties: false,
      }
    }
  }, async (request: FastifyRequest<{ Body: { display_name?: string; username?: string; email?: string; password?: string } }>, reply: FastifyReply) => {
    try
    {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;

      if (!token)
        return reply.code(401).send({ error: 'Missing or invalid authorization' });
      const decoded = app.jwt.verify(token) as { id: number; email: string };
      const { display_name, username, email, password } = request.body || {};

      if (username)
      {
        const trimmedUsername = username.trim();

        if (trimmedUsername.length < 3)
          return reply.code(400).send({ error: 'Username must be at least 3 characters' });
        if (trimmedUsername.length > 15)
          return reply.code(400).send({ error: 'Username must be at most 15 characters' });
        if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername))
          return reply.code(400).send({ error: 'Username can only contain letters, numbers, and underscores' });

        const existingUser = app.db
          .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
          .get(trimmedUsername, decoded.id) as any;
        
        if (existingUser)
          return reply.code(409).send({ error: 'Username already taken' });
        app.db.prepare('UPDATE users SET username = ? WHERE id = ?').run(trimmedUsername, decoded.id);
      }
      
      if (display_name)
      {
        if (display_name.trim().length < 2)
          return reply.code(400).send({ error: 'Display name must be at least 2 characters' });
        app.db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(display_name.trim(), decoded.id);
      }

      // Handle email update
      if (email)
      {
        const trimmedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail))
          return reply.code(400).send({ error: 'Invalid email format' });

        const existingUser = app.db
          .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
          .get(trimmedEmail, decoded.id) as any;
        
        if (existingUser)
          return reply.code(409).send({ error: 'Email already in use' });
        app.db.prepare('UPDATE users SET email = ? WHERE id = ?').run(trimmedEmail, decoded.id);
      }

      if (password)
      {
        if (password.length < 8)
          return reply.code(400).send({ error: 'Password must be at least 8 characters' });
        const hashedPassword = await bcrypt.hash(password, 10);
        app.db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, decoded.id);
      }

      const updated = app.db
        .prepare('SELECT id, email, username, display_name, avatar_url, created_at FROM users WHERE id = ?')
        .get(decoded.id);

      return reply.code(200).send({ message: 'Profile updated', user: updated });
    }
    catch (err)
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update profile' });
    }
  });

  // search for users by username
  app.get('/search', async (request: FastifyRequest<{ Querystring: { username?: string } }>, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;
      if (!token)
        return reply.code(401).send({ error: 'Missing or invalid authorization' });

      const decoded = app.jwt.verify(token) as { id: number; email: string };
      const { username } = request.query;

      if (!username || username.trim().length === 0)
        return reply.code(400).send({ error: 'Username query parameter is required' });

      const users = app.db
        .prepare('SELECT id, username, display_name, avatar_url FROM users WHERE username LIKE ? AND id != ? LIMIT 10')
        .all(`%${username.trim()}%`, decoded.id);

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
    }
    catch (err)
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to search users' });
    }
  });

  // get user's match history
  app.get('/match-history', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;

      if (!token)
        return reply.code(401).send({ error: 'Missing or invalid authorization' });
      const decoded = app.jwt.verify(token) as { id: number; email: string };
      // pong matches
      const pongMatches = app.db
        .prepare(`
          SELECT 
            pm.id,
            'pong' as game_type,
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
        `)
        .all(decoded.id, decoded.id) as any[];

      // tic-tac-toe matches
      const tttMatches = app.db
        .prepare(`
          SELECT 
            tm.id,
            'tictactoe' as game_type,
            'tictactoe' as game_mode,
            tm.x_player_id as left_player_id,
            tm.o_player_id as right_player_id,
            CASE 
              WHEN tm.winner = 'draw' THEN 'draw'
              WHEN tm.winner = 'x' THEN 'left'
              WHEN tm.winner = 'o' THEN 'right'
            END as winner,
            CASE 
              WHEN tm.winner = 'x' THEN 1
              WHEN tm.winner = 'draw' THEN 0
              ELSE 0
            END as left_score,
            CASE 
              WHEN tm.winner = 'o' THEN 1
              WHEN tm.winner = 'draw' THEN 0
              ELSE 0
            END as right_score,
            NULL as ai_difficulty,
            tm.created_at,
            u1.username as left_player_username,
            u1.display_name as left_player_display_name,
            u1.avatar_url as left_player_avatar,
            u2.username as right_player_username,
            u2.display_name as right_player_display_name,
            u2.avatar_url as right_player_avatar
          FROM tic_tac_toe_matches tm
          LEFT JOIN users u1 ON tm.x_player_id = u1.id
          LEFT JOIN users u2 ON tm.o_player_id = u2.id
          WHERE tm.x_player_id = ? OR tm.o_player_id = ?
        `)
        .all(decoded.id, decoded.id) as any[];

      const allMatches = [...pongMatches, ...tttMatches].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }).slice(0, 50);

      let wins = 0;
      let losses = 0;

      allMatches.forEach((match: any) => {
        if (match.winner === 'draw')
          return;
        const isLeftPlayer = match.left_player_id === decoded.id;
        const isWinner = (isLeftPlayer && match.winner === 'left') || (!isLeftPlayer && match.winner === 'right');
        
        if (isWinner)
          wins++;
        else
          losses++;
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
        matches: allMatches
      });
    }
    catch (err)
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch match history' });
    }
  });

  // GET profile match history by user ID
  app.get('/:id/match-history', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;
      if (!token)
        return reply.code(401).send({ error: 'Missing or invalid authorization' });
      app.jwt.verify(token) as { id: number; email: string };

      const userId = parseInt(request.params.id);
      if (isNaN(userId))
        return reply.code(400).send({ error: 'Invalid user ID' });

      const user = app.db
        .prepare('SELECT id FROM users WHERE id = ?')
        .get(userId);

      if (!user)
        return reply.code(404).send({ error: 'User not found' });
      // pong matches
      const pongMatches = app.db
        .prepare(`
          SELECT 
            pm.id,
            'pong' as game_type,
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
        `)
        .all(userId, userId) as any[];

      // tictac toe matches
      const tttMatches = app.db
        .prepare(`
          SELECT 
            tm.id,
            'tictactoe' as game_type,
            'tictactoe' as game_mode,
            tm.x_player_id as left_player_id,
            tm.o_player_id as right_player_id,
            CASE 
              WHEN tm.winner = 'draw' THEN 'draw'
              WHEN tm.winner = 'x' THEN 'left'
              WHEN tm.winner = 'o' THEN 'right'
            END as winner,
            CASE 
              WHEN tm.winner = 'x' THEN 1
              WHEN tm.winner = 'draw' THEN 0
              ELSE 0
            END as left_score,
            CASE 
              WHEN tm.winner = 'o' THEN 1
              WHEN tm.winner = 'draw' THEN 0
              ELSE 0
            END as right_score,
            NULL as ai_difficulty,
            tm.created_at,
            u1.username as left_player_username,
            u1.display_name as left_player_display_name,
            u1.avatar_url as left_player_avatar,
            u2.username as right_player_username,
            u2.display_name as right_player_display_name,
            u2.avatar_url as right_player_avatar
          FROM tic_tac_toe_matches tm
          LEFT JOIN users u1 ON tm.x_player_id = u1.id
          LEFT JOIN users u2 ON tm.o_player_id = u2.id
          WHERE tm.x_player_id = ? OR tm.o_player_id = ?
        `)
        .all(userId, userId) as any[];

      const allMatches = [...pongMatches, ...tttMatches].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }).slice(0, 50);

      let wins = 0;
      let losses = 0;

      allMatches.forEach((match: any) => {
        if (match.winner === 'draw')
          return;
        
        const isLeftPlayer = match.left_player_id === userId;
        const isWinner = (isLeftPlayer && match.winner === 'left') || (!isLeftPlayer && match.winner === 'right');
        
        if (isWinner)
          wins++;
        else
          losses++;
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
        matches: allMatches
      });
    }
    catch (err)
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch match history' });
    }
  });
}

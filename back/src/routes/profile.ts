import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);

export default async function profileRoutes(app: FastifyInstance) {
  
  // ═══════════════════════════════════════════════════════════
  // POST /profile/avatar - Upload user avatar
  // ═══════════════════════════════════════════════════════════
  app.post('/avatar', async (request: FastifyRequest, reply: FastifyReply) => {
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
}

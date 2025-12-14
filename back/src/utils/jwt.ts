import { FastifyInstance } from 'fastify';

/**
 * Generate a JWT token for a user
 * @param app - Fastify instance (has JWT plugin)
 * @param userId - User's database ID
 * @param email - User's email
 * @returns Signed JWT token string
 */
export function generateToken(
  app: FastifyInstance,
  userId: number,
  email: string
): string {
  const token = app.jwt.sign(
    {
      id: userId,
      email: email,
    },
    {
      expiresIn: '7d', // Token expires in 7 days
    }
  );

  return token;
}

/**
 * Verify a JWT token
 * @param app - Fastify instance (has JWT plugin)
 * @param token - JWT token string to verify
 * @returns Decoded token payload or throws error
 */
export async function verifyToken(
  app: FastifyInstance,
  token: string
): Promise<{ id: number; email: string }> {
  try {
    const decoded = app.jwt.verify(token) as { id: number; email: string };
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

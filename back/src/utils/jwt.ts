import { FastifyInstance } from 'fastify';

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
      expiresIn: '7d', // valid for 7 days
    }
  );
  return token;
}


export async function verifyToken(
    app: FastifyInstance,
    token: string
  ): Promise<{ id: number; email: string }> {
  try
  {
    const decoded = app.jwt.verify(token) as { id: number; email: string };
    return decoded;
  }
  catch (err)
  {
    throw new Error('Invalid or expired token');
  }
}

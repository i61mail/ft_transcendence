import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export default async function twofaRoutes(app: FastifyInstance)
{
  // Generate 2FA secret and QR code
  app.post("/enable", async (request: FastifyRequest, reply: FastifyReply) => {
    try
    {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;

      if (!token)
        return reply.code(401).send({ error: 'Not authenticated' });

      const decoded = app.jwt.verify(token) as { id: number; email: string };
      const user = app.db.prepare('SELECT username FROM users WHERE id = ?').get(decoded.id) as any;
      if (!user)
        return reply.code(404).send({ error: 'User not found' });
      // Generate secret
      const secret = speakeasy.generateSecret({ name: `Transcendence (${user.username})`, length: 32 });

      if (!secret.base32 || !secret.otpauth_url)
        return reply.code(500).send({ error: 'Failed to generate 2FA secret' });

      app.db.prepare("UPDATE users SET twofa_secret = ? WHERE id = ?").run(
        secret.base32,
        decoded.id
      );
      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);
      return { success: true, qrCode, secret: secret.base32 };
    }
    catch (err)
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to enable 2FA' });
    }
  });

  // Verify and activate 2FA
  app.post("/verify", async (request: FastifyRequest, reply: FastifyReply) => {
    try
    {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;

      if (!token)
        return reply.code(401).send({ error: 'Not authenticated' });

      const decoded = app.jwt.verify(token) as { id: number; email: string };
      const { token: totpToken } = request.body as { token: string };
      const userData = app.db.prepare("SELECT twofa_secret FROM users WHERE id = ?").get(decoded.id) as any;

      if (!userData || !userData.twofa_secret)
        return reply.code(400).send({ error: "2FA not initiated" });

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: userData.twofa_secret,
        encoding: 'base32',
        token: totpToken,
        window: 2
      });
      if (!verified)
        return reply.code(400).send({ error: "Invalid code" });

      // Enable 2FA
      app.db.prepare("UPDATE users SET twofa_enabled = 1 WHERE id = ?").run(decoded.id);

      return { success: true, message: "2FA enabled successfully" };
    }
    catch (err)
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to verify 2FA' });
    }
  });

  // Disable 2FA
  app.post("/disable", async (request: FastifyRequest, reply: FastifyReply) => {
    try
    {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;

      if (!token)
        return reply.code(401).send({ error: 'Not authenticated' });

      const decoded = app.jwt.verify(token) as { id: number; email: string };
      const { token: totpToken } = request.body as { token: string };
      const userData = app.db.prepare("SELECT twofa_secret FROM users WHERE id = ?").get(decoded.id) as any;

      if (!userData || !userData.twofa_secret)
        return reply.code(400).send({ error: "2FA not enabled" });

      // Verify TOTP token before disabling
      const verified = speakeasy.totp.verify({
        secret: userData.twofa_secret,
        encoding: 'base32',
        token: totpToken,
        window: 2
      });
      if (!verified)
        return reply.code(400).send({ error: "Invalid code" });

      // Disable 2FA and remove secret
      app.db.prepare("UPDATE users SET twofa_enabled = 0, twofa_secret = NULL WHERE id = ?").run(decoded.id);

      return { success: true, message: "2FA disabled successfully" };
    }
    catch (err)
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to disable 2FA' });
    }
  });

  // Check 2FA status
  app.get("/status", async (request: FastifyRequest, reply: FastifyReply) => {
    try
    {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const token = (request as any).cookies?.access_token || bearer;
      if (!token)
        return reply.code(401).send({ error: 'Not authenticated' });
      const decoded = app.jwt.verify(token) as { id: number; email: string };
      const userData = app.db.prepare("SELECT twofa_enabled FROM users WHERE id = ?").get(decoded.id) as any;
      return { enabled: !!userData?.twofa_enabled };
    }
    catch (err)
    {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to check 2FA status' });
    }
  });
}

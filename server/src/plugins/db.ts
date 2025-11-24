import fp from 'fastify-plugin';
import Database, { Database as DatabaseInstance } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

function createDatabase(): DatabaseInstance
{
  const dbPath = path.join(process.cwd(), 'database', 'database.sqlite');
  const sqlInitPath = path.join(process.cwd(), 'database', 'init.sql');

  const db = new Database(dbPath);
  const initScript = fs.readFileSync(sqlInitPath, 'utf8');
  db.exec(initScript);
  console.log('SQLite initialized');
  return db;
}

export default fp(async function (fastify)
{
  const db = createDatabase();

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    db.close();
  });
});

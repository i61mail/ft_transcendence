import { register, Gauge, Counter, collectDefaultMetrics } from "prom-client";
import { FastifyInstance } from "fastify";


collectDefaultMetrics({ register });

// --- Metrics --- //
export const metrics = {
    // Users
    totalUsers: new Gauge({
      name: "app_users_total",
      help: "Total number of users",
    }),
    activeUsersPerDay: new Gauge({
      name: "app_users_active_per_day",
      help: "Active users per day",
    }),
    newUsersPerDay: new Gauge({
      name: "app_users_new_per_day",
      help: "New users per day",
    }),
  
    // Friendships
    totalFriendships: new Gauge({
      name: "app_friendships_total",
      help: "Total number of friendships",
    }),
    friendshipsPerUser: new Gauge({
      name: "app_friendships_per_user",
      help: "Average number of friendships per user",
    }),
  
    // Messages
    totalMessages: new Gauge({
      name: "app_messages_total",
      help: "Total number of messages",
    }),
    messagesPerDay: new Gauge({
      name: "app_messages_per_day",
      help: "Messages created per day",
    }),
    messagesPerUser: new Gauge({
      name: "app_messages_per_user",
      help: "Average messages per user",
    }),
  
    // Games
    pongMatches: new Gauge({
      name: "app_pong_matches_total",
      help: "Total number of pong matches",
    }),
    ticTacToeMatches: new Gauge({
      name: "app_tictactoe_matches_total",
      help: "Total number of tic-tac-toe matches",
    }),  
    // Blocks
    blockedRelations: new Gauge({
      name: "app_blocks_total",
      help: "Number of blocked relations",
    }),
    databaseQueriesTotal: new Counter({
      name: "app_database_queries_total",
      help: "Total number of database queries executed",
      labelNames: ["operation", "table", "status"]
    })
  };

  Object.values(metrics).forEach(metric => {
    register.registerMetric(metric);
  });
  
export function updateDatabaseMetric(operation: string, table: string, status: string)
{
    metrics.databaseQueriesTotal.inc({operation,table, status});
}

async function updateMetrics(app: FastifyInstance) {

    const db = app.db;
    try {
        // Users
        const totalUsers = db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number };
        metrics.totalUsers.set(totalUsers.c);
    
        const newUsers = db.prepare(`
          SELECT COUNT(*) AS c 
          FROM users 
          WHERE date(created_at) = date('now')
        `).get() as { c: number };
        metrics.newUsersPerDay.set(newUsers.c);
    
        const activeUsers = app.globalSockets.size;
        metrics.activeUsersPerDay.set(activeUsers);
    
        // Friendships
        const totalFriendships = db.prepare("SELECT COUNT(*) AS c FROM friendships").get() as { c: number };
        metrics.totalFriendships.set(totalFriendships.c);
    

        //to fix!!!
        const friendshipsPerUser = db.prepare(`
          SELECT AVG(friends_count) AS avg_count
          FROM (
            SELECT COUNT(*) AS friends_count
            FROM friendships
            GROUP BY user1_id
          )
        `).get() as { avg_count: number };
        (friendshipsPerUser.avg_count === null) ? metrics.friendshipsPerUser.set(0) : metrics.friendshipsPerUser.set(friendshipsPerUser.avg_count);
    
        // Messages
        const totalMessages = db.prepare("SELECT COUNT(*) AS c FROM messages").get() as { c: number };
        metrics.totalMessages.set(totalMessages.c);
    
        const messagesPerUser = db.prepare(`
          SELECT AVG(msg_count) AS avg_count
          FROM (
            SELECT COUNT(*) AS msg_count
            FROM messages
            GROUP BY sender
          )
        `).get() as { avg_count: number };
        metrics.messagesPerUser.set(Number(messagesPerUser.avg_count ?? 0));
    
        const messagesPerDay = db.prepare(`
          SELECT COUNT(*) AS c 
          FROM messages 
          WHERE date(created_at) = date('now')
        `).get() as { c: number };
        metrics.messagesPerDay.set(messagesPerDay.c);
    
        // Games
        const pongMatches = db.prepare("SELECT COUNT(*) AS c FROM pong_matches").get() as { c: number };
        metrics.pongMatches.set(pongMatches.c);
    
        const ticTacToeMatches = db.prepare("SELECT COUNT(*) AS c FROM tic_tac_toe_matches").get() as { c: number };
        metrics.ticTacToeMatches.set(ticTacToeMatches.c);
        
        // Blocks
        const blockedRelations = db.prepare("SELECT COUNT(*) AS c FROM blocks").get() as { c: number };
        metrics.blockedRelations.set(blockedRelations.c);
            
      } catch (err) {
        console.error("Error updating metrics:", err);
      }
    }


export {register, updateMetrics}












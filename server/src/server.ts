import Fastify from 'fastify';
import dbPlugin from './plugins/db';
import websocketPlugin from '@fastify/websocket';
import { PongGame } from './pong/gameLogic';
import { GameMode, Difficulty } from './pong/interfaces';
import { TicTacToeGame } from './tic-tac-toe/gameLogic';

interface playerInfo
{
  id: number;
  socket: WebSocket;
}

// [id, Socket]

const fastify = Fastify({ logger: true });

export function pongOnline(player1 : playerInfo, player2 : playerInfo)
{
  let pong: PongGame = new PongGame(GameMode.online, player1, player2);
}

export function pongLocal(player : playerInfo)
{
  let pong: PongGame = new PongGame(GameMode.local, player);
}

export function pongAI(player : playerInfo, difficulty: Difficulty)
{
  let pong: PongGame = new PongGame(GameMode.AI, player, undefined, difficulty);
}

export function ticTacToe(player1 : playerInfo, player2 : playerInfo)
{
  let ttt: TicTacToeGame = new TicTacToeGame(player1, player2);
}

// ticTacToeConnect();

// pongConnect(GameMode.AI, Difficulty.impossible);


async function start() {
  await fastify.register(dbPlugin);

  fastify.get('/users', async () => {
    // Now TypeScript knows `db` exists
    const rows = fastify.db.prepare('SELECT * FROM users').all();
    console.log(rows);
    return rows;
  });

  await fastify.listen({ port: 4000 });
}

start();
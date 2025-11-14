import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { PongGame } from './pong/gameLogic';
import { GameMode, Difficulty } from './pong/interfaces';
import { TicTacToeGame } from './tic-tac-toe/gameLogic';

let clients = [];

async function pongConnect(gameMode: GameMode, difficulty: Difficulty)
{
  let pong: PongGame = new PongGame(gameMode, difficulty);

  const fastify = Fastify({ logger: true });
  await fastify.register(websocketPlugin);
  fastify.get("/pong", { websocket: true }, (connection, req) =>
  {
    const clientId = clients.length;

    connection.on("close", () => {
      console.log("client closed: ", clientId);
      clients = [];
      pong = new PongGame(gameMode, difficulty);
    });
  
    // if (clients.length >= 2)
    // {
    //   console.log("reached max clients");
    //   connection.close();
    //   return;
    // }
    connection.send(JSON.stringify({gm: gameMode, plyI: clients.length}));
    clients.push(connection);
    pong.addPlayer(connection);
    if (gameMode != GameMode.online || clients.length == 2)
    {
      pong.listenToPlayers();
      pong.run();
    }
  });

  

  fastify.listen({ port: 4000 }, (err, address) => {
    if (err) throw err;
    console.log(`Server listening on ${address}`);
  });
}

async function ticTacToeConnect()
{
  let ttt: TicTacToeGame = new TicTacToeGame();

  const fastify = Fastify({ logger: true });
  await fastify.register(websocketPlugin);
  fastify.get("/tic-tac-toe", { websocket: true }, (connection, req) =>
  {
    const clientId = clients.length;

    connection.on("close", () => {
      console.log("client closed: ", clientId);
      clients = [];
      ttt = new TicTacToeGame();
    });
  
    // if (clients.length >= 2)
    // {
    //   console.log("reached max clients");
    //   connection.close();
    //   return;
    // }
    if (clients.length == 0)

      connection.send();
    clients.push(connection);
    ttt.addPlayer(connection);
    if (gameMode != GameMode.online || clients.length == 2)
    {
      ttt.listenToPlayers();
      ttt.run();
    }
  });

  

  fastify.listen({ port: 4000 }, (err, address) => {
    if (err) throw err;
    console.log(`Server listening on ${address}`);
  });


// pongConnect(GameMode.AI, Difficulty.impossible);

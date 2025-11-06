import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { PongGame } from './gameLogic'
import { GameMode, Difficulty } from './interfaces';

let clients = [];

async function connect(gameMode: GameMode, difficulty: Difficulty)
{
  let pong: PongGame = new PongGame(gameMode, difficulty);

  const fastify = Fastify({ logger: true });
  await fastify.register(websocketPlugin);
  fastify.get("/game", { websocket: true }, (connection, req) =>
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



connect(GameMode.AI, Difficulty.impossible);

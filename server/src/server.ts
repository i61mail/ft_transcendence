import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { PongGame } from './gameLogic'
import { GameMode } from './interfaces';
import { Console } from 'console';

let clients = [];

async function connect(gameMode: GameMode)
{
  let pong: PongGame = new PongGame(gameMode);

  const fastify = Fastify({ logger: true });
  await fastify.register(websocketPlugin);
  fastify.get("/game", { websocket: true }, (connection, req) =>
  {
    const clientId = clients.length;

    connection.on("close", () => {
      console.log("client closed: ", clientId);
    });
  
    // if (clients.length >= 2)
    // {
    //   console.log("reached max clients");
    //   connection.close();
    //   return;
    // }
    clients.push(connection);
    connection.send(JSON.stringify({gm: gameMode}));
    pong.addPlayer(connection);
    if (clients.length == 2)
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



connect(GameMode.online);

import { WebSocket } from 'ws';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import { Chat } from '../types/chat.types';
import { pongAI, PongGame, pongLocal, pongOnline } from '../routes/pong';
import { GameMode } from '../types/pong.types';
import { joinTournament, startTournament } from '../routes/tournament';
import { playerInfo } from '../types/playerInfo.types';
import { tttGame } from '../routes/ticTacToe';

const chatMessageHandler = (socket: WebSocket, request: FastifyRequest) => {
  const server = request.server;

  socket.on('open', () => {
    console.log('new socket connection...');
  });
  socket.on('close', () => {
    console.log(
      'client closed connection',
      server.chatConnections.get(socket),
      server.chatConnections.size
    );
    server.chatConnections.delete(socket);
  });
  socket.onmessage = (msg) => {
    const { content, type } = JSON.parse(msg.data.toString());
    if (type === 'auth') {
      server.chatConnections.set(socket, content);
      console.log(
        'new user',
        server.chatConnections.get(socket),
        server.chatConnections.size
      );
    }
    if (type === 'message') {
      console.log(
        'new message',
        server.chatConnections.get(socket),
        server.chatConnections.size
      );
      socket.send(`${JSON.stringify(content)}`);
      server.chatConnections.forEach((user, sock) => {
        if (user == content.friendship_id) {
          console.log('sending to ', sock.url);
          sock.send(`${JSON.stringify(content)}`);
        }
      });
    }
  };
};

export const messageNotification = async (
  socket: WebSocket,
  request: FastifyRequest
) => {
  {
    const server = request.server;
    socket.on('close', () => {
      console.log(
        'deleting notification',
        server.chatPreviewNotifications.get(socket)
      );
      server.chatPreviewNotifications.delete(socket);
    });

    socket.onmessage = (msg) => {
      const { type, sender, receiver, message } = JSON.parse(
        msg.data.toString()
      );
      if (type === 'registration') {
        const newChatPreview: Chat = { receiver: receiver, sender: sender };
        server.chatPreviewNotifications.set(socket, newChatPreview);
        console.log(
          'new chat preview ',
          server.chatPreviewNotifications.get(socket)
        );
      }
      if (type === 'notification') {
        socket.send(JSON.stringify(message));
      }
    };
  }
};

export const createGlobalSocket = async (
  socket: WebSocket,
  request: FastifyRequest
) => {
    const server = request.server;

    socket.on('close', () =>
    {
        const id = server.globalSockets.get(socket);
        console.log("closed global connection", server.globalSockets.size);
        server.globalSockets.delete(socket);
        server.globalSockets.forEach((user, sock) =>
        {
            sock.send(JSON.stringify({type: "friend_offline", data: id}));
        })
    })

    socket.onmessage = (msg) =>
    {
        const {type, content} = JSON.parse(msg.data.toString());
        console.log("received", type, content);
        if (type == "handshake")
        {
            server.globalSockets.forEach((user, sock) =>
            {
              sock.send(JSON.stringify({type: "friend_online", data: content}));
              console.log("sending back to", content, "=", user);
              socket.send(JSON.stringify({type: "friend_online", data: user}));
            })
            server.globalSockets.set(socket, content);
            console.log("creating new global socket for", content, server.globalSockets.size);
        }
        else if (type === "message")
        {
            // Check if receiver has blocked the sender (one-way check)
            const db = server.db;
            const blockCheck = db.prepare(
              `SELECT * FROM blocks 
               WHERE blocker_id = ? AND blocked_id = ?`
            ).get(content.receiver, content.sender);

            // Send back to sender (echo) - always send to the sender
            socket.send(`${JSON.stringify({type: "message", data: content})}`);
            
            // Only send to receiver if they haven't blocked the sender
            if (!blockCheck) {
                server.globalSockets.forEach((user, sock) => {
                    if (user === content.receiver && sock !== socket)
                    {
                        sock.send(`${JSON.stringify({type: "message", data: content})}`)
                    }
                });
            }
        }
    }
};

interface Player 
{
    socket: WebSocket,
    id: number,
    username: string
}


class Queue{
    private items: Player[] = [];
    private offset = 0;

    enqueue(item: Player) {
        this.items.push(item);
    }

    dequeue(): Player | undefined {
        if (this.size() === 0) return undefined;

        const item = this.items[this.offset];
        this.offset++;

        if (this.offset * 2 >= this.items.length) {
            this.items = this.items.slice(this.offset);
            this.offset = 0;
        }

        return item;
    }

    peek(): Player | undefined {
        return this.items[this.offset];
    }

    size() {
        return this.items.length - this.offset;
    }

    isEmpty() {
        return this.size() === 0;
    }
    contains(item: Player): boolean
    {
        const found = this.items.find(val => val.socket === item.socket);
        if (found)
            return (true);
        return (false);
    }
    remove (item: Player)
    {
        this.items = this.items.filter(p => p !== item);
    }
}


const tttQueue = new Queue;

const handletttGame = async (socket: WebSocket, id: number, username: string ,server: FastifyInstance) => 
{
    const p1: Player = {socket: socket, id: id, username: username};

    socket.onclose = () =>
    {
        tttQueue.remove(p1);
    }

    if (!tttQueue.size())
    {
        console.log("finding second player for", id, tttQueue.size());
        tttQueue.enqueue(p1);
    }
    else
    {
        console.log("starting online game now...", tttQueue.size())
        const p2: Player | undefined = tttQueue.dequeue();
        if (p1 && p2)
            tttGame(p1, p2, server);
    }
}


const pongQueue = new Queue;

const handleOnlineGame = async (socket: WebSocket, id: number, username: string ,server: FastifyInstance) => 
{
    const p1: Player = {socket: socket, id: id, username: username};

    socket.onclose = () =>
    {
        pongQueue.remove(p1);
    }

    if (!pongQueue.size())
    {
        console.log("finding second player for", id, pongQueue.size());
        pongQueue.enqueue(p1);
    }
    else
    {
        console.log("starting online game now...", pongQueue.size())
        const p2: Player | undefined = pongQueue.dequeue();
        if (p1 && p2)
            pongOnline(p1, p2, server);
    }
}

export const gameController = async (socket: WebSocket, request: FastifyRequest) =>
{
    const server = request.server;
    socket.onmessage = (msg) =>
    {
        const {gameType, id, username, code, difficulty} = JSON.parse(msg.data.toString());
        const player: playerInfo = 
        {
          id: id,
          username: username,
          socket: socket
        };

        const gameHandlers: Record<string, () => PongGame | void> = {
            "local": () => pongLocal(player, server),
            "online": () => { handleOnlineGame(socket, id, username, server); },
            "startTournament": () => { startTournament(player, server); },
            "joinTournament": () => { joinTournament(player, code); },
            "ai": () => pongAI(player, difficulty, server),
            "tictactoe": () => { handletttGame(socket, id, username, server); }
        };

        const handler: () => void | PongGame = gameHandlers[gameType];

        if (handler) {
            handler();
        }
    }

    socket.onclose = () =>
    {
        console.log("closed game socket....");
    }
}


export default chatMessageHandler;

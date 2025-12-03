import { WebSocket } from 'ws';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import { Chat } from '../types/chat.types';
import { pongLocal, pongOnline } from '../routes/pong';
import { GameMode } from '../types/pong.types';
import { joinTournament, startTournament } from '../routes/tournament';

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
        console.log("closed global connection", server.globalSockets.size);
        server.globalSockets.delete(socket);
        server.globalSockets.forEach((user, sock) =>
        {
            sock.send(JSON.stringify({type: "friend_offline", data: user}));
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
                sock.send(JSON.stringify({type: "friend_online", data: user}));
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



const queue = new Queue; 



const handleOnlineGame = async (socket: WebSocket, player: number, server: FastifyInstance) => 
{
    const p1: Player = {socket: socket, id: player, username: "John Doe"};

    socket.onclose = () =>
    {
        queue.remove(p1);
    }

    if (!queue.size())
    {
        console.log("finding second player for", player, queue.size());
        queue.enqueue(p1);
    }
    else
    {
        console.log("starting online game now...", queue.size())
        const p2: Player | undefined = queue.dequeue();
        if (p1 && p2)
        {
            p1.socket.send(JSON.stringify({gm: GameMode.online, playerIndex: 0}));
            p2.socket.send(JSON.stringify({gm: GameMode.online, playerIndex: 1}));
            pongOnline(p1, p2, server);
        }
    }
}

const handleTournament = async (socket: WebSocket, player: any) =>
{
    const p: Player = {socket: socket, id: player, username: "John Doe"};

    if (queue.size() < 3)
    {
        console.log("waiting for other players to join...");
        queue.enqueue(p);
    }
    else
    {
        const p1: Player | undefined = queue.dequeue();
        const p2: Player | undefined = queue.dequeue();
        const p3: Player | undefined = queue.dequeue();
        const p4: Player | undefined = p;

        if (p1 && p2 && p3 && p4)
        {
            p1.socket.send(JSON.stringify({state: "true"}));
            p2.socket.send(JSON.stringify({state: "true"}));
            p3.socket.send(JSON.stringify({state: "true"}));
            p4.socket.send(JSON.stringify({state: "true"}));
        }
    }
}

let lists: WebSocket[] = [];

export const gameController = async (socket: WebSocket, request: FastifyRequest) =>
{
    const server = request.server;
    socket.onmessage = (msg) =>
    {
        const {gameType, data} = JSON.parse(msg.data.toString());
        if (gameType === "init")
        {
            console.log("created new game socket...");
        }
        else if (gameType === "local")
        {
            socket.send(JSON.stringify({gm: GameMode.local, plyI: 0}))
            pongLocal({id: data, socket: socket, username: "John Doe"}, server);
        }
        else if (gameType === "online")
            handleOnlineGame(socket, data, server);
        else if (gameType === "tournament")
            startTournament({id: data, socket: socket, username: "John Doe"}, server);
        else if (gameType === "joinTournament")
            joinTournament({id: data.id, socket: socket,username: "James bond"}, data.code);
    }

    socket.onclose = () =>
    {
        console.log("closed game socket....");
    }
}


export default chatMessageHandler;

import { WebSocket } from 'ws';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import { Chat } from '../types/chat.types';
import { pongAI, PongGame, pongLocal, pongOnline } from '../routes/pong';
import { GameMode } from '../types/pong.types';
import { generateCode, joinTournament, playTournament, startTournament } from '../routes/tournament';
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

const inviteList = new Map<string, Queue>;

const createInviteGame = async (socket: WebSocket, sender: number, receiver: number, username: string, server: FastifyInstance) =>
{
    const code: string = generateCode();
    const q = new Queue;
    const p1: Player  = {socket: socket, id: sender, username: username};
    q.enqueue(p1)
    inviteList.set(code, q);
    const invite = {type: "invite", data: {sender: sender, code: code, username: username}};
    server.globalSockets.forEach((key, sock) => {
      if (key === receiver && sock !== socket)
        sock.send(JSON.stringify(invite));
    })
}

export const sendNotification = async (server: FastifyInstance, id: number) =>
{
  const data = {type: "startTournament"};
  server.globalSockets.forEach((value, sock)=>{
    if (id === value && sock.readyState === WebSocket.OPEN)
    {
        sock.send(JSON.stringify(data));
    }
  })
}

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
        else if (type === "invite")
        {
          const {sender, receiver, username} = content;
          console.log("invite", sender, receiver);
          createInviteGame(socket, sender, receiver, username, server);
        }
        else if (type === "refuseInvite")
        {
          const {code, id} = content;
          handleInviteRefusal(socket, id, code);
        }
    }
};

interface Player 
{
    socket: WebSocket,
    id: number,
    username: string
}


export class Queue{
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

const handleInviteOnly = async (socket: WebSocket, player: Player, code: string, server: FastifyInstance) => 
{
  if (!inviteList.has(code))
      return ;
  socket.onclose = () =>
  {
    inviteList.clear();
  }
  const arr = inviteList.get(code);
  console.log(arr?.size());
  if (arr && arr.size() < 2)
  {
    const p1: Player | undefined = arr.dequeue();
    const data = {type: "startInvite", data: {code: code}};
    console.log("sending confirmation to", p1?.username, p1?.id);
    if (p1)
    {
      server.globalSockets.forEach((val, sock) => 
      {
        if (p1.id === val)
          sock.send(JSON.stringify(data))
      })
      // p1.socket.send(JSON.stringify(data))
    }
    console.log("enqueing", player.id, player.username);
    arr.enqueue(player);
    if (p1)
      arr.enqueue(p1);
    inviteList.set(code, arr);
  }
  else if (arr && arr.size() == 2)
  {
    const p2: Player | undefined = arr.dequeue();
    if (player && p2)
    {
      // const data = {type: "startInvite", data: {code: code}};
      // if (p2.socket.readyState === WebSocket.OPEN)
      //   p2.socket.send(JSON.stringify(data))
      console.log("starting invite", player.username, p2.username);
      pongOnline(player, p2, server);
    }
  }
}


const handleInviteRefusal = async (socket: WebSocket, id: number, code: string) =>
{
  if (!inviteList.has(code))
      return ;
  const p1 = inviteList.get(code)?.dequeue();
  if (p1)
    inviteList.delete(code);
}


let lists: WebSocket[] = [];

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
            "playTournament": () => { playTournament(player); },
            "ai": () => pongAI(player, difficulty, server),
            "tictactoe": () => { handletttGame(socket, id, username, server); }
        };

        const handler: () => void | PongGame = gameHandlers[gameType];

        if (handler) {
            handler();
        }
        else if (gameType === "local")
            pongLocal(player, server);
        else if (gameType === "online")
            handleOnlineGame(socket, id, username, server);
        else if (gameType === "startTournament")
            startTournament(player, server);
        else if (gameType === "joinTournament")
            joinTournament(player, code);
        else if (gameType === "ai")
            pongAI(player, difficulty, server);
        else if (gameType === "tictactoe")
            handletttGame(socket, id, username, server);
        else if (gameType === "invite")
            handleInviteOnly(socket, player, code, server);
    }

    socket.onclose = () =>
    {
        console.log("closed game socket....");
    }
}


export default chatMessageHandler;

import { WebSocket } from 'ws';
import { FastifyRequest } from 'fastify';
import { Chat } from '../types/chat.types';

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
            console.log("new message", server.globalSockets.get(socket), server.globalSockets.size);
            socket.send(`${JSON.stringify({type: "message", data: content})}`);
            server.globalSockets.forEach((user, sock) => {
                console.log(user, content.friendship_id);
                if ((user === content.receiver || user === content.sender) && sock !== socket)
                {
                    console.log("sending to ", user)
                    sock.send(`${JSON.stringify({type: "message", data: content})}`)
                }
            });
        }
    }
};

export default chatMessageHandler;

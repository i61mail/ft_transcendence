'use client';
import React, { useRef, useEffect } from 'react';
import MainChat from './MainChat';
import { MessageProps } from '@/types/chat.types';
import useGlobalStore from '@/store/globalStore';

const ChatsWrapper = ({ chat_id }: { chat_id: number }) => {
  const manager = useGlobalStore();
  const socket = useRef<WebSocket | null>(null);
  const currentChatId = useRef<number | null>(null);

  useEffect(() => {
    if (currentChatId.current == chat_id) return;
    console.log('now in', chat_id, currentChatId);
    manager.updateCurrentChat(chat_id);
    currentChatId.current = chat_id;
    manager.friends.forEach((element) => {
      if (element.id == currentChatId.current) manager.changePointedUser(element);
    });
    if (manager.socket) {
      manager.socket.onmessage = (msg) => {
        console.log('received message on', currentChatId.current, typeof currentChatId.current);
        const { receiver, sender, content, id, friendship_id } = JSON.parse(msg.data);
        const newMessage: MessageProps = {
          sender: sender,
          receiver: receiver,
          content: content,
          id: id,
          friendship_id: friendship_id,
        };
        if (currentChatId.current == friendship_id) {
          manager.addMessage(newMessage);
        } else {
          console.log('updating latest message...');
          manager.updateLatestMessage(newMessage);
        }
      };
    }
  }, [chat_id]);

  return (
    <>
      <MainChat ref={socket} />
    </>
  );
};

export default ChatsWrapper;

'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import defaultUser from '../../../public/defaultUser.svg'
import Message from './Message'
import { MessageProps } from '@/types/chat.types'
import MessageForm from './MessageForm'
import useGlobalStore from '@/store/globalStore'

interface MainChatProps {
  allMessages?: MessageProps[];
  ref: React.RefObject<WebSocket | null>;
}

const MainChat = () => {
  const manager = useGlobalStore();

  useEffect(() => {
    async function getMessages() {
      try {
        const response = await fetch(
          `http://localhost:4000/messages/friendship/${manager.pointedUser?.id}`,
          {
            method: 'GET',
            headers: {
              'Content-type': 'application/json',
            },
          }
        );
        const data: MessageProps[] = await response.json();
        manager.loadMessage(data.reverse());
      } catch (err) {
        console.error('failed to fetch messages');
      }
    }
    let timeout = setTimeout(getMessages, 100);
    return () => clearTimeout(timeout);
  }, [manager.pointedUser?.id]);

  return (
    <div className='relative flex-3 flex flex-col rounded-t-[30] bg-[#B0BBCF]'>
      <div className='flex-1 flex justify-left items-center gap-4 bg-[#92A0BD] rounded-tl-[30] px-14'>
        <div className='size-11 flex justify-center items-end rounded-full bg-gray-200'>
          <Image className='fill-current' alt='user' src={defaultUser} />
        </div>
        <h1 className='text-[24px]'>{manager.pointedUser?.username}</h1>
      </div>
      <div className='flex-15 flex flex-col-reverse py-5 gap-8 wrap-anywhere overflow-scroll'>
        {
          manager.messages.map(msg => (
            <Message key={msg.id} message={msg.content} type={msg.receiver === manager.pointedUser?.friend_id ? 'sent' : 'received'} />
          ))
        }
      </div>
      <MessageForm ></MessageForm>
    </div>
  )
};

export default MainChat;

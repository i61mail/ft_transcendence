'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import defaultUser from '../../../public/defaultUser.svg'
import Message from './Message'
import { MessageProps } from '@/types/chat.types'
import MessageForm from './MessageForm'
import useGlobalStore from '@/store/globalStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface MainChatProps {
  allMessages?: MessageProps[];
  ref: React.RefObject<WebSocket | null>;
}

const MainChat = () => {
  const manager = useGlobalStore();
  const messages = useGlobalStore(state => state.messages);
  const pointedUser = useGlobalStore(state => state.pointedUser);
  const user = useGlobalStore(state => state.user);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  useEffect(() => {
    async function getMessages() {
      try {
        const response = await fetch(
          `${API_URL}/messages/friendship/${pointedUser?.id}?user_id=${user?.id}`,
          {
            method: 'GET',
            credentials: 'include',
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
  }, [pointedUser?.id, user?.id]);

  // Check if user is blocked
  useEffect(() => {
    async function checkBlockStatus() {
      if (!pointedUser?.friend_id || !user?.id) return;
      
      try {
        const response = await fetch(
          `${API_URL}/blocks/${user.id}/check/${pointedUser.friend_id}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-type': 'application/json',
            },
          }
        );
        const data = await response.json();
        setIsBlocked(data.blocked);
      } catch (err) {
        console.error('Failed to check block status');
      }
    }
    checkBlockStatus();
  }, [pointedUser?.friend_id, user?.id]);

  const handleBlockToggle = async () => {
    if (!pointedUser?.friend_id || !user?.id) return;

    try {
      const method = isBlocked ? 'DELETE' : 'POST';
      console.log(`Attempting to ${isBlocked ? 'unblock' : 'block'} user ${pointedUser.friend_id}`);
      
      const response = await fetch(
        `${API_URL}/blocks/${pointedUser.friend_id}`,
        {
          method,
          credentials: 'include',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            blocker_id: user.id
          }),
        }
      );

      console.log('Block toggle response:', response.status, response.ok);
      
      if (response.ok) {
        setIsBlocked(!isBlocked);
        setShowBlockMenu(false);
        console.log(`Successfully ${isBlocked ? 'unblocked' : 'blocked'} user`);
      } else {
        const error = await response.json();
        console.error('Block toggle failed:', error);
        alert(error.error || 'Failed to toggle block');
      }
    } catch (err) {
      console.error('Failed to toggle block:', err);
      alert('Network error while toggling block');
    }
  };

  return (
    <div className='relative flex-3 flex flex-col rounded-t-[30] bg-[#B0BBCF]'>
      <div className='flex-1 flex justify-between items-center gap-4 bg-[#92A0BD] rounded-tl-[30] px-14'>
          <div className='flex items-center gap-4'>
          <div className='size-11 flex justify-center items-center rounded-full bg-gray-200 overflow-hidden'>
            <img 
              src={pointedUser?.avatar_url ? (pointedUser.avatar_url.startsWith('http') ? pointedUser.avatar_url : `${API_URL}${pointedUser.avatar_url}`) : "/default-avatar.png"} 
              alt='user' 
              className='w-full h-full object-cover'
            />
          </div>
          <h1 className='text-[24px]'>{pointedUser?.display_name || pointedUser?.username}</h1>
        </div>        <div className="relative" onMouseLeave={() => setShowBlockMenu(false)}>
          <button
            onClick={() => setShowBlockMenu(!showBlockMenu)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#5A789E] hover:bg-[#4a6888] transition-colors"
            title="Options"
          >
            <span className="text-white text-lg">⋮</span>
          </button>
          
          {showBlockMenu && (
            <div className="absolute right-0 top-full pt-2 w-48 z-20">
              <div className="bg-[#a8b0c5] border-2 border-[#8aabd6] rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={handleBlockToggle}
                  className={`block w-full text-left px-4 py-3 font-pixelify text-sm transition-colors ${
                    isBlocked 
                      ? 'text-green-700 hover:bg-green-100' 
                      : 'text-red-700 hover:bg-red-100'
                  }`}
                >
                  {isBlocked ? '✓ Unblock User' : '🚫 Block User'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='flex-15 flex flex-col-reverse py-5 gap-8 wrap-anywhere overflow-scroll'>
        {
          isBlocked ? (
            <div className="flex items-center justify-center h-full text-gray-600">
              <p className="font-pixelify text-lg">You have blocked this user</p>
            </div>
          ) : (
            messages.map(msg => (
              <Message key={msg.id} message={msg.content} type={msg.receiver === pointedUser?.friend_id ? 'sent' : 'received'} />
            ))
          )
        }
      </div>
      {!isBlocked && <MessageForm isBlocked={isBlocked} />}
    </div>
  )
};

export default MainChat;

'use client'

import React, { useEffect, useRef, useState } from 'react'
import Message from './Message'
import { MessageProps } from '@/types/chat.types'
import MessageForm from './MessageForm'
import useGlobalStore from '@/store/globalStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';


const MainChat = () => {
  const manager = useGlobalStore();
  const messages = useGlobalStore(state => state.messages);
  const pointedUser = useGlobalStore(state => state.pointedUser);
  const user = useGlobalStore(state => state.user);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showInviteButton, setInviteButton] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const rendered = useRef<boolean>(false);
  // Close menu when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
  //       setShowBlockMenu(false);
  //     }
  //   };

  //   if (showBlockMenu) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [showBlockMenu]);

  // useEffect(() => {
  //   async function getMessages() {
  //     try {
  //       const response = await fetch(
  //         `${API_URL}/messages/friendship/${pointedUser?.id}?user_id=${user?.id}`,
  //         {
  //           method: 'GET',
  //           credentials: 'include',
  //           headers: {
  //             'Content-type': 'application/json',
  //           },
  //         }
  //       );
  //       const data: MessageProps[] = await response.json();
  //       console.log("all messsages", data);
  //       manager.loadMessage(data.reverse());
  //     } catch (err) {
  //       console.error('failed to fetch messages');
  //     }
  //   }
  //   let timeout = setTimeout(getMessages, 100);
  //   return () => clearTimeout(timeout);
  // }, [pointedUser?.id, user?.id]);

  // Check if user is blocked
  useEffect(() => {
    if (rendered.current) return;

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
        console.log("all messsages", data);
        manager.loadMessage(data.reverse());
      } catch (err) {
        console.error('failed to fetch messages');
      }
    }

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
        rendered.current = true;
        if (!data.block)
        {
          let timeout = setTimeout(getMessages, 100);
          return () => clearTimeout(timeout);
        }
        else
          setInviteButton(false);
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

  const sendInvite = () =>
  {
    const data = {type: "invite", content: {sender: manager.user?.id, receiver: pointedUser?.friend_id, username: manager.user?.username, friendship_id: manager.pointedUser?.id}};
    if (manager.socket && manager.socket.readyState === WebSocket.OPEN)
    {
      manager.socket.send(JSON.stringify(data));
    }
  }

  return (
    <div className='relative flex-1 flex flex-col backdrop-blur-xl bg-white/10 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 overflow-hidden'>
      {/* Chat Header */}
      <div className='flex justify-between items-center gap-4 p-4 md:px-6 md:py-4 bg-white/10 border-b border-white/10'>
        {/* User Info */}
        <div className='flex items-center gap-3'>
          <div className='w-11 h-11 md:w-12 md:h-12 flex justify-center items-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden ring-2 ring-white/30 shadow-lg'>
            <img 
              src={pointedUser?.avatar_url ? (pointedUser.avatar_url.startsWith('http') ? pointedUser.avatar_url : `${API_URL}${pointedUser.avatar_url}`) : "/default-avatar.png"} 
              alt='user' 
              className='w-full h-full object-cover'
            />
          </div>
          <div>
            <h1 className='font-pixelify text-lg md:text-xl font-bold text-[#2d5a8a]'>
              {pointedUser?.display_name || pointedUser?.username}
            </h1>
            <p className='text-xs text-[#2d5a8a]/60'>
              {manager.onlineUsers.has(pointedUser?.friend_id || 0) ? (
                <span className='flex items-center gap-1'>
                  <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
                  Online
                </span>
              ) : 'Offline'}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div ref={menuRef} className="relative flex items-center gap-2">
          {/* Invite Button */}
          {!isBlocked && showInviteButton && (
            <button 
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={sendInvite}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Invite
            </button>
          )}
          
          {/* Options Menu Button */}
          <button
            onClick={() => setShowBlockMenu(!showBlockMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
            title="Options"
          >
            <svg className="w-5 h-5 text-[#2d5a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showBlockMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 z-20">
              <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl shadow-2xl overflow-hidden">
                {/* Mobile Invite Option */}
                {!isBlocked && (
                  <button
                    onClick={sendInvite}
                    className="sm:hidden flex items-center gap-2 w-full text-left px-4 py-3 font-pixelify text-sm text-[#2d5a8a] hover:bg-white/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Invite to Game
                  </button>
                )}
                <button
                  onClick={handleBlockToggle}
                  className={`flex items-center gap-2 w-full text-left px-4 py-3 font-pixelify text-sm transition-colors ${
                    isBlocked 
                      ? 'text-green-600 hover:bg-green-500/10' 
                      : 'text-red-600 hover:bg-red-500/10'
                  }`}
                >
                  {isBlocked ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Unblock User
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Block User
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className='flex-1 flex flex-col-reverse p-4 md:p-6 gap-4 overflow-y-auto custom-scrollbar'>
        {isBlocked && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <p className="font-pixelify text-lg text-[#2d5a8a]/70">You have blocked this user</p>
            <p className="text-sm text-[#2d5a8a]/50 mt-1">Unblock to continue chatting</p>
          </div>
        )}
        {!isBlocked && (
          messages.filter(msg => msg.inviter !== manager.user?.id).map(msg => (
            <Message key={msg.id} message={msg.content} type={msg.receiver === pointedUser?.friend_id ? 'sent' : 'received'} inviteCode={msg.inviteCode} inviter={msg.inviter} />
          ))
        )}
      </div>
      
      {/* Message Input */}
      {!isBlocked && showInviteButton && <MessageForm isBlocked={isBlocked} />}
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #5ea5e8, #4a7bb8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4a95d8, #3a6ba8);
        }
      `}</style>
    </div>
  )
};

export default MainChat;

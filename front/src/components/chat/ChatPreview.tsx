'use client';

import React, { useEffect, useState } from 'react';
import { FriendshipProps } from '@/types/chat.types';
import useGlobalStore from '@/store/globalStore';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://10.13.10.12:8080/api';

interface Props {
  friend: FriendshipProps;
}

const ChatPreview = (data: Props) => {
  const manager = useGlobalStore();
  const router = useRouter();
  const [notification, setNotification] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [online, setStatus] = useState(false);

  useEffect(() => {
    if (
      manager.latestMessage &&
      manager.latestMessage.friendship_id === data.friend.id && manager.pointedUser?.id !== data.friend.id
    ) {
      setNotification(true);
      manager.updateLatestMessage(null);
    }
  }, [manager.latestMessage]);

  useEffect(() => {
    const isOnline = manager.onlineUsers.has(data.friend.friend_id);
    if (isOnline)
      setStatus(true);
    else
      setStatus(false);
  }, [manager.onlineUsers]);


  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleViewProfile = () => {
    setContextMenu(null);
    router.push(`/profile/${data.friend.friend_id}`);
  };

  const isSelected = manager.pointedUser?.username === data.friend.username;

  return (
    <>
      <div
        onClick={() => {
          setNotification(false);
          manager.changePointedUser(data.friend);
          manager.updateCurrentChat(data.friend.id);
          router.push(`/chats/${data.friend.id}`);
        }}
        onContextMenu={handleContextMenu}
        className={`group relative p-3 rounded-xl flex gap-3 items-center cursor-pointer transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] ${
          isSelected 
            ? 'bg-white/20 border border-white/30 shadow-lg' 
            : 'bg-white/5 border border-transparent'
        } ${notification && 'border-blue-400/50 bg-blue-400/10 animate-pulse'}`}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
            <img 
              src={data.friend.avatar_url ? (data.friend.avatar_url.startsWith('http') ? data.friend.avatar_url : `${API_URL}${data.friend.avatar_url}`) : "/default-avatar.png"} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Online Status Indicator */}
          {online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-[#bcc3d4] shadow-lg">
              <div className="w-full h-full rounded-full bg-green-400 animate-ping opacity-75"></div>
            </div>
          )}
        </div>
        
        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <h2 className={`font-pixelify text-base md:text-lg font-semibold truncate transition-colors duration-300 ${
            isSelected ? 'text-[#2d5a8a]' : 'text-[#2d5a8a]/90'
          }`}>
            {data.friend.display_name || data.friend.username}
          </h2>
        </div>
        
        {/* Notification Badge */}
        {notification && (
          <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg flex-shrink-0"></div>
        )}
        
        {/* Arrow Indicator on Hover */}
        <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSelected ? 'opacity-100' : ''}`}>
          <svg className="w-5 h-5 text-[#2d5a8a]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl shadow-2xl overflow-hidden z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleViewProfile}
            className="flex items-center gap-2 w-full text-left px-4 py-3 font-pixelify text-sm text-[#2d5a8a] hover:bg-white/20 transition-all duration-200 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            View Profile
          </button>
        </div>
      )}
    </>
  );
};

export default ChatPreview;

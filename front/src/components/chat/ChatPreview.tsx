'use client';

import React, { useEffect, useState } from 'react';
import { FriendshipProps } from '@/types/chat.types';
import useGlobalStore from '@/store/globalStore';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Props {
  friend: FriendshipProps;
}

const ChatPreview = (data: Props) => {
  const manager = useGlobalStore();
  const router = useRouter();
  const [latestMessage, setLatestMessage] = useState('');
  const [notification, setNotification] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (
      manager.latestMessage &&
      manager.latestMessage.friendship_id === data.friend.id
    ) {
      setNotification(true);
      manager.updateLatestMessage(null);
    }
  }, [manager.latestMessage]);

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
        className={`h-20 w-full rounded-xl flex px-3 gap-x-5 items-center cursor-pointer ${
          manager.pointedUser?.username === data.friend.username && 'bg-[#B0BBCF]'
        } ${notification && 'border-2 bg-blue-100 border-white'}`}
      >
        <div className="size-[60px] rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <img 
            src={data.friend.avatar_url ? (data.friend.avatar_url.startsWith('http') ? data.friend.avatar_url : `${API_URL}${data.friend.avatar_url}`) : "/default-avatar.png"} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-y-0.5">
          <h1 className="text-[24px]">{data.friend.display_name || data.friend.username}</h1>
          <p className="px-3">{latestMessage}</p>
        </div>
      </div>

      {contextMenu && (
        <div
          className="fixed bg-[#a8b0c5] border-2 border-[#8aabd6] rounded-xl shadow-lg overflow-hidden z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleViewProfile}
            className="block w-full text-left px-4 py-3 font-pixelify text-sm text-black hover:bg-[#8aabd6] hover:text-white transition-colors whitespace-nowrap"
          >
            View Profile
          </button>
        </div>
      )}
    </>
  );
};

export default ChatPreview;

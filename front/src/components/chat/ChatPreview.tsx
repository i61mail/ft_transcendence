'use client';

import React, { useEffect, useState } from 'react';
import { FriendshipProps } from '@/types/chat.types';
import useGlobalStore from '@/store/globalStore';
import { useRouter } from 'next/navigation';

interface Props {
  friend: FriendshipProps;
}

const ChatPreview = (data: Props) => {
  const manager = useGlobalStore();
  const router = useRouter();
  const [latestMessage, setLatestMessage] = useState('');
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    if (
      manager.latestMessage &&
      manager.latestMessage.friendship_id === data.friend.id
    ) {
      setNotification(true);
      manager.updateLatestMessage(null);
    }
  }, [manager.latestMessage]);

  return (
    <div
      onClick={() => {
        setNotification(false);
        manager.changePointedUser(data.friend);
        manager.updateCurrentChat(data.friend.id);
        router.push(`/chats/${data.friend.id}`);
      }}
      className={`h-20 w-full rounded-xl flex px-3 gap-x-5 items-center cursor-pointer ${
        manager.pointedUser?.username === data.friend.username && 'bg-[#B0BBCF]'
      } ${notification && 'border-2 bg-blue-100 border-white'}`}
    >
      <div className="size-[60px] rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-3xl">👤</span>
      </div>
      <div className="flex flex-col gap-y-0.5">
        <h1 className="text-[24px]">{data.friend.username}</h1>
        <p className="px-3">{latestMessage}</p>
      </div>
    </div>
  );
};

export default ChatPreview;

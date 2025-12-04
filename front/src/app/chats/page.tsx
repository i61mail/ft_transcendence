'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useGlobalStore from '@/store/globalStore';
import AllChats from '@/components/chat/AllChats';
import Header from '@/components/Header';
import { FriendshipProps } from '@/types/chat.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ChatPage() {
  const router = useRouter();
  const manager = useGlobalStore();

  useEffect(() => {
    manager.changePointedUser(null);
    manager.setChatIsReady(true);
  }, []);

  
  return (
    <>
        <div className='flex-3 flex items-center justify-center rounded-t-[30] bg-[#B0BBCF]'>
          <div className="text-center">
            <p className="font-pixelify text-2xl text-gray-600 mb-2">No conversation selected</p>
            <p className="font-pixelify text-sm text-gray-500">Select a friend to start chatting</p>
          </div>
        </div>
    </>
  );
}


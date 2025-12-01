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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
        });

        if (!response.ok) {
          router.push('/');
          return;
        }

        const userData = await response.json();
        manager.login(userData.user);

        // Create WebSocket connection
        if (!manager.socket) {
          manager.createSocket();
        }

        // Fetch friendships
        const friendsResponse = await fetch(`${API_URL}/friendships/${userData.user.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const friendsData: FriendshipProps[] = await friendsResponse.json();
        manager.updateFriendList(friendsData);

        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#bcc3d4]">
        <div className="text-xl text-gray-600">Loading chat...</div>
      </div>
    );
  }

  if (!manager.isLogged || !manager.user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#bcc3d4] flex flex-col">
      <Header user={manager.user} onUserUpdate={(user) => manager.login(user)} activeRoute="chat" />

      <div className="flex-1 flex gap-3 p-6">
        <div className="w-[400px]">
          <AllChats />
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#B0BBCF] rounded-2xl">
          <div className="text-center">
            <p className="font-pixelify text-2xl text-gray-600 mb-2">No conversation selected</p>
            <p className="font-pixelify text-sm text-gray-500">Select a friend to start chatting</p>
          </div>
        </div>
      </div>
    </div>
  );
}


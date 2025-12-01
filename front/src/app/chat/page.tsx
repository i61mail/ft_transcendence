'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useGlobalStore from '@/store/globalStore';
import AllChats from '@/components/chat/AllChats';
import ChatsWrapper from '@/components/chat/ChatsWrapper';
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
        manager.createSocket();

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

        // Auto-select first friend if exists
        if (friendsData.length > 0) {
          manager.changePointedUser(friendsData[0]);
          manager.updateCurrentChat(friendsData[0].id);
          router.push(`/chats/${friendsData[0].id}`);
        } else {
          // No friends, stay on /chat
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
      }
    };

    checkAuth();

    return () => {
      // Cleanup WebSocket on unmount
      if (manager.socket) {
        manager.socket.close();
      }
    };
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
    <div className="h-dvh flex gap-3">
      <AllChats />
      <ChatsWrapper chat_id={manager.currentChat} />
    </div>
  );
}

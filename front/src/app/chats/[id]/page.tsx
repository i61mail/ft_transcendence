'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatsWrapper from "@/components/chat/ChatsWrapper";
import AllChats from "@/components/chat/AllChats";
import MainChat from "@/components/chat/MainChat";
import useGlobalStore from "@/store/globalStore";

const Chat = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const manager = useGlobalStore();
  const [chatId, setChatId] = useState<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    let mounted = true;

    params.then(({ id }) => {
      if (!mounted) return;

      const friendshipId = parseInt(id);
      
      // Wait for friends to be loaded
      if (manager.friends.length === 0) {
        return;
      }

      // Check if this friendship exists in the user's friends list
      const friendExists = manager.friends.some(friend => friend.id === friendshipId);
      
      if (!friendExists) {
        // Friend doesn't exist, redirect to first friend
        setIsRedirecting(true);
        if (manager.friends.length > 0) {
          router.replace(`/chats/${manager.friends[0].id}`);
        } else {
          router.replace('/dashboard');
        }
        return;
      }

      // Find and set the pointed user
      const friend = manager.friends.find(f => f.id === friendshipId);
      if (friend && mounted) {
        manager.changePointedUser(friend);
        manager.updateCurrentChat(friendshipId);
        setChatId(friendshipId);
        setIsRedirecting(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [params, manager.friends, router]);

  if (isRedirecting || !chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#B0BBCF] rounded-2xl">
        <div className="text-xl text-gray-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <>
      <AllChats />
      <MainChat />
    </>
  );
};

export default Chat;

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

  useEffect(() => {
    let mounted = true;

    params.then(({ id }) => {
      if (!mounted) return;

      const friendshipId = parseInt(id);
      
      // Wait for friends to be loaded
      if (manager.friends.length === 0) {
        // router.push('/chats');
        return;
      }

      // Check if this friendship exists in the user's friends list
      const friendExists = manager.friends.some(friend => friend.id === friendshipId);
      
      if (!friendExists) {
        // Friend doesn't exist, redirect to first friend
        if (manager.friends.length > 0) {
          router.replace(`/chats/${manager.friends[0].id}`);
        } else {
          router.replace('/chats');
        }
        return;
      }

      // Find and set the pointed user
      const friend = manager.friends.find(f => f.id === friendshipId);
      if (friend && mounted) {
        manager.changePointedUser(friend);
        manager.updateCurrentChat(friendshipId);
      }
    });

    return () => {
      mounted = false;
    };
  }, [params, manager.friends, router]);


  if (manager.friends.length === 0)
  {
    return <></>
  }

  return (
    <>
      <AllChats />
      <MainChat />
    </>
  );
};

export default Chat;

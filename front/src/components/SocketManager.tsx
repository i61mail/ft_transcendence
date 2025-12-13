'use client'
import UserProfilePage from '@/app/profile/[id]/page';
import { getCurrentUser } from '@/lib/api';
import useglobalStore from '@/store/globalStore';
import { FriendshipProps, MessageProps, User } from '@/types/chat.types';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react'

import { useEffect } from "react";

const  SocketManager = () =>
{
    const manager = useglobalStore();
    const router = useRouter();
    const mounted = useRef<Boolean>(false);
    const gameSocketRef = useRef<WebSocket | null>(null);
    
    useEffect(() =>
    {
        if (mounted.current || manager.socket || !manager.user)
        {
            return ;
        }
        else
        {
            console.log("---", manager.socket, manager.user);
            manager.createSocket();
            mounted.current = true;
        }
    }, [manager.socket, manager.user]);

    useEffect(()=>
    {
        if (manager.gameSocket || !manager.user)
            return ;
        const gameSocket = new WebSocket("ws://localhost:4000/sockets/games");
        gameSocket.onopen = () =>
        {
            console.log("game connection----------");
            const init = {gameType: "init"};
            gameSocket?.send(JSON.stringify(init));
            manager.updateGameSocket(gameSocket);
        }

        gameSocket.onclose = () =>
        {
            console.log("closing game socket...");
            gameSocket?.close();
        }

        gameSocket.onmessage = (msg) =>
        {
            const data = JSON.parse(msg.data.toString());
            console.log("GAME: ", data);
        }
        manager.updateGameSocket(gameSocket);
    }, [manager.gameSocket, manager.user])


    useEffect(()=>
    {
        if (manager.user || window.location.pathname === "/")
            return ;
        
        async function getFriends(user: User) {
            const res = await fetch(`http://localhost:4000/friendships/${user?.id}`, {
                credentials: 'include'
            });
            const friends: FriendshipProps[] = await res.json();
            if (friends.length > 0)
            {
              manager.updateFriendList(friends);
            //   manager.changePointedUser(friends[0]);
            //   console.log("first friend", friends[0], manager.user!.id);
            }
        }
        async function retrieve()
        {
            try {
                const userData = await getCurrentUser();
                if (!userData || !userData.user) {
                    // User not authenticated, silently redirect
                    router.push('/');
                    return;
                }
                console.log(userData);
                setTimeout(() => getFriends(userData.user), 300);
                manager.updateUser(userData.user);
            } catch (err) {
                // User not authenticated (expected when accessing protected route without login)
                // Silently redirect without logging error
                router.push('/');
            }
        }
        
        retrieve();
    }, [manager.user])


    useEffect(() => 
    {
        if (manager.socket)
        {
            manager.socket.onmessage = (msg) =>
            {
                const {type, data} = JSON.parse(msg.data);
              
              if (type === "message")
              {
                  const {receiver, sender, content, id, friendship_id} = data;
                  const newMessage: MessageProps = {sender: sender, receiver: receiver, content: content, id: id, friendship_id: friendship_id};
                  
                  // Only ignore if I'm the SENDER (echo back to me)
                  // Accept if I'm the RECEIVER (someone else sent to me)
                  if (sender === manager.user?.id) {
                      return;
                  }
                  
                  if (manager.pointedUser?.id == friendship_id)
                  {
                      manager.addMessage(newMessage);
                  }
                  else
                  {
                    manager.updateLatestMessage(newMessage);
                  }
              }
              else if (type === "friend_online")
              {
                    manager.addOnlineUser(data);
              }
              else if (type === "friend_offline")
              {
                    manager.removeOnlineUser(data);
              }
            }
        }
    }, [manager.pointedUser])

    return (<></>)
};

export default SocketManager
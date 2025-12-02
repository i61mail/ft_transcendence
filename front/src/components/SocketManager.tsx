'use client'
import { getCurrentUser } from '@/lib/api';
import useglobalStore from '@/store/globalStore';
import { FriendshipProps, MessageProps, User } from '@/types/chat.types';
import { useRouter } from 'next/navigation';
import React from 'react'

import { useEffect } from "react";

const  SocketManager = () =>
{
    const manager = useglobalStore();
    const router = useRouter();
    
    useEffect(() =>
    {
        if (manager.socket || !manager.user)
        {
            return ;
        }
        else
        {
            console.log("---", manager.socket, manager.user);
            manager.createSocket();
        }
    }, [manager.socket, manager.user]);


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
              console.log("received ", type, data);
              if (type === "message")
              {
                  const {receiver, sender, content, id, friendship_id} = data;
                  const newMessage: MessageProps = {sender: sender, receiver: receiver, content: content, id: id, friendship_id: friendship_id};
                  if (manager.pointedUser?.id == friendship_id)
                  {
                      manager.addMessage(newMessage);
                  }
                  else
                  {
                    console.log("updating latest message...");
                    manager.updateLatestMessage(newMessage);
                  }
              }
              else if (type === "friend_online")
              {
                  manager.updateUserStatus({id: data, status: true});
              }
              else if (type === "friend_offline")
              {
                  manager.updateUserStatus({id: data, status: false});            
              }
            }
        }
    }, [manager.pointedUser])

    return (<></>)
};

export default SocketManager
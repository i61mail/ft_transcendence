'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import defaultUser from "../../../public/defaultUser.svg"
import { useChatContext } from '@/context/ChatContextProvider';
import { useAuth } from '@/context/AuthProvider';
import { FriendshipProps } from '@/types/common.types';
import { useRouter } from 'next/navigation';
import useglobalStore from '@/context/GlobalStore';

interface Props
{
    friend: FriendshipProps
}


const ChatPreview = (data: Props) => {
    const   manager = useglobalStore();
    const   router = useRouter();
    const   [latestMessage, setLatestMessage] = useState("");
    const   [notification, setNotification] = useState(false);



    useEffect(() => 
    {
        if (manager.latestMessage && manager.latestMessage.friendship_id === data.friend.id)
            setNotification(true);
            manager.updateLatestMessage(null);
        }, [manager.latestMessage])
    // const   currentPointed = useRef<FriendshipProps>(chatContext.pointedUser);
    
    // const getCondition = () => data.friend.id === currentPointed.current?.username;



    // useEffect(() =>
    // {
    //     currentPointed.current = chatContext.pointedUser;
    // }, [chatContext.pointedUser])


    // useEffect(() =>
    // {
    //     if (!messageNotification.current)
    //     {
    //         messageNotification.current = new WebSocket("ws://localhost:4000/sockets/notifications/chatPreview");
    //         messageNotification.current.onopen = () =>
    //         {
    //             let value =  {
    //                 type: "registration",
    //                 sender: data.friend.username,
    //                 receiver: auth.user?.username
    //             }
    //             if (messageNotification.current?.readyState === WebSocket.OPEN)
    //                 messageNotification.current.send(JSON.stringify(value));
    //         }
    //         messageNotification.current.onmessage = (msg) =>
    //         {
    //             const {type, message} = JSON.parse(msg.data.toString());
    //             console.log("receiving noti", message);
    //             setLatestMessage(message);
    //             if (getCondition() === false)
    //                 setNotification(true);
    //         }
    //         messageNotification.current.onerror = (error) => {
    //             console.error('WebSocket error:', error);
    //         };
    //     }
    // },[])

   return (
    <div onClick={() => {
        setNotification(false);
        router.push(`/chats/${data.friend.id}`)
    }} className={`h-20 w-full rounded-xl flex px-3 gap-x-5 items-center ${manager.pointedUser?.username === data.friend.username && "bg-[#B0BBCF]"} ${notification && "border-2 bg-blue-100 border-white"}`}>
        <div className='size-[60] rounded-full bg-gray-200'>
            <Image className="size-fit" src={defaultUser} alt='search icon'/>
        </div>
        <div className='flex flex-col gap-y-0.5'>
            <h1 className='text-[24px]'>{data.friend.username}</h1>
            <p className='px-3'>{latestMessage}</p>
        </div>
    </div>
)
}

export default ChatPreview

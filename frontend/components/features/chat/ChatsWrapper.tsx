"use client"
import React, { useRef, useEffect } from 'react'
import AllChats from './AllChats'
import MainChat from './MainChat'
import { MessageProps } from '@/types/common.types'
import { useAuth } from '../../../context/AuthProvider'
import { useChatContext } from '@/context/ChatContextProvider'


const ChatsWrapper = () => {
  const auth = useAuth();
  const chatContext = useChatContext();
  const socket = useRef<WebSocket | null>(null) ;
  
  useEffect(()=>
  {
    if (!socket.current)
    {
      socket.current = new WebSocket("ws://localhost:4000/sockets/messages");
      socket.current.onopen = () =>
      {
        let data = {
          type: "auth",
          content: auth.user?.username 
        }
        if (socket.current?.readyState === WebSocket.OPEN)
          socket.current.send(JSON.stringify(data));
      }
      socket.current.onmessage = (msg)=>
      {
        const {receiver, sender, content, id} = JSON.parse(msg.data);
        const newMessage: MessageProps = {sender: sender, receiver: receiver, content: content, id: id}
        console.log("adding new message", newMessage);
        chatContext.updateMessages((previous) => [newMessage, ...previous]);
      }
      socket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  },[])

  return (   
    auth.isLogged && auth.user && <>
        <div className='h-dvh flex gap-3'>
          <AllChats />
          <MainChat ref={socket}/>
        </div>
    </>
  )
}

export default ChatsWrapper

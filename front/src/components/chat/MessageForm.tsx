import React, { useState } from 'react'
import Image from 'next/image'
import SendButton from '../../../public/sendButton.svg'
import useGlobalStore from '@/store/globalStore'
import { API_URL } from '@/lib/api'

interface MessageFormProps {
  isBlocked?: boolean;
}

const MessageForm = ({ isBlocked = false }: MessageFormProps) => {
  const manager = useGlobalStore();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const sendMessage = async (data: FormData) => {
    setErrorMessage(''); // Clear previous errors

    let value = data.get('message');
    if (!value) return;
    
    try {
      value = value.toString();
      let response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          friendship_id: manager.pointedUser?.id,
          receiver: manager.pointedUser?.friend_id,
          sender: manager.user?.id,
          content: value,
        }),
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMessage(error.error || 'Failed to send message');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      const responseData = await response.json();
      console.log('sending message to', manager.pointedUser, responseData);
      
      // Clear the input field
      const form = (data as any).target;
      if (form) form.reset();
      
      // add message locally so UI updates immediately
      try {
        manager.addMessage({
          id: responseData.id,
          sender: responseData.sender,
          receiver: responseData.receiver,
          content: responseData.content,
          friendship_id: responseData.friendship_id,
        });
      } catch (e) {
        // ignore if store update fails
      }
      let reply = { type: 'message', content: responseData };
      if (manager.socket?.readyState === WebSocket.CLOSED) {
        setErrorMessage('Unexpected socket disconnection');
        setTimeout(() => setErrorMessage(''), 3000);
      } else if (manager.socket?.readyState === WebSocket.OPEN) {
        manager.socket?.send(JSON.stringify(reply));
      }
    } catch (err) {
      setErrorMessage(String(err));
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className='flex-1 flex flex-col'>
      {errorMessage && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm font-pixelify mx-14 mb-2 rounded'>
          {errorMessage}
        </div>
      )}
      <form action={sendMessage} className='flex justify-between items-center gap-4 bg-[#92A0BD] px-14 pb-4'>
        <div className='flex-8'>
          <input 
            name='message' 
            type="text" 
            placeholder='Type a message'
            className='text-[20px] text-black rounded-full w-full h-13 bg-white outline-none px-6'
          />
        </div>
        <div className='size-13 bg-white rounded-full flex justify-center items-center'>
          <button type='submit'>
            <Image className='size-8' src={SendButton} alt='send button' />
          </button>
        </div>
      </form>
    </div>
  )
};

export default MessageForm;

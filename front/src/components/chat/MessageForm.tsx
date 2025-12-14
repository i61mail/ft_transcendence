import React, { useState } from 'react'
import useGlobalStore from '@/store/globalStore'
import { API_URL } from '@/lib/api'

interface MessageFormProps {
  isBlocked?: boolean;
}

const MessageForm = ({ isBlocked = false }: MessageFormProps) => {
  const manager = useGlobalStore();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [inputValue, setInputValue] = useState('');

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    if (!inputValue.trim()) return;
    
    try {
      let response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          friendship_id: manager.pointedUser?.id,
          receiver: manager.pointedUser?.friend_id,
          sender: manager.user?.id,
          content: inputValue,
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
      console.log('Message sent successfully:', responseData);
      console.log('Current pointed user:', manager.pointedUser);
      
      // Clear the input field
      setInputValue('');
      
      // Add message locally so UI updates immediately
      const newMessage = {
        id: responseData.id,
        sender: responseData.sender,
        receiver: responseData.receiver,
        content: responseData.content,
        friendship_id: responseData.friendship_id,
        inviteCode: responseData.inviteCode || null,
        inviter: responseData.inviter || null,
      };
      
      console.log('Adding message to local state:', newMessage);
      manager.addMessage(newMessage);
      console.log('Message added, current messages count:', manager.messages.length);
      
      // Send via WebSocket to notify the receiver
      let reply = { type: 'message', content: newMessage };
      if (manager.socket?.readyState === WebSocket.CLOSED) {
        setErrorMessage('Unexpected socket disconnection');
        setTimeout(() => setErrorMessage(''), 3000);
      } else if (manager.socket?.readyState === WebSocket.OPEN) {
        manager.socket?.send(JSON.stringify(reply));
        console.log('Message sent via WebSocket');
      }
    } catch (err) {
      setErrorMessage(String(err));
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className='p-4 md:p-6 border-t border-white/10'>
      {/* Error Message */}
      {errorMessage && (
        <div className='flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-2 text-sm font-pixelify mb-3 rounded-xl backdrop-blur-sm'>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMessage}
        </div>
      )}
      
      {/* Input Form */}
      <form onSubmit={sendMessage} className='flex items-center gap-3'>
        <div className='flex-1 relative'>
          <input 
            name='message'
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder='Type a message...'
            className='w-full h-12 md:h-14 px-5 pr-12 text-sm md:text-base text-[#2d5a8a] bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 outline-none placeholder-[#2d5a8a]/50 focus:bg-white/15 focus:border-blue-400/50 transition-all duration-300'
          />
        </div>
        
        {/* Send Button */}
        <button 
          type='submit'
          disabled={!inputValue.trim()}
          className='w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 transition-all duration-300'
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
};

export default MessageForm;

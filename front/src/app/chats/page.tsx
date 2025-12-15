'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useGlobalStore from '@/store/globalStore';
import AllChats from '@/components/chat/AllChats';
import Header from '@/components/Header';
import { FriendshipProps } from '@/types/chat.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8080/api';

export default function ChatPage() {
  const router = useRouter();
  const manager = useGlobalStore();

  useEffect(() => {
    manager.changePointedUser(null);
    manager.setChatIsReady(true);
  }, []);

  
  return (
    <>
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-white/10 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg className="w-full h-full" width="100%" height="100%">
            <pattern id="chat-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="currentColor" />
              <path d="M0 20h40M20 0v40" stroke="currentColor" strokeWidth="0.3" opacity="0.5" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#chat-pattern)" />
          </svg>
        </div>

        {/* Animated Background Blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="relative z-10 text-center max-w-md mx-auto">
          {/* Icon */}
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
            <svg 
              className="w-10 h-10 md:w-12 md:h-12 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
          </div>
          {/* Title */}
          { <h2 className="font-pixelify text-2xl md:text-3xl font-bold text-[#2d5a8a] mb-3">
            Select a Conversation
          </h2> }
        {/* Decorative Bouncing Dots */}
        { <div className="flex justify-center gap-3 mb-8 mt-10">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div> }
        </div>

      </div>
    </>)
}



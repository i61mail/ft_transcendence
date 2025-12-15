'use client'
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useGlobalStore from "@/store/globalStore";
import Header from "@/components/Header";
import AllChats from "@/components/chat/AllChats";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8080/api';

export default function ChatsLayout({children}: {children: React.ReactNode})
{
    const manager = useGlobalStore();
    const router = useRouter();   

    useEffect(()=>
    {
      const checkAuth = async () => {
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include',
          });

          if (!response.ok) {
            router.push('/');
            return;
          }

        } catch (error) {
          console.error('Auth check failed:', error);
          router.push('/');
        }
      };

      checkAuth();
    }, []);

    return (
    manager.user && <>
      <div className="h-screen w-full bg-gradient-to-br from-[#c8d5e8] via-[#bcc3d4] to-[#a8b0c5] flex flex-col overflow-hidden relative">
        {/* Animated Background Blobs */}
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob top-0 -left-20 pointer-events-none"></div>
        <div className="absolute w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-blob bottom-0 right-0 pointer-events-none" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-blob top-1/2 left-1/2 pointer-events-none" style={{ animationDelay: '4s' }}></div>
        
        {/* Header */}
        <div className="relative z-20">
          <Header user={manager.user} onUserUpdate={(user) => manager.updateUser(user)} activeRoute="chat" />
        </div>
        
        {/* Main Content Area */}
        <div className='flex-1 flex gap-4 p-4 md:p-6 overflow-hidden relative z-10'>
          {/* Sidebar - Chat List (Hidden on small screens) */}
          {manager.chatIsReady && (
            <div className={`hidden md:block md:w-80 lg:w-96 flex-shrink-0 backdrop-blur-xl bg-white/10 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300`}>
              <AllChats />
            </div>
          )}
          
          {/* Main Chat Area (Always visible when pointedUser exists) */}
          <div className={`flex-1 min-w-0 ${manager.pointedUser ? 'flex' : 'hidden md:flex'}`}>
            {children}
          </div>
        </div>
      </div>
      
      {/* Global Animations */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite ease-in-out;
        }
      `}</style>
    </>
  )
}

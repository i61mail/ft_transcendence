'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useGlobalStore from "@/store/globalStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function chatsLayout({children}: {children: React.ReactNode})
{
    const manager = useGlobalStore();
    const router = useRouter();   
    const [loading, setLoading] = useState(true);

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

          const userData = await response.json();
          manager.login(userData.user);

          // Fetch and set up WebSocket if not already done
          if (!manager.socket) {
            manager.createSocket();
          }

          // Fetch friendships
          const friendsResponse = await fetch(`${API_URL}/friendships/${userData.user.id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const friendsData = await friendsResponse.json();
          manager.updateFriendList(friendsData);

          setLoading(false);
        } catch (error) {
          console.error('Auth check failed:', error);
          router.push('/');
        }
      };

      checkAuth();
    }, []);

    if (loading) {
      return (
        <div className="h-screen flex items-center justify-center bg-[#bcc3d4]">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      );
    }

    return (
    manager.isLogged && manager.user && <>
            <div className="min-h-screen bg-[#bcc3d4] flex flex-col">
              <header className="bg-[#bcc3d4] h-[85px] flex items-center justify-between px-8 border-b-2 border-[#8aabd6]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <span className="text-[#2d5a8a] text-6xl font-serif font-bold" style={{ fontFamily: "Pixelify Sans, sans-serif" }}>𝕭</span>
                  </div>
                  <h1 className="font-pixelify text-3xl font-bold text-black">ANANA</h1>
                </div>

                <nav className="flex items-center gap-50">
                  <button onClick={() => router.push('/dashboard')} className="font-pixelify text-lg text-black hover:text-[#5A789E] transition-colors">HOME</button>
                  <button className="font-pixelify text-lg text-black hover:text-[#5A789E] transition-colors flex items-center gap-2 border-b-2 border-[#5A789E] pb-1">
                    <span className="w-2 h-2 bg-[#5A789E] rounded-full"></span>
                    CHAT
                  </button>
                  <button className="font-pixelify text-lg text-black hover:text-[#5A789E] transition-colors">GAME</button>
                </nav>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-400 ring-2 ring-[#5A789E]">
                      <img src={manager.user.avatar_url ? (manager.user.avatar_url.startsWith('http') ? manager.user.avatar_url : `${API_URL}${manager.user.avatar_url}`) : "/default-avatar.png"} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="font-pixelify text-lg font-semibold text-black">{manager.user.display_name || manager.user.username}</p>
                      <p className="text-sm text-gray-600">{manager.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="relative w-10 h-10 bg-[#5A789E] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <span className="text-xl">🔔</span>
                      <span className="absolute top-0 right-0 w-3 h-3 bg-[#5A789E] rounded-full border-2 border-white"></span>
                    </button>

                    <button className="w-10 h-10 bg-[#5A789E] rounded-full flex items-center justify-center hover:bg-[#4a6888] transition-colors border-2 border-[#8aabd6] shadow-sm">
                      <span className="text-xl">⚙️</span>
                    </button>
                  </div>
                </div>
              </header>

              <div className='flex-1 flex gap-3 overflow-hidden'>
                  {children}
              </div>
            </div>
    </>
  )
}

'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useGlobalStore from "@/store/globalStore";
import Header from "@/components/Header";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function chatsLayout({children}: {children: React.ReactNode})
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
            <div className="min-h-screen bg-[#bcc3d4] flex flex-col">
              <Header user={manager.user} onUserUpdate={(user) => manager.updateUser(user)} activeRoute="chat" />
              <div className='h-dvh bg-[#bcc3d4] flex gap-3 mt-6'>
                  {children}
              </div>
            </div>
    </>
  )
}

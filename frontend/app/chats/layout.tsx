'use client'
import React, { useEffect } from "react";
import { useAuth } from '../../context/AuthProvider'
import { useRouter } from "next/navigation";
import { GlobalContexProvider } from "@/context/GLobalContextProvider";
import useglobalStore from "@/context/GlobalStore";

export default function chatsLayout({children}: {children: React.ReactNode})
{
    const manager = useglobalStore();
    const router = useRouter();   

    useEffect(()=>
    {
      if (!manager.isLogged)
          router.push('/');
    }, [manager, router]);

    return (
    manager.isLogged && manager.user && <>
            <div className='h-dvh flex gap-3'>
                {children}
            </div>
    </>
  )
}
'use client'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import AlertModal from './AlertModal';

interface Message {
  message: string;
  type: string;
  inviteCode: string | null,
  inviter: number
}

const Message = (msg: Message) => {

  const router = useRouter();  

  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });

  const closeAlert = () => setAlertState({ ...alertState, isOpen: false });


  const joinGame = (code: string) =>
  {
            async function checkInviteExistence() {
        try
        {
          const check = await fetch(`http://localhost:4000/invite?code=${code}`);
          if (check.ok)
          {
            console.log("check", check);
            router.push(`/games/invite?code=${encodeURIComponent(code)}`);
          }
          else
          {
            const error = await check.json();
            setAlertState({ 
            isOpen: true, 
            message: error.message || "Something went wrong" 
            });
          }
          }
        catch (err)
        {
            console.log(err);
              setAlertState({ 
              isOpen: true, 
              message: "Could not connect to the server."});
            }
        }
        checkInviteExistence();
  }

  const isSent = msg.type === "sent";
  const isInvite = !!msg.inviteCode;

  return (
    <div className={`w-full flex ${isSent ? "justify-end" : "justify-start"} px-2 md:px-4`}>
      <div 
        className={`
          max-w-[85%] sm:max-w-[70%] md:max-w-[60%] 
          px-4 py-3 
          ${isInvite 
            ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20"
            : isSent 
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20" 
              : "bg-white/20 backdrop-blur-sm text-[#2d5a8a] border border-white/30"
          } 
          ${isSent ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md"}
          transition-all duration-300 hover:scale-[1.02]
        `}
      >
        <p className="text-sm md:text-base break-words leading-relaxed">
          {msg.message}
          {isInvite && (
            <button 
              onClick={() => joinGame(msg.inviteCode!)} 
              className="inline-flex items-center gap-1 ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Join Game
            </button>
          )}
        </p>
      </div>
      <AlertModal
          isOpen={alertState.isOpen} 
          message={alertState.message} 
          onClose={closeAlert}>
      </AlertModal>
    </div>

  );
};

export default Message;

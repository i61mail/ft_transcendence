'use client'
import { error } from 'console';
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

  return (
    <div className={`w-full h-auto flex ${msg.type === "sent" && "flex-row-reverse"} px-4`}>
      <div className={`w-[40%] p-3 items-end h-auto     ${msg.inviteCode 
      ? "bg-violet-600 text-white"  // New Invite Color
      : msg.type === "sent" 
        ? "bg-[#7d8fb8] text-white" // Your Original Sent Color
        : "bg-gray-200 text-black"  // Your Original Received Color
    } rounded-md`}>
        <p>{msg.message}{msg.inviteCode && <a onClick={()=>joinGame(msg.inviteCode!)} className='className="font-bold text-green-400 hover:text-yellow-100 underline cursor-pointer ml-1 decoration-2 underline-offset-2"'>join now</a>}</p>
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

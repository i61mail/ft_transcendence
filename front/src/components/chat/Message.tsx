import React from 'react';

interface Message {
  message: string;
  type: string;
}

const Message = (msg: Message) => {
  return (
    <div className={`w-full h-auto flex ${msg.type === "sent" && "flex-row-reverse"} px-4`}>
      <div className={`w-[40%] p-3 items-end h-auto ${msg.type === "sent" ? "bg-[#7d8fb8] text-white" : "bg-gray-200 text-black"} rounded-md`}>
        <p>{msg.message}</p>
      </div>
    </div>
  );
};

export default Message;

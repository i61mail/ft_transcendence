import React, { use } from 'react'
import Image from 'next/image'
import SendButton from "../../../public/sendButton.svg"
import { useAuth } from '@/context/AuthProvider'
import { useChatContext } from '@/context/ChatContextProvider'


interface MessageFormProps
{
    ref:React.RefObject<WebSocket | null>
}


const MessageForm = (user: MessageFormProps) => {
    
    const chatContext = useChatContext();
    const auth = useAuth();

    
    const sendMessage = async (data:FormData) =>
        {
            let value = data.get("message");
            if (!value)
                return ; 
            try
            { 
                value = value.toString();
                let response = await fetch('http://localhost:4000/messages',
                {
                    method: "POST",
                    body: JSON.stringify({
                        friendship_id: chatContext.pointedUser?.id,
                        receiver: chatContext.pointedUser?.username,
                        sender: auth.user?.username,
                        content: value,
                    }),
                    headers: {
                        'Content-type' : 'application/json'
                    }
                })
                response  = await response.json();
                console.log("sending message to", chatContext.pointedUser);
                let reply = {type: "message", content: response};
                if (user.ref.current?.readyState === WebSocket.CLOSED)
                    alert("unexpected socket disconnection")
                else if (user.ref.current?.readyState === WebSocket.OPEN)
                    user.ref.current?.send(JSON.stringify(reply));
            }   
            catch (err)
            {
                alert(err);
            }
        }    

  return (
    <form action={sendMessage} className='flex-1 flex justify-between items-center gap-4 absolute left-0 bottom-0 h-[9%] w-full bg-[#92A0BD] px-14'>
        <div className='flex-8'>
            <input name='message' type="text" placeholder='Type a message' className='text-[20px] rounded-full w-full h-13 bg-white outline-none px-6'/>
        </div>
        <div className='size-13 bg-white rounded-full flex justify-center items-center'>
            <button type='submit'><Image className='size-8' src={SendButton} alt='send button'/></button>
        </div>
    </form>
)
}

export default MessageForm

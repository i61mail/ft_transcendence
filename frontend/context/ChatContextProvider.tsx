"use client"
import { useContext, createContext, useState } from "react";
import { MessageProps, UserProps } from "@/types/common.types";
import type { FriendshipProps } from "@/components/features/chat/AllChats";

interface ChatContextProps 
{
    filter: string,
    pointedUser: FriendshipProps | null,
    friends: FriendshipProps[],
    messages: MessageProps[],
    changeFilter: (filter: string) => void,
    changePointedUser: (newPointedUser: FriendshipProps) => void,
    updateFriendList: (friends: FriendshipProps[]) => void,
    updateMessages: (messages: React.SetStateAction<MessageProps[]>) => void
}

const ChatContext = createContext<ChatContextProps>({
    filter: "",
    pointedUser: null,
    friends: [],
    messages: [],
    changeFilter: () => {},
    changePointedUser: () => {},
    updateFriendList: () => {},
    updateMessages: () => {}
})


const ChatContextProvider = ({ children }: {children: React.ReactNode}) =>
{
  const [filter, setFilter]     =     useState("");
  const [pointedUser, setPointedUser]     =     useState<FriendshipProps | null>(null);
  const [friends, setFriends]     =     useState<FriendshipProps[]>([]);
  const [messages, setMessages] = useState<MessageProps[]>([]);

  const changeFilter = (filter:string) =>
    {
        setFilter(filter);
    }
  
    const changePointedUser = (newPointedUser:FriendshipProps) =>
    {
        if (newPointedUser !== pointedUser)
            updateMessages([]);
        setPointedUser(newPointedUser);
    }
    
    const updateFriendList = (friends: FriendshipProps[]) =>
    {
        setFriends(friends);
    }

    const updateMessages = (messages: React.SetStateAction<MessageProps[]>) =>
    {
        setMessages(messages);
    }

    return (
        <ChatContext.Provider value={{filter, pointedUser, friends, messages, updateFriendList, changeFilter, changePointedUser, updateMessages}}>
            {children}
        </ChatContext.Provider>
    )
}

export default ChatContextProvider;

export const useChatContext = () =>
{
    return (useContext(ChatContext));
}
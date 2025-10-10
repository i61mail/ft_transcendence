import React, { useEffect } from 'react'
import ChatPreview from './ChatPreview'
import SearchBar from './SearchBar';
import { useChatContext } from '@/context/ChatContextProvider';
import { useAuth } from '@/context/AuthProvider';
import { FriendshipProps } from '@/types/common.types';

const AllChats = () => 
{
    const chatContext = useChatContext();
    const auth = useAuth();
    useEffect(()=>
        {
            async function getFriends() {
                const res = await fetch(`http://localhost:4000/friendships/${auth.user?.id}`);
                const friends: FriendshipProps[] = await res.json();
                if (friends.length > 0)
                {
                    chatContext.updateFriendList(friends);
                    if (chatContext.pointedUser === null)
                        chatContext.changePointedUser(friends[0]);       
                }
            }
            getFriends();
        }, [])

    const filteredData:FriendshipProps[] = chatContext.filter.length > 0 ? chatContext.friends.filter((data) => data.username.toLocaleLowerCase().includes(chatContext.filter.toLocaleLowerCase())) : chatContext.friends;
    return (
        <div className='flex-1 h-full rounded-t-[30] bg-linear-to-t to-[#93A1BF] from-[#4D658100] padding px-6 py-8 flex flex-col gap-y-5'>
            <h1 className='text-[24px]'>ALL CHATS</h1>
            <SearchBar />
            <div className='flex flex-col gap-y-5 h-full overflow-y-scroll'>
                {
                    filteredData.map((v:FriendshipProps) =>
                        {
                            return (<ChatPreview key={v.id} friend={v}/>)
                        }
                    )
                }
            </div>
        </div>
    )
}

export default AllChats

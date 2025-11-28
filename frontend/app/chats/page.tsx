'use client'
import ChatsWrapper from "../../components/features/chat/ChatsWrapper";
// import { UserProps } from "../../components/features/chat/AllChats";
import { MessageProps } from "@/types/common.types";
import ChatContextProvider, { useChatContext } from "../../context/ChatContextProvider";
import {useEffect, useRef} from 'react'
import {FriendshipProps} from "../../types/common.types"
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import useglobalStore from "@/context/GlobalStore";
import { useGlobalContext } from "@/context/GLobalContextProvider";


const page =  () => {
	const router = useRouter();
	const {user, updateFriendList, changePointedUser} = useglobalStore();


  	useEffect(()=>
	{
		async function getFriends() {
		  const res = await fetch(`http://localhost:4000/friendships/${user?.id}`);
		  const friends: FriendshipProps[] = await res.json();
		  if (friends.length > 0)
		  {
			updateFriendList(friends);
			changePointedUser(friends[0]);
			console.log("routing to first chat");
			router.push(`/chats/${friends[0].id}`)
		  }
		}
		getFriends();
	}, [])


  return (
	  <>
    </>
  );
};



export default page;

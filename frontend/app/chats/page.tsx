import ChatsWrapper from "../../components/features/chat/ChatsWrapper";
import { UserProps } from "../../components/features/chat/AllChats";
import { MessageProps } from "../../components/features/chat/MainChat";
import ChatContextProvider from "../../context/ChatContextProvider";
import { useAuth } from "@/context/AuthProvider";

// const fetchFriends = async () => {
// 	try
// 	{
// 		const res = await fetch(`http://localhost:4000/friendships/1`);
// 		const data = await res.json();
// 		return data;
// 	}
// 	catch(err)
// 	{
// 		console.error("failed to fetch friend lists")
// 	}
// };

// const fetchAllMessages = async () => {
// 	try
// 	{

// 		const response = await fetch("http://localhost:4000/messages/1", {
// 		  method: "GET",
// 		  headers: {
// 			"Content-type": "application/json",
// 		  },
// 		});
// 		const data: MessageProps[] = await response.json();
// 		return data;
// 	}
// 	catch (err)
// 	{
// 		console.error("failed to fetch messages")
// 	}
// };

const page = async () => {
  	// const data: UserProps[] = await fetchFriends();
  	// const messages: MessageProps[] = await fetchAllMessages();

  return (
	  <>
		<ChatContextProvider>
			<ChatsWrapper  />
		</ChatContextProvider>
    </>
  );
};

export default page;

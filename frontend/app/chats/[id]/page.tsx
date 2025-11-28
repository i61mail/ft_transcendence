import ChatsWrapper from "@/components/features/chat/ChatsWrapper";
import AllChats from "@/components/features/chat/AllChats"
import useglobalStore from "@/context/GlobalStore";

const chat = async ({params}: {params: Promise<{id: number}>}) =>
{
    const {id} = await params;
    return (
    <>
            <AllChats />
            <ChatsWrapper chat_id={id}/>
    </>
)
};

export default chat;
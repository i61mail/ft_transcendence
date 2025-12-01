import ChatsWrapper from "@/components/chat/ChatsWrapper";
import AllChats from "@/components/chat/AllChats";
import MainChat from "@/components/chat/MainChat";

const chat = async ({ params }: { params: Promise<{ id: number }> }) => {
  const { id } = await params;
  return (
    <>
    <ChatsWrapper chat_id={id}/>
    <AllChats />
    <MainChat />
      {/* <ChatsWrapper chat_id={id} /> */}
    </>
  );
};

export default chat;

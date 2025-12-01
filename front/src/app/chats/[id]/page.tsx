import ChatsWrapper from "@/components/chat/ChatsWrapper";
import AllChats from "@/components/chat/AllChats";

const chat = async ({ params }: { params: Promise<{ id: number }> }) => {
  const { id } = await params;
  return (
    <>
      <AllChats />
      <ChatsWrapper chat_id={id} />
    </>
  );
};

export default chat;

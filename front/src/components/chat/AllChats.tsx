'use client';
import React from 'react';
import ChatPreview from './ChatPreview';
import SearchBar from './SearchBar';
import useGlobalStore from '@/store/globalStore';
import { FriendshipProps } from '@/types/chat.types';

const AllChats = () => {
  const { friends, searchFilter } = useGlobalStore();

  const filteredData: FriendshipProps[] =
    searchFilter.length > 0
      ? friends.filter((data) =>
          data.username.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase())
        )
      : friends;

  return (
    <div className="flex-1 h-full rounded-t-[30] bg-linear-to-t to-[#93A1BF] from-[#4D658100] padding px-6 py-8 flex flex-col gap-y-5">
      <h1 className="text-[24px]">ALL CHATS FOR</h1>
      <SearchBar />
      <div className="flex flex-col gap-y-5 h-full overflow-y-scroll">
        {filteredData.map((v: FriendshipProps) => {
          return <ChatPreview key={v.id} friend={v} />;
        })}
      </div>
    </div>
  );
};

export default AllChats;

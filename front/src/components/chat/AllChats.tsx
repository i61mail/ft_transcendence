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
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="p-4 md:p-6 border-b border-white/10">
        {/* Title */}
        <h1 className="font-pixelify text-xl md:text-2xl font-bold text-[#2d5a8a] mb-4">All Chats</h1>
        
        {/* Search Bar */}
        <SearchBar />
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 custom-scrollbar">
        {filteredData.length > 0 ? (
          filteredData.map((v: FriendshipProps) => (
            <ChatPreview key={v.id} friend={v} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#2d5a8a]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="font-pixelify text-[#2d5a8a]/70 text-sm">No chats found</p>
            <p className="text-[#2d5a8a]/50 text-xs mt-1">Try a different search</p>
          </div>
        )}
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #5ea5e8, #4a7bb8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4a95d8, #3a6ba8);
        }
      `}</style>
    </div>
  );
};

export default AllChats;

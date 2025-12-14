import React from 'react';
import useGlobalStore from '@/store/globalStore';

const SearchBar = () => {
  const { changeFilter } = useGlobalStore();
  return (
    <div className="h-11 w-full px-4 bg-white/10 backdrop-blur-sm rounded-xl flex gap-3 items-center border border-white/20 hover:bg-white/15 focus-within:bg-white/15 focus-within:border-blue-400/50 transition-all duration-300 group">
      <svg 
        className="w-5 h-5 text-[#2d5a8a]/60 group-focus-within:text-blue-500 transition-colors duration-300" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        onChange={(event) => changeFilter(event.target.value)}
        className="outline-none w-full text-sm md:text-base bg-transparent text-[#2d5a8a] placeholder-[#2d5a8a]/50 font-medium"
        type="text"
        placeholder="Search conversations..."
      />
    </div>
  );
};

export default SearchBar;

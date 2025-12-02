import React from 'react';
import useGlobalStore from '@/store/globalStore';

const SearchBar = () => {
  const { changeFilter } = useGlobalStore();
  return (
    <div className="h-10 w-full px-4 bg-[#BEC7DA] rounded-full flex gap-2 items-center">
      <span className="text-xl">🔍</span>
      <input
        onChange={(event) => changeFilter(event.target.value)}
        className="outline-none w-full text-[20px] bg-transparent"
        type="text"
        placeholder="Search"
      />
    </div>
  );
};

export default SearchBar;

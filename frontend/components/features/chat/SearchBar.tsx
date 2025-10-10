import React from 'react'
import Image from 'next/image'
import search from "../../../public/search.svg"
import { useChatContext } from '@/context/ChatContextProvider';

const SearchBar = () => {
  const chatContext = useChatContext();
  return (
    <div className='h-10 w-full px-4 bg-[#BEC7DA] rounded-full flex gap-2'>
    <Image src={search} alt='search icon'/>
    <input onChange={(event)=>chatContext.changeFilter(event.target.value)} className='outline-none w-full text-[20px]' type='text' placeholder="Search"/>
</div>
)
}

export default SearchBar

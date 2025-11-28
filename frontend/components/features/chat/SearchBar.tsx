import React from 'react'
import Image from 'next/image'
import search from "../../../public/search.svg"
import useglobalStore from '@/context/GlobalStore';

const SearchBar = () => {
  const {changeFilter} = useglobalStore();
  return (
    <div className='h-10 w-full px-4 bg-[#BEC7DA] rounded-full flex gap-2'>
    <Image src={search} alt='search icon'/>
    <input onChange={(event)=>changeFilter(event.target.value)} className='outline-none w-full text-[20px]' type='text' placeholder="Search"/>
</div>
)
}

export default SearchBar

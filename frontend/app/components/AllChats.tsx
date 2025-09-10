"use client"
import React from 'react'
import Image from 'next/image'
import { useState } from 'react'
import search from "../../public/search.svg"
const AllChats = () => {
    const [val,setVal] = useState("");

    const change = (event:any) =>
    {
        setVal(event.target.value);
    }
    return (
        <div className='flex-1 h-full rounded-t-[30] bg-linear-to-t to-[#93A1BF] from-[#4D658100] padding px-8 py-8'>
            <div className='flex flex-col gap-y-5 '>
                <h1 className='text-[24px]'>ALL CHATS</h1>
                
                {/* Create seperate component for search bar */}
                
                <div className='h-10 w-full px-2 bg-[#BEC7DA] rounded-full flex gap-2'>
                    <Image src={search} alt='search icon'/>
                    <input className='outline-none w-full text-[20px]' value={val} onChange={change} placeholder="Search"/>
                </div>

                {/* Create seperate component for each conversation preview */}
            </div>
        </div>
    )
}

export default AllChats

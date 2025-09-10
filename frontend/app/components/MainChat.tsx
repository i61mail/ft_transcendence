import React from 'react'
import Image from 'next/image'
import defaultUser from "../../public/defaultUser.svg"
import SendButton from "../../public/sendButton.svg"

const MainChat = () => {
  return (
    <div className='relative flex-3 h-full rounded-t-[30] bg-[#B0BBCF]'>
        <div className='flex justify-left items-center gap-4 absolute left-0 top-0 h-22 w-full bg-[#92A0BD] rounded-t-[30] px-14'>
            <div className='size-11 flex justify-center items-end rounded-full bg-gray-200'>
                <Image className='fill-current' alt='user' src={defaultUser}/>
            </div>
            <h1 className='text-[24px]'>Name</h1>
        </div>

        <div className='flex justify-between items-center gap-4 absolute left-0 bottom-0 h-25 w-full bg-[#92A0BD] px-14'>
            {/* <div className='flex-1'>

            </div> */}
            <div className='flex-8'>
                <input type="text" placeholder='Type a message' className='text-[20px] rounded-full w-full h-13 bg-white outline-none px-6'/>
            </div>
            <div className='size-13 bg-white rounded-full flex justify-center items-center'>
                <Image className='size-8' src={SendButton} alt='send button'/>
            </div>

        </div>
    </div>  
  )
}

export default MainChat

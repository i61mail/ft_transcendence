import React from 'react'
import Image from 'next/image'
import defaultUser from "../../../public/defaultUser.svg"
import type { CurrentUser } from '@/types/common.types'


const CurrentUser = (user: CurrentUser) => {
  return (
    <div className='flex items-center gap-x-4 text-[20px] font-[400]'>
      <div className='size-15 flex justify-center items-end rounded-full bg-gray-200'>
        <Image className='fill-current' alt='user' src={defaultUser}/>
      </div>
      <div>
        {/* <p>{user.name}</p> */}
        <p className='text-slate-500'>{user.username}</p>
      </div>
    </div>
  )
}

export default CurrentUser

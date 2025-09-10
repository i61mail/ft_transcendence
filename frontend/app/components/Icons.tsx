import React from 'react'
import Image from 'next/image'
import notificationIcon from "../../public/notification.svg"
import settings from "../../public/settings.svg"

const Icons = () => {
  return (
    <div className='flex justify-content gap-x-4'>
      <div className='size-10 flex justify-center items-center border-1 rounded-full border-black bg-white'> 
        <Image className='size-7' src={notificationIcon} alt='notification icon'/>
      </div>
      <div className='size-10 flex justify-center items-center border-1 rounded-full border-black bg-white'> 
        <Image className='size-7' src={settings} alt='notification icon'/>
      </div>
    </div>
  )
}

export default Icons

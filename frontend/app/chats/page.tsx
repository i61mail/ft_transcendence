import React from 'react'
import AllChats from '../components/AllChats'
import MainChat from '../components/MainChat'

const page = async() => {

  return (  
    <>
      <div className='h-dvh flex gap-3'>
        <AllChats/>
        <MainChat/>
      </div>
    </>
  )
}

export default page

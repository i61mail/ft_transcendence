import React from 'react'
import Link from 'next/link'

const NavList = () => {
  return (
    <ul className=' flex gap-x-30 text-[24px] font-[400]'>
      <Link href={"/"}>HOME</Link>
      <Link href={"/chats"}>CHAT</Link>
      <Link href={"/"}>GAME</Link>
    </ul>
  )
}

export default NavList

import React from 'react'
import Logo from './Logo'
import NavList from './NavList'
import CurrentUser from './CurrentUser'
import Icons from './Icons'

const Header = () => {
  return (
    <>
    <nav className='flex justify-between items-center px-9'>
      <Logo/>
      <NavList/>
      <CurrentUser/>
      <Icons/>
    </nav>
    <div className='h-0.5 w-full bg-[#89B4E7] rounded-full mt-7 mb-5'></div>
    </>
  )
}

export default Header

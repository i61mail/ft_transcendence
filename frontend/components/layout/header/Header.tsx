"use client";

import React from "react";
import Logo from "./Logo";
import NavList from "./NavList";
import CurrentUser from "./CurrentUser";
import Icons from "./Icons";
import { useAuth } from "../../../context/AuthProvider";

const Header = () => {
  const auth = useAuth();
  const user = auth.user;

  return (
    auth.isLogged &&
    user && (
      <>
        <nav className="flex justify-between items-center px-9">
          <Logo />
          <NavList />
          <CurrentUser name={user.name} username={user.username} />
          <Icons />
        </nav>
        <div className="h-0.5 w-full bg-[#89B4E7] rounded-full mt-7 mb-5"></div>
      </>
    )
  );
};

export default Header;

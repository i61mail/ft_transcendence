"use client";

import React from "react";
import Logo from "./Logo";
import NavList from "./NavList";
import CurrentUser from "./CurrentUser";
import Icons from "./Icons";
import { useAuth } from "../../../context/AuthProvider";
import useglobalStore from "@/context/GlobalStore";

const Header = () => {
  const {isLogged, user} = useglobalStore();

  return (
    (
      isLogged && user && <>
      <div className="sticky top-0 w-full z-50 bg-[#BEC7DA]">
        <nav className="flex justify-between items-center px-9 mt-5">
          <Logo />
          <NavList />
          <CurrentUser name={user.name} username={user.username} />
          <Icons />
        </nav>
        <div className="h-0.5 w-full bg-[#89B4E7] rounded-full mt-7 mb-5"></div>
      </div>
      </>
    )
  );
};

export default Header;

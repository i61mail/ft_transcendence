"use client";

import React from "react";
import { UserProps } from "@/types/common.types";
import { useRouter } from "next/navigation";
import useglobalStore from "@/context/GlobalStore";

const Login = () => {
  const {login, isLogged, createSocket} = useglobalStore();
  const router = useRouter();
  const saveLogin = async (formData: FormData) => {
    const username = formData.get("username") as string;
    const loginUser = async () => 
    {
        const request = await fetch("http://localhost:4000/users");
        const response: UserProps[] = await request.json();
        const user = response.find((user) => user.username === username);
        if (user)
        {
          console.log("loggin in...");
          login(user);
          createSocket();
          router.push("/");
        }
        else
          alert("User not found!");
    }
    try
    {
      await loginUser();
    }
    catch (err)
    {
      alert(err);
    }
  };


  return (
    (
      !isLogged && <div className="h-screen w-screen flex justify-center items-center">
        <form
          action={saveLogin}
          className="flex flex-col items-center justify-center gap-5 h-100 w-200 bg-blue-200"
        >
          <input
            type="text"
            name="username"
            placeholder="username"
            className="border-full text-center bg-gray-300"
          />
          <input
            type="text"
            name="password"
            placeholder="password"
            required
            className="border-full text-center bg-gray-300"
          />
          <button className="size-20 border-full bg-gray-200">Log in</button>
        </form>
      </div>
    )
  );
};

export default Login;

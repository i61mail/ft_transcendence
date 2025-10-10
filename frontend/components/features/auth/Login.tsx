"use client";

import React from "react";
import { useAuth } from "../../../context/AuthProvider";
import { UserProps } from "@/types/common.types";

const Login = () => {
  const auth = useAuth();

  const saveLogin = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const login = async () => 
    {
        const request = await fetch("http://localhost:4000/users");
        const response: UserProps[] = await request.json();
        response.forEach(user => {
          if (user.username === username)
          {
            auth.login(user)
          }
        })
    }
    try
    {
      await login();
    }
    catch (err)
    {
      alert(err);
    }
  };

  return (
    !auth.isLogged && (
      <div className="h-screen w-screen flex justify-center items-center">
        <form
          action={saveLogin}
          className="flex flex-col items-center justify-center gap-5 h-100 w-200 bg-blue-200"
        >
          <input
            type="text"
            name="name"
            placeholder="name"
            className="border-full text-center bg-gray-300"
          />
          <input
            type="text"
            name="username"
            placeholder="username"
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

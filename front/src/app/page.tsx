"use client";

import React, { useState } from "react";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left side - Game background image (50% width, full height) */}
      <section className="relative w-1/2 h-screen overflow-hidden bg-[#5ea5e8] flex items-center justify-center">
        <img
          className="max-w-full max-h-full object-contain"
          alt="Game background"
          src="/rectangle-10.png"
        />
      </section>

      {/* Right side - Login/Register form (50% width, centered content) */}
      <section className="w-1/2 min-h-screen flex items-center justify-center px-8 overflow-y-auto">
        <div className="w-full max-w-[431px]">
          {isLogin ? (
            // LOGIN FORM
            <>
              <header className="flex items-center justify-center gap-4 mb-[135px]">
                <img
                  className="w-[69px] h-16 object-cover"
                  alt="Decoration"
                  src="/rectangle-8.png"
                />
                <h1 className="font-pixelify font-semibold text-black text-[40px] tracking-[0] leading-normal whitespace-nowrap">
                  Let's Goo !
                </h1>
                <img
                  className="w-[76px] h-[61px] object-cover"
                  alt="Decoration"
                  src="/rectangle-9.png"
                />
              </header>

              <form className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block font-pixelify font-normal text-black text-base tracking-[0] leading-normal"
                  >
                    Email*
                  </label>
                  <input
                    id="email"
                    type="email"
                    defaultValue="mail@gmail.com"
                    className="w-full h-[49px] bg-white rounded-[140px] border border-solid border-black px-6 font-inter font-thin text-black text-sm tracking-[0] leading-normal underline focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block font-pixelify font-normal text-black text-base tracking-[0] leading-normal"
                  >
                    Password*
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Min. 8 character"
                    className="w-full h-[49px] bg-white rounded-[140px] border border-solid border-black px-6 font-inter font-thin text-black text-sm tracking-[0] leading-normal focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <div className="flex justify-end">
                    <a
                      href="#"
                      className="font-pixelify font-normal text-[#3773bb] text-sm tracking-[0] leading-normal hover:underline"
                    >
                      Forget password?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#4a7bb8] rounded-[20px] font-pixelify font-normal text-white text-base tracking-[0] leading-normal hover:bg-black/90 transition-colors"
                >
                  Login
                </button>

                <div className="flex items-center gap-2 text-sm justify-center">
                  <span className="font-pixelify font-normal text-black tracking-[0] leading-normal">
                    Not registered yet?
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="font-pixelify font-normal text-[#3773bb] tracking-[0] leading-normal hover:underline"
                  >
                    Create an Account
                  </button>
                </div>

                <div className="relative flex items-center justify-center py-4">
                  <div className="absolute left-0 w-[120px] h-[1px] bg-gray-300" />
                  <span className="relative px-4 font-pixelify font-normal text-black text-xl tracking-[0] leading-normal bg-white">
                    or
                  </span>
                  <div className="absolute right-0 w-[120px] h-[1px] bg-gray-300" />
                </div>

                <button
                  type="button"
                  className="w-full h-[47px] bg-white rounded-[20px] border border-solid border-[#dadce0] font-pixelify font-medium text-[#3c4043] text-sm text-center tracking-[0.25px] leading-[17px] hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <img
                    className="w-5 h-5 mr-3"
                    alt="Google logo"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  />
                  Sign in with Google
                </button>

                <button
                  type="button"
                  className="w-full h-[47px] bg-white rounded-[20px] border border-solid border-[#dadce0] font-pixelify font-medium text-[#3c4043] text-sm text-center tracking-[0.25px] leading-[17px] hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <img
                    className="w-[27px] h-[43px] mr-3 object-cover"
                    alt="Intra logo"
                    src="/rectangle-63.png"
                  />
                  Sign in with Intra
                </button>
              </form>
            </>
          ) : (
            // REGISTER FORM
            <>
              <header className="flex items-center justify-center gap-4 mb-12">
                <img
                  className="w-[69px] h-16 object-cover"
                  alt="Decoration"
                  src="/rectangle-8.png"
                />
                <h1 className="font-pixelify font-semibold text-black text-[40px] tracking-[0] leading-normal whitespace-nowrap">
                  Let&apos;s Goo !
                </h1>
                <img
                  className="w-[76px] h-[61px] object-cover"
                  alt="Decoration"
                  src="/rectangle-9.png"
                />
              </header>

              <form className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="register-name"
                    className="block font-pixelify font-normal text-black text-base tracking-[0] leading-normal"
                  >
                    Name*
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    placeholder="Name"
                    className="w-full h-[49px] bg-white rounded-[140px] border border-solid border-black px-6 font-inter font-thin text-black text-sm tracking-[0] leading-normal focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="register-email"
                    className="block font-pixelify font-normal text-black text-base tracking-[0] leading-normal"
                  >
                    Email*
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    placeholder="you.ME@mail.com"
                    className="w-full h-[49px] bg-white rounded-[140px] border border-solid border-black px-6 font-inter font-thin text-black text-sm tracking-[0] leading-normal focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="register-password"
                    className="block font-pixelify font-normal text-black text-base tracking-[0] leading-normal"
                  >
                    Password*
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    placeholder="Min. 8 character"
                    className="w-full h-[49px] bg-white rounded-[140px] border border-solid border-black px-6 font-inter font-thin text-black text-sm tracking-[0] leading-normal focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#4a7bb8] rounded-[20px] font-pixelify font-normal text-white text-base tracking-[0] leading-normal hover:bg-[#3d6a9f] transition-colors"
                >
                  Sign Up
                </button>

                <div className="flex items-center gap-2 text-sm justify-center">
                  <span className="font-pixelify font-normal text-black tracking-[0] leading-normal">
                    Already have an Account?
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="font-pixelify font-normal text-[#3773bb] tracking-[0] leading-normal hover:underline"
                  >
                    Sign in
                  </button>
                </div>

                <div className="relative flex items-center justify-center py-4">
                  <div className="absolute left-0 w-[120px] h-[1px] bg-gray-300" />
                  <span className="relative px-4 font-pixelify font-normal text-black text-xl tracking-[0] leading-normal bg-white">
                    or
                  </span>
                  <div className="absolute right-0 w-[120px] h-[1px] bg-gray-300" />
                </div>

                <button
                  type="button"
                  className="w-full h-[47px] bg-white rounded-[20px] border border-solid border-[#dadce0] font-pixelify font-medium text-[#3c4043] text-sm text-center tracking-[0.25px] leading-[17px] hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <img
                    className="w-5 h-5 mr-3"
                    alt="Google logo"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  />
                  Sign up with Google
                </button>

                <button
                  type="button"
                  className="w-full h-[47px] bg-white rounded-[20px] border border-solid border-[#dadce0] font-pixelify font-medium text-[#3c4043] text-sm text-center tracking-[0.25px] leading-[17px] hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <img
                    className="w-[27px] h-[43px] mr-3 object-cover"
                    alt="Intra logo"
                    src="/rectangle-63.png"
                  />
                  Sign in with Intra
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

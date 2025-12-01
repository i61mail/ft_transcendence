"use client";

import React, { useEffect, useState } from "react";
import { register, login } from "@/lib/api";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Surface OAuth errors from callback redirects (e.g., ?error=oauth_failed)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err === 'oauth_failed') {
        setError('Google sign-in failed. Please try again.');
      }
    }
  }, []);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerDisplayName, setRegisterDisplayName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Handle Login
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  try {
    const result = await login({
      email: loginEmail,
      password: loginPassword,
    });

    // Store user data in localStorage for quick access
    localStorage.setItem("user", JSON.stringify(result.user));

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


// Handle Register
const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  try {
    const result = await register({
      email: registerEmail,
      username: registerName,
      password: registerPassword,
      display_name: registerDisplayName || undefined,
    });

    // Store user data in localStorage for quick access
    localStorage.setItem("user", JSON.stringify(result.user));

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
  };

  // Handle Google OAuth
  const handleGoogleSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left side - Game background image */}
      <section className="relative w-1/2 h-screen overflow-hidden bg-[#5ea5e8] flex items-center justify-center">
        <img
          className="max-w-full max-h-full object-contain"
          alt="Game background"
          src="/rectangle-10.png"
        />
      </section>

      {/* Right side - Login/Register form */}
      <section className="w-1/2 min-h-screen flex items-center justify-center px-8 overflow-y-auto">
        <div className="w-full max-w-[431px]">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

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
                  Let&apos;s Goo !
                </h1>
                <img
                  className="w-[76px] h-[61px] object-cover"
                  alt="Decoration"
                  src="/rectangle-9.png"
                />
              </header>

              <form onSubmit={handleLogin} className="space-y-6">
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
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="email@mail.com"
                    className="w-full h-[49px] bg-white rounded-[140px] border border-solid border-black px-6 font-inter font-thin text-black text-sm tracking-[0] leading-normal focus:outline-none focus:ring-2 focus:ring-black"
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min. 8 character"
                    className="w-full h-[49px] bg-white rounded-[140px] border border-solid border-black px-6 font-inter font-thin text-black text-sm tracking-[0] leading-normal focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#4a7bb8] rounded-[20px] font-pixelify font-normal text-white text-base tracking-[0] leading-normal hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Login"}
                </button>

                <div className="flex items-center gap-2 text-sm justify-center">
                  <span className="font-pixelify font-normal text-black tracking-[0] leading-normal">
                    Not registered yet?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setError("");
                      setSuccess("");
                    }}
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
                  onClick={handleGoogleSignIn}
                  className="w-full h-[47px] bg-white rounded-[20px] border border-solid border-[#dadce0] font-pixelify font-medium text-[#3c4043] text-sm text-center tracking-[0.25px] leading-[17px] hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <img
                    className="w-5 h-5 mr-3"
                    alt="Google logo"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  />
                  Sign in with Google
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

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="register-name"
                    className="block font-pixelify font-normal text-black text-base tracking-[0] leading-normal"
                  >
                    Username*
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    placeholder="Name"
                    className="w-full h-[49px] bg-white rounded-[140px] border border-solid border-black px-6 font-inter font-normal text-black text-sm tracking-[0] leading-normal focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="register-display-name"
                    className="block font-pixelify font-normal text-black text-base tracking-[0] leading-normal"
                  >
                    Display name
                  </label>
                  <input
                    id="register-display-name"
                    type="text"
                    value={registerDisplayName}
                    onChange={(e) => setRegisterDisplayName(e.target.value)}
                    placeholder="Shown to others"
                    className="w-full h-[49px] bg-white rounded-[140px] border border-solid border-black px-6 font-inter font-normal text-black text-sm tracking-[0] leading-normal focus:outline-none focus:ring-2 focus:ring-black"
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
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    placeholder="email@mail.com"
                    className="w-full h-[49px] bg-white rounded-[140px] border border-solid border-black px-6 font-inter font-normal text-black text-sm tracking-[0] leading-normal focus:outline-none focus:ring-2 focus:ring-black"
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
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min. 8 character"
                    className="w-full h-[49px] bg-white rounded-[140px] border border-solid border-black px-6 font-inter font-normal text-black text-sm tracking-[0] leading-normal focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#4a7bb8] rounded-[20px] font-pixelify font-normal text-white text-base tracking-[0] leading-normal hover:bg-[#3d6a9f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Sign Up"}
                </button>

                <div className="flex items-center gap-2 text-sm justify-center">
                  <span className="font-pixelify font-normal text-black tracking-[0] leading-normal">
                    Already have an Account?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setError("");
                      setSuccess("");
                    }}
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
                  onClick={handleGoogleSignIn}
                  className="w-full h-[47px] bg-white rounded-[20px] border border-solid border-[#dadce0] font-pixelify font-medium text-[#3c4043] text-sm text-center tracking-[0.25px] leading-[17px] hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <img
                    className="w-5 h-5 mr-3"
                    alt="Google logo"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  />
                  Sign up with Google
                </button>

              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

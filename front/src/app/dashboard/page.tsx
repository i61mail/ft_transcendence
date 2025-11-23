"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvatarUpload from "@/components/AvatarUpload";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#bcc3d4]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#bcc3d4] flex flex-col">
      {/* Top Navigation Bar with bottom border */}
      <header className="bg-[#bcc3d4] h-[85px] flex items-center justify-between px-8 border-b-2 border-[#8aabd6]">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <span
              className="text-[#2d5a8a] text-6xl font-serif font-bold"
              style={{ fontFamily: "Pixelify Sans, sans-serif" }}
            >
              𝕭
            </span>
          </div>
          <h1 className="font-pixelify text-3xl font-bold text-black">
            ANANA
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-50">
          <button className="font-pixelify text-lg text-black hover:text-[#5A789E] transition-colors border-b-2 border-[#5A789E] pb-1">
            HOME
          </button>
          <button className="font-pixelify text-lg text-black hover:text-[#5A789E] transition-colors flex items-center gap-2">
            <span className="w-2 h-2 bg-[#5A789E] rounded-full"></span>
            CHAT
          </button>
          <button className="font-pixelify text-lg text-black hover:text-[#5A789E] transition-colors">
            GAME
          </button>
        </nav>

        {/* User Profile Section */}
        <div className="flex items-center gap-8">
          {/* User Info with Avatar Upload */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAvatarUpload(true)}
              className="w-10 h-10 rounded-full overflow-hidden bg-gray-400 hover:ring-2 hover:ring-[#5A789E] transition-all cursor-pointer"
            >
              <img
                src={
                  user.avatar_url
                    ? `http://localhost:4000${user.avatar_url}`
                    : "/default-avatar.png"
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </button>
            <div className="text-left">
              <p className="font-pixelify text-lg font-semibold text-black">
                {user.username}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Icons Section (closer together) */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button className="relative w-10 h-10 bg-[#5A789E] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <span className="text-xl">🔔</span>
              <span className="absolute top-0 right-0 w-3 h-3 bg-[#5A789E] rounded-full border-2 border-white"></span>
            </button>

            {/* Settings Icon */}
            <button
              onClick={handleLogout}
              className="w-10 h-10 bg-[#5A789E] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex gap-4 p-6">
        {/* Left Sidebar - Chat List - Only one avatar */}
        <aside className="w-[85px] bg-[#a8b0c5] rounded-3xl p-4 flex flex-col items-center gap-4 justify-end">
          {/* Single chat avatar with bounce animation */}
          <img
            src="/player.png"
            className="w-20 h-20 object-contain animate-bounce-vertical"
            alt="Player"
          />
        </aside>

        {/* Center Content Area */}
        <section className="flex-1 flex flex-col gap-4">
          {/* Top Card - Empty */}
          <div className="h-[245px] bg-[#a8b0c5] rounded-3xl p-6">
            {/*up bar*/}
          </div>

          {/* Bottom Card - Empty with Quick Actions */}
          <div className="flex-1 bg-[#a8b0c5] rounded-3xl p-6">
            {/*down bar*/}
          </div>
        </section>

        {/* Right Sidebar - Main Panel - Empty */}
        <aside className="w-[335px] bg-[#a8b0c5] rounded-3xl p-6">
          {/*right side bar*/}
        </aside>
      </main>

      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-pixelify text-2xl font-bold">Upload Avatar</h2>
              <button
                onClick={() => setShowAvatarUpload(false)}
                className="text-gray-500 hover:text-black text-2xl"
              >
                ×
              </button>
            </div>
            <AvatarUpload
              currentAvatar={user.avatar_url}
              onUploadSuccess={(avatarUrl) => {
                setUser({ ...user, avatar_url: avatarUrl });
                setShowAvatarUpload(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import AvatarUpload from "@/components/AvatarUpload";
import { updateProfile } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface HeaderProps {
  user: any;
  onUserUpdate?: (user: any) => void;
  activeRoute?: 'dashboard' | 'chat' | 'game' | 'profile';
}

export default function Header({ user, onUserUpdate, activeRoute = 'dashboard' }: HeaderProps) {
  const router = useRouter();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [newDisplayName, setNewDisplayName] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
      localStorage.removeItem("user");
      router.push("/");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`${API_URL}/profile/search?username=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (friendId: number) => {
    try {
      const response = await fetch(`${API_URL}/friendships`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user1: user.id,
          user2: friendId,
        }),
      });

      if (response.ok) {
        // Remove the user from search results after adding
        setSearchResults(prev => prev.filter(u => u.id !== friendId));
        setSearchMessage({ type: 'success', text: 'Friend added successfully!' });
        setTimeout(() => setSearchMessage(null), 3000);
      } else {
        const error = await response.json();
        setSearchMessage({ type: 'error', text: error.error || 'Failed to add friend' });
        setTimeout(() => setSearchMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to add friend:', err);
      setSearchMessage({ type: 'error', text: 'Failed to add friend' });
      setTimeout(() => setSearchMessage(null), 3000);
    }
  };

  return (
    <>
      <header 
        className="sticky top-0 z-50 bg-transparent backdrop-blur-md h-[110px] flex items-center justify-between px-12 border-b-2 border-[#8aabd6]/30 shadow-xl relative"
        style={{ boxShadow: '0 10px 30px rgba(90, 120, 158, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.3)' }}
      >
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5A789E] to-transparent opacity-30"></div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center">
            <span className="text-[#2d5a8a] text-7xl font-serif font-bold" style={{ fontFamily: "Pixelify Sans, sans-serif", textShadow: '0 0 10px rgba(45, 90, 138, 0.3)' }}>𝕭</span>
          </div>
          <h1 className="font-pixelify text-4xl font-bold text-black" style={{ textShadow: '0 0 8px rgba(0, 0, 0, 0.1)' }}>ANANA</h1>
        </div>

        <nav className="flex items-center gap-16">
          <button 
            onClick={() => router.push('/dashboard')} 
            className={`relative font-pixelify text-xl px-8 py-4 rounded-2xl cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border overflow-hidden backdrop-blur-md ${
              activeRoute === 'dashboard' 
                ? 'bg-white/30 border-white/50 text-[#1a237e] font-bold shadow-lg' 
                : 'bg-white/10 border-white/20 text-[#2d5a8a] hover:bg-white/20 hover:border-white/40'
            }`}
          >
            <span className="relative">HOME</span>
          </button>
          <button 
            onClick={() => router.push('/chats')}
            className={`relative font-pixelify text-xl px-8 py-4 rounded-2xl cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border overflow-hidden backdrop-blur-md ${
              activeRoute === 'chat' 
                ? 'bg-white/30 border-white/50 text-[#1a237e] font-bold shadow-lg' 
                : 'bg-white/10 border-white/20 text-[#2d5a8a] hover:bg-white/20 hover:border-white/40'
            }`}
          >
            <span className="relative">CHAT</span>
          </button>
          <button
             onClick={() => router.push('/games')}
            className={`relative font-pixelify text-xl px-8 py-4 rounded-2xl cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border overflow-hidden backdrop-blur-md ${
              activeRoute === 'game' 
                ? 'bg-white/30 border-white/50 text-[#1a237e] font-bold shadow-lg' 
                : 'bg-white/10 border-white/20 text-[#2d5a8a] hover:bg-white/20 hover:border-white/40'
            }`}
          >
            <span className="relative">GAME</span>
          </button>
        </nav>

        <div className="flex items-center gap-20">
          <div className="flex items-center gap-7 backdrop-blur-md bg-white/10 rounded-2xl px-10 py-4 border border-white/30 shadow-lg hover:bg-white/15 transition-all duration-300">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden backdrop-blur-md bg-white/20 ring-2 ring-white/50 shadow-lg">
                <img src={user?.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${API_URL}${user.avatar_url}`) : "/default-avatar.png"} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="text-left">
              <p className="font-pixelify text-2xl font-bold text-[#2d5a8a] drop-shadow-sm">{user?.display_name || user?.username}</p>
              <p className="text-base text-[#2d5a8a]/70 font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSearchModal(true)}
              className="relative w-12 h-12 backdrop-blur-md bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/30 shadow-lg hover:scale-110 group"
            >
              <svg className="w-5 h-5 text-[#2d5a8a] group-hover:text-[#1a4d7a] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <div className="relative z-50" onMouseEnter={() => setShowSettingsMenu(true)} onMouseLeave={() => setShowSettingsMenu(false)}>
              <button className="w-12 h-12 backdrop-blur-md bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/30 shadow-lg hover:scale-110 group">
                <svg className="w-5 h-5 text-[#2d5a8a] group-hover:text-[#1a4d7a] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {showSettingsMenu && (
                <div className="absolute right-0 top-full pt-1 w-48">
                  <div className="bg-[#a8b0c5] border-2 border-[#8aabd6] rounded-xl shadow-xl overflow-visible">
                    <button
                      onClick={() => router.push('/profile')}
                      className="block w-full text-left px-4 py-3 font-pixelify text-sm text-black hover:bg-[#8aabd6] hover:text-white transition-colors"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => { 
                        setShowEditModal(true); 
                        setNewDisplayName(user?.display_name || user?.username || ""); 
                        setNewUsername(user?.username || "");
                        setSaveError("");
                      }}
                      className="block w-full text-left px-4 py-3 font-pixelify text-sm text-black hover:bg-[#8aabd6] hover:text-white transition-colors"
                    >
                      Edit Information
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 font-pixelify text-sm text-black hover:bg-[#8aabd6] hover:text-white transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showSearchModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-[#a8b0c5] rounded-2xl p-6 max-w-md w-full mx-4 border-2 border-[#8aabd6] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-pixelify text-2xl font-bold text-black">Search Users</h2>
              <button 
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                  setSearchMessage(null);
                }} 
                className="text-black hover:text-white text-2xl bg-[#5A789E] rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter username..."
                  className="flex-1 h-10 bg-white rounded-lg border border-solid border-[#8aabd6] px-4 font-inter text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5A789E] placeholder-gray-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-4 py-2 bg-[#5A789E] text-white rounded-lg hover:bg-[#4a6888] font-pixelify text-sm disabled:opacity-50 border-2 border-[#8aabd6]"
                >
                  {searching ? '...' : 'Search'}
                </button>
              </div>
            </div>

            {searchMessage && (
              <div className={`p-3 rounded-lg text-sm font-pixelify mb-3 ${
                searchMessage.type === 'success' 
                  ? 'bg-green-100 border border-green-400 text-green-700' 
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
                {searchMessage.text}
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {searchResults.length === 0 && searchQuery && !searching && (
                <p className="text-center text-gray-600 font-pixelify py-4">No users found</p>
              )}
              
              {searchResults.map((searchUser) => (
                <div
                  key={searchUser.id}
                  className="flex items-center justify-between bg-[#bcc3d4] rounded-xl p-3 mb-2 border border-[#8aabd6]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-400">
                      <img
                        src={searchUser.avatar_url ? (searchUser.avatar_url.startsWith('http') ? searchUser.avatar_url : `${API_URL}${searchUser.avatar_url}`) : "/default-avatar.png"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-pixelify text-sm font-semibold text-black">
                        {searchUser.display_name || searchUser.username}
                      </p>
                      <p className="text-xs text-gray-600">@{searchUser.username}</p>
                    </div>
                  </div>
                  {searchUser.isFriend ? (
                    <span className="px-3 py-1 bg-gray-400 text-white rounded-lg font-pixelify text-xs border border-[#8aabd6] cursor-not-allowed">
                      Already Friends
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddFriend(searchUser.id)}
                      className="px-3 py-1 bg-[#5A789E] text-white rounded-lg hover:bg-[#4a6888] font-pixelify text-xs border border-[#8aabd6]"
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {showEditModal && user && createPortal(
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#a8b0c5] rounded-2xl p-6 max-w-2xl w-full mx-4 border-2 border-[#8aabd6] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-pixelify text-2xl font-bold text-black">Edit Information</h2>
              <button onClick={() => setShowEditModal(false)} className="text-black hover:text-white text-2xl bg-[#5A789E] rounded-full w-8 h-8 flex items-center justify-center">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                  <label className="block font-pixelify text-sm mb-2 text-black">Username</label>
                  <input 
                    type="text" 
                    value={newUsername} 
                    onChange={(e) => setNewUsername(e.target.value)} 
                    minLength={3} 
                    maxLength={20} 
                    pattern="[a-zA-Z0-9_]+"
                    placeholder="Enter username (3-20 chars, letters, numbers, _)"
                    className="w-full h-10 bg-white rounded-lg border border-solid border-[#8aabd6] px-4 font-inter text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5A789E] placeholder-gray-500" 
                  />
                  <p className="text-xs text-gray-600 mt-1">Letters, numbers, and underscores only</p>
                </div>
                <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                  <label className="block font-pixelify text-sm mb-2 text-black">Email</label>
                  <input type="email" value={user.email} readOnly className="w-full h-10 bg-gray-200 rounded-lg border border-solid border-[#8aabd6] px-4 font-inter text-sm text-black cursor-not-allowed" />
                </div>
                <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                  <label className="block font-pixelify text-sm mb-2 text-black">Display name</label>
                  <input type="text" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} minLength={2} maxLength={50} placeholder="Enter display name (optional)" className="w-full h-10 bg-white rounded-lg border border-solid border-[#8aabd6] px-4 font-inter text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5A789E] placeholder-gray-500" />
                </div>
              </div>

              <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                <label className="block font-pixelify text-sm mb-2 text-black">Profile Picture</label>
                <AvatarUpload
                  currentAvatar={user.avatar_url}
                  onUploadSuccess={(avatarUrl) => {
                    const updated = { ...user, avatar_url: avatarUrl };
                    if (onUserUpdate) onUserUpdate(updated);
                    localStorage.setItem("user", JSON.stringify(updated));
                  }}
                />
              </div>
            </div>

            {saveError && (
              <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">{saveError}</div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-[#8aabd6] rounded-lg hover:bg-[#8aabd6] hover:text-white font-pixelify text-sm text-black bg-white">Cancel</button>
              <button
                onClick={async () => {
                  setSaving(true);
                  setSaveError("");
                  try {
                    // Prepare update data
                    const updateData: { display_name?: string; username?: string } = {};
                    
                    // Only include fields that have changed
                    if (newDisplayName !== (user.display_name || user.username || "")) {
                      updateData.display_name = newDisplayName;
                    }
                    if (newUsername !== user.username) {
                      updateData.username = newUsername;
                    }
                    
                    // Only make request if something changed
                    if (Object.keys(updateData).length === 0) {
                      setShowEditModal(false);
                      return;
                    }
                    
                    const res = await updateProfile(updateData);
                    const updatedUser = { ...user, ...res.user };
                    if (onUserUpdate) onUserUpdate(updatedUser);
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setShowEditModal(false);
                  } catch (err: any) {
                    setSaveError(err.message);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="px-4 py-2 bg-[#5A789E] text-white rounded-lg hover:bg-[#4a6888] font-pixelify text-sm disabled:opacity-50 border-2 border-[#8aabd6]"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

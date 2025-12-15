'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import AvatarUpload from "@/components/AvatarUpload";
import { updateProfile } from "@/lib/api";
import useglobalStore from "@/store/globalStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8080/api';

interface HeaderProps
{
  user: any;
  onUserUpdate?: (user: any) => void;
  activeRoute?: 'dashboard' | 'chat' | 'game' | 'profile';
}

export default function Header({ user, onUserUpdate, activeRoute = 'dashboard' }: HeaderProps)
{
  const router = useRouter();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [newDisplayName, setNewDisplayName] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");
  const manager = useglobalStore();
  

  // 2FA states
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [twoFAToken, setTwoFAToken] = useState<string>("");
  const [twoFAMessage, setTwoFAMessage] = useState<string>("");

  // Accessibility states
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Load accessibility settings from localStorage
  React.useEffect(() => {
    const savedContrast = localStorage.getItem('highContrast') === 'true';
    const savedTextSize = (localStorage.getItem('textSize') as 'normal' | 'large' | 'xlarge') || 'normal';
    setHighContrast(savedContrast);
    setTextSize(savedTextSize);
    if (savedContrast)
      document.documentElement.classList.add('high-contrast');
    document.documentElement.setAttribute('data-text-size', savedTextSize);
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', String(newValue));
    
    if (newValue)
      document.documentElement.classList.add('high-contrast');
    else
      document.documentElement.classList.remove('high-contrast');
  };

  const changeTextSize = (size: 'normal' | 'large' | 'xlarge') => {
    setTextSize(size);
    localStorage.setItem('textSize', size);
    document.documentElement.setAttribute('data-text-size', size);
  };

  const handleLogout = async () => {
    try
    {
      await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    }
    finally
    {
      localStorage.removeItem("user");
      manager.socket?.close();
      router.push("/");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim())
    {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try
    {
      const response = await fetch(`${API_URL}/profile/search?username=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok)
      {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
      else
        setSearchResults([]);
    }
    catch (err)
    {
      console.error('Search failed:', err);
      setSearchResults([]);
    }
    finally
    {
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

      if (response.ok)
      {
        setSearchResults(prev => prev.filter(u => u.id !== friendId));
        setSearchMessage({ type: 'success', text: 'Friend added successfully!' });
        setTimeout(() => setSearchMessage(null), 3000);
      }
      else
      {
        const error = await response.json();
        setSearchMessage({ type: 'error', text: error.error || 'Failed to add friend' });
        setTimeout(() => setSearchMessage(null), 3000);
      }
    }
    catch (err)
    {
      console.error('Failed to add friend:', err);
      setSearchMessage({ type: 'error', text: 'Failed to add friend' });
      setTimeout(() => setSearchMessage(null), 3000);
    }
  };

  return (
    <>
      <header 
        className="sticky top-0 z-50 bg-transparent backdrop-blur-md h-auto md:h-[110px] flex flex-col md:flex-row items-center justify-between px-4 md:px-8 lg:px-12 py-3 md:py-0 border-b-2 border-[#8aabd6]/30 shadow-xl relative"
        style={{ boxShadow: '0 10px 30px rgba(90, 120, 158, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.3)' }}
      >
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5A789E] to-transparent opacity-30"></div>
        
        {/* Logo Section */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
              <span className="text-[#2d5a8a] text-4xl md:text-7xl font-serif font-bold" style={{ fontFamily: "Pixelify Sans, sans-serif", textShadow: '0 0 10px rgba(45, 90, 138, 0.3)' }}>𝕭</span>
            </div>
            <h1 className="font-pixelify text-2xl md:text-4xl font-bold text-black" style={{ textShadow: '0 0 8px rgba(0, 0, 0, 0.1)' }}>ANANA</h1>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden w-10 h-10 rounded-lg bg-white/10 border border-white/30 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-[#2d5a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden w-full mt-3 pb-3 border-t border-white/20 pt-3">
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  router.push('/dashboard');
                  setShowMobileMenu(false);
                }} 
                className={`relative font-pixelify text-base px-4 py-3 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 border backdrop-blur-md ${
                  activeRoute === 'dashboard' 
                    ? 'bg-white/30 border-white/50 text-[#1a237e] font-bold shadow-lg' 
                    : 'bg-white/10 border-white/20 text-[#2d5a8a] hover:bg-white/20 hover:border-white/40'
                }`}
              >
                <span className="relative">HOME</span>
              </button>
              <button 
                onClick={() => {
                  router.push('/chats');
                  setShowMobileMenu(false);
                }}
                className={`relative font-pixelify text-base px-4 py-3 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 border backdrop-blur-md ${
                  activeRoute === 'chat' 
                    ? 'bg-white/30 border-white/50 text-[#1a237e] font-bold shadow-lg' 
                    : 'bg-white/10 border-white/20 text-[#2d5a8a] hover:bg-white/20 hover:border-white/40'
                }`}
              >
                <span className="relative">CHAT</span>
              </button>
              <button
                onClick={() => {
                  router.push('/games');
                  setShowMobileMenu(false);
                }}
                className={`relative font-pixelify text-base px-4 py-3 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 border backdrop-blur-md ${
                  activeRoute === 'game' 
                    ? 'bg-white/30 border-white/50 text-[#1a237e] font-bold shadow-lg' 
                    : 'bg-white/10 border-white/20 text-[#2d5a8a] hover:bg-white/20 hover:border-white/40'
                }`}
              >
                <span className="relative">GAME</span>
              </button>
            </nav>
          </div>
        )}

        {/* Navigation - Hidden on mobile, visible on md and up */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-16 flex-1 justify-center">
          <button 
            onClick={() => router.push('/dashboard')} 
            className={`relative font-pixelify text-sm lg:text-xl px-4 lg:px-8 py-2 lg:py-4 rounded-2xl cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border overflow-hidden backdrop-blur-md ${
              activeRoute === 'dashboard' 
                ? 'bg-white/30 border-white/50 text-[#1a237e] font-bold shadow-lg' 
                : 'bg-white/10 border-white/20 text-[#2d5a8a] hover:bg-white/20 hover:border-white/40'
            }`}
          >
            <span className="relative">HOME</span>
          </button>
          <button 
            onClick={() => router.push('/chats')}
            className={`relative font-pixelify text-sm lg:text-xl px-4 lg:px-8 py-2 lg:py-4 rounded-2xl cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border overflow-hidden backdrop-blur-md ${
              activeRoute === 'chat' 
                ? 'bg-white/30 border-white/50 text-[#1a237e] font-bold shadow-lg' 
                : 'bg-white/10 border-white/20 text-[#2d5a8a] hover:bg-white/20 hover:border-white/40'
            }`}
          >
            <span className="relative">CHAT</span>
          </button>
          <button
             onClick={() => router.push('/games')}
            className={`relative font-pixelify text-sm lg:text-xl px-4 lg:px-8 py-2 lg:py-4 rounded-2xl cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border overflow-hidden backdrop-blur-md ${
              activeRoute === 'game' 
                ? 'bg-white/30 border-white/50 text-[#1a237e] font-bold shadow-lg' 
                : 'bg-white/10 border-white/20 text-[#2d5a8a] hover:bg-white/20 hover:border-white/40'
            }`}
          >
            <span className="relative">GAME</span>
          </button>
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-3 md:gap-8 lg:gap-20 w-full md:w-auto mt-3 md:mt-0 justify-end">
          {/* User Info - Hidden on small mobile, visible on md and up */}
          <div className="hidden lg:flex items-center gap-3 md:gap-7 backdrop-blur-md bg-white/10 rounded-2xl px-3 md:px-10 py-2 md:py-4 border border-white/30 shadow-lg hover:bg-white/15 transition-all duration-300 flex-1 md:flex-none">
            <div className="relative hidden sm:block">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden backdrop-blur-md bg-white/20 ring-2 ring-white/50 shadow-lg">
                <img src={user?.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${API_URL}${user.avatar_url}`) : "/default-avatar.png"} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="text-left">
              <p className="font-pixelify text-sm md:text-2xl font-bold text-[#2d5a8a] drop-shadow-sm truncate">{user?.display_name || user?.username}</p>
              <p className="text-xs md:text-base text-[#2d5a8a]/70 font-medium truncate">{user?.email}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
            <button 
              onClick={() => setShowSearchModal(true)}
              className="relative w-9 h-9 md:w-12 md:h-12 backdrop-blur-md bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/30 shadow-lg hover:scale-110 group"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-[#2d5a8a] group-hover:text-[#1a4d7a] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <div className="relative z-50" onMouseEnter={() => setShowSettingsMenu(true)} onMouseLeave={() => setShowSettingsMenu(false)}>
              <button className="w-9 h-9 md:w-12 md:h-12 backdrop-blur-md bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/30 shadow-lg hover:scale-110 group">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#2d5a8a] group-hover:text-[#1a4d7a] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {showSettingsMenu && (
                <div className="absolute right-0 top-full pt-2 w-48 z-[60]">
                  <div className="bg-[#a8b0c5] border-2 border-[#8aabd6] rounded-xl shadow-xl overflow-visible">
                    <button
                      onClick={() => router.push('/profile')}
                      className="block w-full text-left px-4 py-3 font-pixelify text-sm text-black hover:bg-[#8aabd6] hover:text-white transition-colors"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={async () => { 
                        setShowEditModal(true); 
                        setNewDisplayName(user?.display_name || user?.username || ""); 
                        setNewUsername(user?.username || "");
                        setNewEmail(user?.email || "");
                        setNewPassword("");
                        setConfirmPassword("");
                        setSaveError("");
                        setQrCode("");
                        setTwoFAToken("");
                        setTwoFAMessage("");
                        
                        // Check 2FA status
                        try
                        {
                          const response = await fetch(`${API_URL}/auth/2fa/status`, { credentials: 'include' });
                          if (response.ok)
                          {
                            const data = await response.json();
                            setTwoFAEnabled(data.enabled);
                          }
                        }
                        catch (err)
                        {
                          console.error('Failed to load 2FA status:', err);
                        }
                      }}
                      className="block w-full text-left px-4 py-3 font-pixelify text-sm text-black hover:bg-[#8aabd6] hover:text-white transition-colors"
                    >
                      Edit Information
                    </button>
                    
                    {/* Accessibility Settings */}
                    <div className="border-t-2 border-[#8aabd6] my-1"></div>
                    <div className="px-4 py-2">
                      <div className="font-pixelify text-xs text-black/60 uppercase mb-2">Accessibility</div>
                      
                      {/* High Contrast Toggle */}
                      <button
                        onClick={toggleHighContrast}
                        className="flex items-center justify-between w-full py-2 font-pixelify text-sm text-black hover:text-[#2d5a8a] transition-colors"
                      >
                        <span>High Contrast</span>
                        <div className={`w-10 h-5 rounded-full transition-colors ${highContrast ? 'bg-[#2d5a8a]' : 'bg-gray-400'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${highContrast ? 'ml-5' : 'ml-0.5'}`}></div>
                        </div>
                      </button>
                      
                      {/* Text Size Selector */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-pixelify text-sm text-black">Text Size</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (textSize === 'large') changeTextSize('normal');
                                else if (textSize === 'xlarge') changeTextSize('large');
                              }}
                              disabled={textSize === 'normal'}
                              className={`w-7 h-7 rounded-full font-pixelify text-lg transition-colors ${
                                textSize === 'normal'
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-[#2d5a8a] text-white hover:bg-[#1a4d7a]'
                              }`}
                            >
                              −
                            </button>
                            <button
                              onClick={() => {
                                if (textSize === 'normal') changeTextSize('large');
                                else if (textSize === 'large') changeTextSize('xlarge');
                              }}
                              disabled={textSize === 'xlarge'}
                              className={`w-7 h-7 rounded-full font-pixelify text-lg transition-colors ${
                                textSize === 'xlarge'
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-[#2d5a8a] text-white hover:bg-[#1a4d7a]'
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t-2 border-[#8aabd6] my-1"></div>
                    
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
                  <input 
                    type="email" 
                    value={newEmail} 
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full h-10 bg-white rounded-lg border border-solid border-[#8aabd6] px-4 font-inter text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5A789E] placeholder-gray-500" 
                  />
                </div>
                <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                  <label className="block font-pixelify text-sm mb-2 text-black">Display name</label>
                  <input type="text" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} minLength={2} maxLength={50} placeholder="Enter display name (optional)" className="w-full h-10 bg-white rounded-lg border border-solid border-[#8aabd6] px-4 font-inter text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5A789E] placeholder-gray-500" />
                </div>
                <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                  <label className="block font-pixelify text-sm mb-2 text-black">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full h-10 bg-white rounded-lg border border-solid border-[#8aabd6] px-4 font-inter text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5A789E] placeholder-gray-500" 
                  />
                </div>
                <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                  <label className="block font-pixelify text-sm mb-2 text-black">Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full h-10 bg-white rounded-lg border border-solid border-[#8aabd6] px-4 font-inter text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5A789E] placeholder-gray-500" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
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

                <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                  <label className="block font-pixelify text-sm mb-2 text-black">Two-Factor Authentication</label>
                <div className="text-xs text-gray-700 mb-3">Use Google Authenticator app</div>
                
                {!twoFAEnabled ? (
                  <div className="space-y-3">
                    {!qrCode ? (
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`${API_URL}/auth/2fa/enable`, {
                              method: 'POST',
                              credentials: 'include'
                            });
                            if (response.ok) {
                              const data = await response.json();
                              setQrCode(data.qrCode);
                              setTwoFAMessage("Scan QR code with Google Authenticator");
                            }
                          } catch (err) {
                            setTwoFAMessage("Failed to generate QR code");
                          }
                        }}
                        className="w-full px-4 py-2 bg-[#5A789E] text-white rounded-lg hover:bg-[#4a6888] font-pixelify text-sm"
                      >
                        Enable 2FA
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <img src={qrCode} alt="QR Code" className="w-full rounded-lg" />
                        <input
                          type="text"
                          value={twoFAToken}
                          onChange={(e) => setTwoFAToken(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="w-full px-3 py-2 border border-[#8aabd6] rounded-lg text-center text-lg tracking-widest"
                        />
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`${API_URL}/auth/2fa/verify`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ token: twoFAToken })
                              });
                              if (response.ok) {
                                setTwoFAEnabled(true);
                                setQrCode("");
                                setTwoFAToken("");
                                setTwoFAMessage("2FA enabled successfully!");
                              } else {
                                setTwoFAMessage("Invalid code. Try again.");
                              }
                            } catch (err) {
                              setTwoFAMessage("Verification failed");
                            }
                          }}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-pixelify text-sm"
                        >
                          Verify & Enable
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-green-700 font-semibold">✓ 2FA is enabled</div>
                    <input
                      type="text"
                      value={twoFAToken}
                      onChange={(e) => setTwoFAToken(e.target.value)}
                      placeholder="Enter 6-digit code to disable"
                      maxLength={6}
                      className="w-full px-3 py-2 border border-[#8aabd6] rounded-lg text-center text-lg tracking-widest"
                    />
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`${API_URL}/auth/2fa/disable`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token: twoFAToken })
                          });
                          if (response.ok) {
                            setTwoFAEnabled(false);
                            setTwoFAToken("");
                            setTwoFAMessage("2FA disabled successfully!");
                          } else {
                            setTwoFAMessage("Invalid code. Try again.");
                          }
                        } catch (err) {
                          setTwoFAMessage("Failed to disable 2FA");
                        }
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-pixelify text-sm"
                    >
                      Disable 2FA
                    </button>
                  </div>
                )}
                {twoFAMessage && (
                  <div className="text-xs mt-2 text-center text-gray-700">{twoFAMessage}</div>
                )}
                </div>
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
                    // Validate password confirmation
                    if (newPassword || confirmPassword) {
                      if (newPassword !== confirmPassword) {
                        setSaveError("Passwords do not match");
                        setSaving(false);
                        return;
                      }
                      if (newPassword.length < 6) {
                        setSaveError("Password must be at least 6 characters");
                        setSaving(false);
                        return;
                      }
                    }

                    // Validate email format
                    if (newEmail && newEmail !== user.email) {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(newEmail)) {
                        setSaveError("Please enter a valid email address");
                        setSaving(false);
                        return;
                      }
                    }

                    // Prepare update data
                    const updateData: { display_name?: string; username?: string; email?: string; password?: string } = {};
                    
                    // Only include fields that have changed
                    if (newDisplayName !== (user.display_name || user.username || "")) {
                      updateData.display_name = newDisplayName;
                    }
                    if (newUsername !== user.username) {
                      updateData.username = newUsername;
                    }
                    if (newEmail && newEmail !== user.email) {
                      updateData.email = newEmail;
                    }
                    if (newPassword) {
                      updateData.password = newPassword;
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

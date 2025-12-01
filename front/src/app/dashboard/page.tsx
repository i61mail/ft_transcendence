"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvatarUpload from "@/components/AvatarUpload";
import { API_URL, updateProfile } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const verifyAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
        if (!response.ok) throw new Error("Not authenticated");
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (e) {
        localStorage.removeItem("user");
        router.push("/");
      }
    };
    verifyAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
      localStorage.removeItem("user");
      router.push("/");
    }
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
      <header className="bg-[#bcc3d4] h-[85px] flex items-center justify-between px-8 border-b-2 border-[#8aabd6]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="text-[#2d5a8a] text-6xl font-serif font-bold" style={{ fontFamily: "Pixelify Sans, sans-serif" }}>𝕭</span>
          </div>
          <h1 className="font-pixelify text-3xl font-bold text-black">ANANA</h1>
        </div>

        <nav className="flex items-center gap-50">
          <button className="font-pixelify text-lg text-black hover:text-[#5A789E] transition-colors border-b-2 border-[#5A789E] pb-1">HOME</button>
          <button className="font-pixelify text-lg text-black hover:text-[#5A789E] transition-colors flex items-center gap-2">
            <span className="w-2 h-2 bg-[#5A789E] rounded-full"></span>
            CHAT
          </button>
          <button className="font-pixelify text-lg text-black hover:text-[#5A789E] transition-colors">GAME</button>
        </nav>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-400 ring-2 ring-[#5A789E]">
              <img src={user.avatar_url ? `${API_URL}${user.avatar_url}` : "/default-avatar.png"} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <p className="font-pixelify text-lg font-semibold text-black">{user.display_name || user.username}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative w-10 h-10 bg-[#5A789E] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <span className="text-xl">🔔</span>
              <span className="absolute top-0 right-0 w-3 h-3 bg-[#5A789E] rounded-full border-2 border-white"></span>
            </button>

            <div className="relative" onMouseEnter={() => setShowSettingsMenu(true)} onMouseLeave={() => setShowSettingsMenu(false)}>
              <button className="w-10 h-10 bg-[#5A789E] rounded-full flex items-center justify-center hover:bg-[#4a6888] transition-colors border-2 border-[#8aabd6] shadow-sm">
                <span className="text-xl">⚙️</span>
              </button>
              {showSettingsMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl z-20 overflow-hidden">
                  <div className="bg-[#a8b0c5] border-2 border-[#8aabd6] rounded-xl shadow-md">
                    <button
                      onClick={() => { setShowEditModal(true); setNewDisplayName(user.display_name || user.username || ""); }}
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

      <main className="flex-1 flex gap-4 p-6">
        <aside className="w-[85px] bg-[#a8b0c5] rounded-3xl p-4 flex flex-col items-center gap-4 justify-end">
          <img src="/player.png" className="w-20 h-20 object-contain animate-bounce-vertical" alt="Player" />
        </aside>

        <section className="flex-1 flex flex-col gap-4">
          <div className="h-[245px] bg-[#a8b0c5] rounded-3xl p-6" />
          <div className="flex-1 bg-[#a8b0c5] rounded-3xl p-6" />
        </section>

        <aside className="w-[335px] bg-[#a8b0c5] rounded-3xl p-6" />
      </main>

      {showEditModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#a8b0c5] rounded-2xl p-6 max-w-2xl w-full mx-4 border-2 border-[#8aabd6] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-pixelify text-2xl font-bold text-black">Edit Information</h2>
              <button onClick={() => setShowEditModal(false)} className="text-black hover:text-white text-2xl bg-[#5A789E] rounded-full w-8 h-8 flex items-center justify-center">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                  <label className="block font-pixelify text-sm mb-2 text-black">Name (username)</label>
                  <input type="text" value={user.username} readOnly className="w-full h-10 bg-gray-200 rounded-lg border border-solid border-[#8aabd6] px-4 font-inter text-sm text-black cursor-not-allowed" />
                </div>
                <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                  <label className="block font-pixelify text-sm mb-2 text-black">Email</label>
                  <input type="email" value={user.email} readOnly className="w-full h-10 bg-gray-200 rounded-lg border border-solid border-[#8aabd6] px-4 font-inter text-sm text-black cursor-not-allowed" />
                </div>
                <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                  <label className="block font-pixelify text-sm mb-2 text-black">Display name</label>
                  <input type="text" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} minLength={2} maxLength={50} className="w-full h-10 bg-white rounded-lg border border-solid border-[#8aabd6] px-4 font-inter text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5A789E] placeholder-gray-500" />
                </div>
              </div>

              <div className="bg-[#bcc3d4] rounded-xl p-4 border border-[#8aabd6]">
                <label className="block font-pixelify text-sm mb-2 text-black">Profile Picture</label>
                <AvatarUpload
                  currentAvatar={user.avatar_url}
                  onUploadSuccess={(avatarUrl) => {
                    const updated = { ...user, avatar_url: avatarUrl };
                    setUser(updated);
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
                    const res = await updateProfile({ display_name: newDisplayName });
                    const updatedUser = { ...user, ...res.user };
                    setUser(updatedUser);
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
        </div>
      )}
    </div>
  );
}

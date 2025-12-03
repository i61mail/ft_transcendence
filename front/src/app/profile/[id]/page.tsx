"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import { getUserProfile, API_URL } from "@/lib/api";

interface UserProfile {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const verifyAuthAndLoadProfile = async () => {
      try {
        // Verify authentication
        const response = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
        if (!response.ok) throw new Error("Not authenticated");
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Load user profile by ID
        const profileData = await getUserProfile(parseInt(userId));
        setProfile(profileData.user);
        setLoading(false);
      } catch (e: any) {
        // Don't log user not found errors to console
        if (e.message !== "User not found") {
          console.error("Error loading profile:", e);
        }
        
        setError(e.message || "Failed to load profile");
        setLoading(false);
        
        // If not authenticated, redirect to home
        if (e.message === "Not authenticated") {
          localStorage.removeItem("user");
          router.push("/");
        }
      }
    };
    
    verifyAuthAndLoadProfile();
  }, [router, userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#bcc3d4]">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    // Check if it's a "user not found" error
    const isUserNotFound = error.includes("User not found") || error.includes("not found");
    
    return (
      <div className="min-h-screen flex flex-col bg-[#bcc3d4]">
        <Header user={user} onUserUpdate={setUser} activeRoute="chat" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#a8b0c5] rounded-3xl p-12 w-full max-w-6xl shadow-lg">
            <div className="text-center">
              <p className="text-6xl mb-6">👤</p>
              <p className="text-3xl font-bold text-gray-800 mb-3">
                {isUserNotFound ? "User Not Found" : "Unable to Load Profile"}
              </p>
              <p className="text-lg text-gray-600 mb-8">
                {isUserNotFound 
                  ? "The user you're looking for doesn't exist or has been removed."
                  : "There was an error loading this profile. Please try again later."}
              </p>
              <button
                onClick={() => router.back()}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-8 rounded-full transition-colors shadow-md"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-[#bcc3d4]">
        <Header user={user} onUserUpdate={setUser} activeRoute="chat" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#a8b0c5] rounded-3xl p-12 w-full max-w-6xl shadow-lg text-center">
            <p className="text-2xl text-gray-700">👤 Profile not found</p>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = profile.avatar_url 
    ? `${API_URL}${profile.avatar_url}`
    : "/default-avatar.png";

  const displayName = profile.display_name || profile.username;

  return (
    <div className="min-h-screen bg-[#bcc3d4] flex flex-col">
      <Header user={user} onUserUpdate={setUser} activeRoute="chat" />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-[#a8b0c5] rounded-3xl p-12 w-full max-w-6xl shadow-lg">
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => router.back()}
              className="text-3xl hover:bg-[#8aabd6] rounded-full w-12 h-12 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <h1 className="text-4xl font-bold text-gray-800">
              {displayName}'s Profile
            </h1>
          </div>

          <div className="flex flex-col items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={avatarUrl}
                alt={`${displayName}'s avatar`}
                className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/default-avatar.png";
                }}
              />
            </div>

            {/* Profile Information */}
            <div className="w-full space-y-4">
              {/* Display Name */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 uppercase mb-1">
                  Display Name
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {displayName}
                </p>
              </div>

              {/* Username */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 uppercase mb-1">
                  Username
                </p>
                <p className="text-xl font-bold text-gray-800">
                  @{profile.username}
                </p>
              </div>

              {/* Member Since */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 uppercase mb-1">
                  Member Since
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Game Stats section */}
            <div className="w-full mt-6 bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Game Statistics</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">0</p>
                  <p className="text-sm text-gray-500">Wins</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">0</p>
                  <p className="text-sm text-gray-500">Losses</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">0%</p>
                  <p className="text-sm text-gray-500">Win Rate</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center italic">
                Stats will be tracked in future updates
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

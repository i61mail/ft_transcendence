"use client";

import React, { useState, useRef } from "react";
import { uploadAvatar, getApiUrl } from "@/lib/api";

interface AvatarUploadProps
{
  currentAvatar?: string | null;
  onUploadSuccess: (avatarUrl: string) => void;
}

export default function AvatarUpload({ currentAvatar, onUploadSuccess }: AvatarUploadProps)
{
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file)
      return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }
    setError("");
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try
    {
      const result = await uploadAvatar(file);
      // Update user in localStorage
      const userStr = localStorage.getItem("user");
      if (userStr)
      {
        const user = JSON.parse(userStr);
        user.avatar_url = result.avatar_url;
        localStorage.setItem("user", JSON.stringify(user));
      }
      onUploadSuccess(result.avatar_url);
      setPreview(null);
      if (fileInputRef.current)
        fileInputRef.current.value = "";
    }
    catch (err: any)
    {
      setError(err.message);
    }
    finally
    {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file)
      return;

    setUploading(true);
    setError("");

    try
    {
      const result = await uploadAvatar(file);
      
      // Update user in localStorage
      const userStr = localStorage.getItem("user");
      if (userStr)
      {
        const user = JSON.parse(userStr);
        user.avatar_url = result.avatar_url;
        localStorage.setItem("user", JSON.stringify(user));
      }

      onUploadSuccess(result.avatar_url);
      setPreview(null);
      if (fileInputRef.current)
        fileInputRef.current.value = "";
    }
    catch (err: any)
    {
      setError(err.message);
    }
    finally
    {
      setUploading(false);
    }
  };

  // Handle both local paths (/uploads/...) and external URLs (https://...)
  const avatarSrc = preview || 
    (currentAvatar 
      ? (currentAvatar.startsWith('http') ? currentAvatar : `${getApiUrl()}${currentAvatar}`)
      : "/default-avatar.png");

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
        <img
          src={avatarSrc}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Upload Button */}
      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="avatar-upload"
        />
        <label
          htmlFor="avatar-upload"
          className="px-4 py-2 bg-[#5A789E] text-white rounded-lg cursor-pointer hover:bg-[#4a6888] transition-colors text-sm font-pixelify"
        >
          Choose Image
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <p className="text-xs text-gray-500 text-center">
        Max size: 5MB<br />
        Formats: JPG, PNG, GIF, WebP
      </p>
    </div>
  );
}

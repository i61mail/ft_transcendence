"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { API_URL } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#bcc3d4]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#bcc3d4] flex flex-col">
      <Header user={user} onUserUpdate={setUser} activeRoute="dashboard" />

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
    </div>
  );
}

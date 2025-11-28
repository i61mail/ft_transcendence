'use client'
import Login from "../components/features/auth/Login";
import { useAuth } from "@/context/AuthProvider";
import { useGlobalContext } from "@/context/GLobalContextProvider";
import useglobalStore from "@/context/GlobalStore";
import {useRouter} from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const manager = useglobalStore();

  useEffect(() =>
  {
    if (!manager.isLogged)
      router.push('/login');
  }, [router, manager])

  return (
    <main >
    </main>
  );
}

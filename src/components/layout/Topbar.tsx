"use client";

import { useRouter }
from "next/navigation";

import { useAuthStore }
from "@/store/authStore";

import { Bell } from "lucide-react";

import UserMenu
from "@/components/layout/UserMenu";

export default function Topbar() {

  const router = useRouter();

  const { logout } =
    useAuthStore();

  const handleLogout = () => {

    logout();

    router.push("/login");
  };

  return (

    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">

      <div>

        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

      </div>

      <div className="flex items-center gap-6">

        <button className="relative">

          <Bell className="text-slate-600" />

          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />

        </button>

        <UserMenu />

        <button
          onClick={handleLogout}
          className="
            px-4 py-2
            rounded-lg
            border
            text-slate-700
            hover:bg-slate-100
          "
        >
          Logout
        </button>

      </div>

    </header>
  );
}
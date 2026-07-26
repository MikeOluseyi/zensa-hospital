"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, User } from "lucide-react";

import { useAuthStore } from "@/store/authStore";

export default function UserMenu() {

  const router = useRouter();

  const [open, setOpen] = useState(false);

  const {
    user,
    logout
  } = useAuthStore();

  function handleLogout() {

    logout();

    router.push("/login");
  }

  return (

    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3"
      >

        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">

          <User size={18} />

        </div>

        <div className="text-left">

          <p className="font-semibold text-sm">
            {user?.firstName}
          </p>

          <p className="text-xs text-slate-500">
            {user?.role}
          </p>

        </div>

      </button>

      {open && (

        <div className="absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-lg z-50">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100"
          >

            <LogOut size={18} />

            Logout

          </button>

        </div>
      )}
    </div>
  );
}
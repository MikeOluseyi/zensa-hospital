"use client";

import Sidebar
from "@/components/layout/Sidebar";

import Topbar
from "@/components/layout/Topbar";

import RoleGuard
from "@/components/auth/RoleGuard";

export default function LabLayout({

  children

}: {

  children: React.ReactNode;

}) {

  return (

    <RoleGuard
      allowedRoles={["LAB_TECH, ADMIN, RADIOLOGY"]}
    >

      <div className="flex h-screen">

        <Sidebar />

        <div className="flex-1 flex flex-col">

          <Topbar />

          <main className="flex-1 p-6 overflow-y-auto bg-slate-50">

            {children}

          </main>

        </div>

      </div>

    </RoleGuard>
  );
}
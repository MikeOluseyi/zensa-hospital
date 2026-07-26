"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  LogOut,
  ChevronDown,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, i) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <RoleGuard
      allowedRoles={[
        "ADMIN",
        "DOCTOR",
        "NURSE",
        "RECEPTIONIST",
        "PHARMACIST",
        "LAB_TECH",
        "ACCOUNTANT",
        "RADIOLOGY"
      ]}
    >
      <div className="flex h-screen min-w-0 overflow-hidden bg-slate-50">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                title="Toggle sidebar"
              >
                {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
              </button>

              <nav className="hidden sm:flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href} className="flex items-center gap-2">
                    {i > 0 && <span className="text-slate-300">/</span>}
                    <span
                      className={cn(
                        i === breadcrumbs.length - 1
                          ? "text-slate-900 font-medium"
                          : "text-slate-500"
                      )}
                    >
                      {crumb.label}
                    </span>
                  </span>
                ))}
              </nav>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>

              <div className="w-px h-6 bg-slate-200 hidden sm:block" />

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-sm font-bold">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500 capitalize leading-tight">
                      {user?.role?.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-slate-400 transition-transform",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {user?.role?.toLowerCase().replace("_", " ")}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          router.push("/dashboard/profile");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Account Settings
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Direct Logout Button (desktop only) */}
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
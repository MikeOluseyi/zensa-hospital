"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardPlus,
  Package2,
  Receipt,
  UserCog,
  Building2,
  BedDouble,
  HeartPulse,
  ClipboardCheck,
  Hospital,
  Stethoscope,
  Pill,
  FlaskConical,
  User,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  BriefcaseMedical,
  Bed,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

const roleMenus: Record<string, MenuItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Patients", href: "/dashboard/patients", icon: Users },
    { label: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
    { label: "Medical Records", href: "/dashboard/medical-records", icon: ClipboardPlus },
    { label: "Inventory", href: "/dashboard/inventory", icon: Package2 },
    { label: "Billing", href: "/dashboard/billing", icon: Receipt },
    { label: "Staff", href: "/dashboard/staff", icon: UserCog },
    { label: "Departments", href: "/dashboard/departments", icon: Building2 },
    { label: "Services", href: "/dashboard/services", icon: BriefcaseMedical },
    { label: "Wards", href: "/dashboard/facility/wards", icon: Hospital },
    { label: "Triage", href: "/dashboard/nurse/triage", icon: HeartPulse },
    { label: "Beds", href: "/dashboard/facility/beds", icon: BedDouble },
    { label: "Check In", href: "/dashboard/nurse/checkin", icon: ClipboardCheck },
    { label: "Check In", href: "/dashboard/walk-in", icon: Users },
    { label: "Admissions", href: "/dashboard/admissions", icon: Bed },
  ],
  DOCTOR: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
    { label: "Patients", href: "/dashboard/patients", icon: Users },
    { label: "Medical Records", href: "/dashboard/medical-records", icon: ClipboardPlus },
    { label: "Doctor Queue", href: "/dashboard/doctor/queue", icon: Users },
    { label: "Inpatients", href: "/dashboard/inpatients", icon: BedDouble },
  ],
  NURSE: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Patients", href: "/dashboard/patients", icon: Users },
    { label: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
    { label: "Check In", href: "/dashboard/walk-in", icon: Users },
    { label: "Queue", href: "/dashboard/nurse/queue", icon: Users },
    { label: "Admissions", href: "/dashboard/admissions", icon: BedDouble },
    { label: "Wards", href: "/dashboard/facility/wards", icon: Hospital },
    { label: "Check In", href: "/dashboard/nurse/checkin", icon: ClipboardCheck },
    { label: "Triage", href: "/dashboard/nurse/triage", icon: HeartPulse },
    { label: "Admission Requests", href: "/dashboard/admission-requests", icon: HeartPulse },
    { label: "Ward Patients", href: "/dashboard/ward-patients", icon: Users },
    { label: "Beds", href: "/dashboard/facility/beds", icon: BedDouble },
  ],
  ACCOUNTANT: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Billing", href: "/dashboard/billing", icon: Receipt },
  ],
  PHARMACIST: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Inventory", href: "/dashboard/inventory", icon: Package2 },
    { label: "Pharmacy", href: "/pharmacy", icon: Pill },
  ],
  LAB_SCIENTIST: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Lab Requests", href: "/dashboard/lab", icon: FlaskConical },
  ],
  RECEPTIONIST: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Patients", href: "/dashboard/patients", icon: Users },
    { label: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
    { label: "Check In", href: "/dashboard/walk-in", icon: Users },
  ],
};

interface SidebarProps {
  collapsed?: boolean;
  onCollapseToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onCollapseToggle }: SidebarProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const menu = [
    ...(roleMenus[user?.role || ""] || []),
    { label: "Account", href: "/dashboard/account", icon: User },
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-[#1a237e] text-blue-100 flex flex-col transition-all duration-300 z-50 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header - Logo */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-blue-800/50">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <img
            src="/zensalogo.png"
            alt="Zensa"
            className="h-8 w-auto object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {!collapsed && (
            <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap">
              ZENSA
            </span>
          )}
        </Link>

        <button
          onClick={onCollapseToggle}
          className="p-1.5 rounded-lg hover:bg-blue-800/50 text-blue-300 hover:text-white transition-colors shrink-0"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                "hover:bg-blue-800/50 hover:text-white",
                isActive && "bg-blue-500/20 text-white hover:bg-blue-500/30",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={18}
                className={cn("shrink-0", isActive ? "text-white" : "text-blue-300")}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    size={14}
                    className={cn(
                      "text-blue-400/50 transition-transform shrink-0",
                      isActive && "text-white rotate-90"
                    )}
                  />
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-blue-800/50 shrink-0">
        {/* Logout */}
        <button
          onClick={() => {
            window.location.href = "/login";
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-3 text-sm font-medium text-blue-300 hover:text-white hover:bg-blue-800/50 transition-all w-full",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* User */}
        {!collapsed && user && (
          <div className="px-4 py-3 border-t border-blue-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-blue-300 capitalize">
                  {user.role?.toLowerCase().replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

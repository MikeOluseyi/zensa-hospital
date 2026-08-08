"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Package2,
  Receipt,
  UserCog,
  Building2,
  BedDouble,
  ClipboardCheck,
  Hospital,
  Pill,
  FlaskConical,
  User,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  BriefcaseMedical,
  Bed,
  ListChecks,
  FileText,
  ShieldCheck,
  DoorOpen,
  Activity,
  ChevronDown,
  Inbox,
  UserRound,
  Settings,
  ShieldUser,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface SubMenuItem {
  label: string;
  href: string;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  children?: SubMenuItem[];
}

const roleMenus: Record<string, MenuItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Patients", href: "/dashboard/patients", icon: UserRound },
    { label: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
    { label: "Medical Records", href: "/dashboard/medical-records", icon: FileText },
    { label: "Triage", href: "/dashboard/nurse/triage", icon: Activity },
    { label: "Check In", href: "/dashboard/nurse/checkin", icon: ClipboardCheck },
    { label: "Walk In", href: "/dashboard/walk-in", icon: DoorOpen },
    { label: "Admissions", href: "/dashboard/admissions", icon: Bed },
    { label: "Wards", href: "/dashboard/facility/wards", icon: Hospital },
    { label: "Beds", href: "/dashboard/facility/beds", icon: BedDouble },
    { label: "Inventory", href: "/dashboard/inventory", icon: Package2 },
    {
      label: "Billing",
      href: "/dashboard/billing",
      icon: Receipt,
      children: [
        { label: "Charges", href: "/dashboard/billing/charges" },
        { label: "Invoices", href: "/dashboard/billing/invoice" },
      ],
    },
    { label: "Authorization Requests", href: "/dashboard/authorization-requests", icon: ShieldUser},
    { label: "Claims", href: "/dashboard/claims", icon: ShieldCheck },
    { label: "Staff", href: "/dashboard/staff", icon: UserCog },
    { label: "Departments", href: "/dashboard/departments", icon: Building2 },
    { label: "Management", href: "/dashboard/management", icon: Settings },
    { label: "Services", href: "/dashboard/services", icon: BriefcaseMedical },
  ],
  DOCTOR: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Doctor Queue", href: "/dashboard/doctor/queue", icon: ListChecks },
    { label: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
    { label: "Patients", href: "/dashboard/patients", icon: UserRound },
    { label: "Inpatients", href: "/dashboard/inpatients", icon: BedDouble },
    { label: "Medical Records", href: "/dashboard/medical-records", icon: FileText },
  ],
  NURSE: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Triage", href: "/dashboard/nurse/triage", icon: Activity },
    { label: "Check In", href: "/dashboard/nurse/checkin", icon: ClipboardCheck },
    { label: "Queue", href: "/dashboard/nurse/queue", icon: ListChecks },
    { label: "Admissions", href: "/dashboard/admissions", icon: Bed },
    { label: "Admission Requests", href: "/dashboard/admission-requests", icon: Inbox },
    { label: "Ward Patients", href: "/dashboard/ward-patients", icon: Users },
    { label: "Patients", href: "/dashboard/patients", icon: UserRound },
    { label: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
    { label: "Wards", href: "/dashboard/facility/wards", icon: Hospital },
    { label: "Beds", href: "/dashboard/facility/beds", icon: BedDouble },
  ],
  ACCOUNTANT: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      label: "Billing",
      href: "/dashboard/billing",
      icon: Receipt,
      children: [
        { label: "Charges", href: "/dashboard/billing/charges" },
        { label: "Invoices", href: "/dashboard/billing/invoice" },
      ],
    },
  ],
  PHARMACIST: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Pharmacy", href: "/dashboard/pharmacy", icon: Pill },
    { label: "Inventory", href: "/dashboard/inventory", icon: Package2 },
  ],
  LAB_SCIENTIST: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Lab Requests", href: "/dashboard/lab", icon: FlaskConical },
  ],
  RECEPTIONIST: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Check In", href: "/dashboard/walk-in", icon: ClipboardCheck },
    { label: "Patients", href: "/dashboard/patients", icon: UserRound },
    { label: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
  ],
};

interface SidebarProps {
  collapsed?: boolean;
  onCollapseToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onCollapseToggle }: SidebarProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const menu: MenuItem[] = [
    ...(roleMenus[user?.role || ""] || []),
    { label: "Account", href: "/dashboard/account", icon: User },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "h-screen bg-[#1a237e] text-blue-100 flex flex-col transition-all duration-300 ease-in-out z-50 shrink-0 shadow-xl",
        collapsed ? "w-18" : "w-64"
      )}
    >
      {/* Header - Logo */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-blue-800/40">
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
          className="p-1.5 rounded-lg hover:bg-blue-800/60 text-blue-300 hover:text-white transition-all shrink-0"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-transparent">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedMenus[item.href];

          return (
            <div key={item.href} className="space-y-0.5">
              {hasChildren && !collapsed ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.href)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full",
                      "hover:bg-blue-800/60 hover:text-white",
                      active && "bg-blue-500/20 text-white"
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn("shrink-0", active ? "text-white" : "text-blue-300")}
                    />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                        {item.badge}
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-blue-400 transition-transform duration-200 shrink-0",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200 ease-in-out",
                      isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="pl-10 pr-2 py-1 space-y-0.5 border-l border-blue-800/40 ml-5">
                      {item.children?.map((child: SubMenuItem) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all",
                              "hover:bg-blue-800/40 hover:text-white",
                              childActive
                                ? "bg-blue-500/15 text-white font-medium"
                                : "text-blue-300/80"
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    "hover:bg-blue-800/60 hover:text-white",
                    active && "bg-blue-500/20 text-white shadow-sm",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    className={cn(
                      "shrink-0 transition-colors",
                      active ? "text-white" : "text-blue-300 group-hover:text-white"
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        size={14}
                        className={cn(
                          "text-blue-400/50 transition-transform shrink-0",
                          active && "text-white rotate-90"
                        )}
                      />
                    </>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-blue-800/40 shrink-0 p-3">
        <button
          onClick={() => {
            window.location.href = "/login";
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-blue-300 hover:text-white hover:bg-blue-800/60 transition-all rounded-lg w-full",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  CreditCard,
  BedDouble,
  Receipt,
  Pill,
  FlaskConical,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  ChevronRight,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────

interface DashboardData {
  todayAppointments: number;
  todayRevenue: number;
  totalPatients: number;
  activeAdmissions: number;
  occupiedBeds: number;
  availableBeds: number;
  pendingInvoices: number;
  pendingPrescriptions: number;
  pendingLabRequests: number;
  activeConsultations: number;
  waitingPatients: number;
}

interface RecentActivity {
  type: string;
  title: string;
  description: string;
  time: string;
}

// ─── Components ─────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        <ChevronRight
          size={16}
          className="text-slate-300 group-hover:text-slate-500 transition-colors"
        />
      </div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </Link>
  );
}

function ActivityItem({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  time,
  status,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
  status?: "urgent" | "normal" | "completed";
}) {
  const statusStyles = {
    urgent: "bg-red-50 text-red-700 border-red-200",
    normal: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={14} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <span className="text-xs text-slate-400 shrink-0">{time}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{description}</p>
      </div>
      {status && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyles[status]}`}>
          {status}
        </span>
      )}
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: { label: string; href: string } }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {action && (
        <Link
          href={action.href}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          {action.label}
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboard();
    fetchRecentActivity();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/summary");
      setData(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecentActivity() {
    try {
      const res = await api.get("/dashboard/activity");
      setRecentActivity(res.data);
    } catch {
      setRecentActivity([]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load dashboard</h3>
        <p className="text-sm mb-4">Unable to fetch dashboard data from the server.</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalBeds = data.occupiedBeds + data.availableBeds;
  const bedOccupancyRate = totalBeds > 0 ? Math.round((data.occupiedBeds / totalBeds) * 100) : 0;

  const stats = [
    {
      label: "Total Patients",
      value: data.totalPatients,
      subtitle: "Registered patients",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/dashboard/patients",
    },
    {
      label: "Today's Appointments",
      value: data.todayAppointments,
      subtitle: "Scheduled today",
      icon: CalendarDays,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      href: "/dashboard/appointments",
    },
    {
      label: "Today's Revenue",
      value: `₦${data.todayRevenue.toLocaleString()}`,
      subtitle: "From appointments",
      icon: CreditCard,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/dashboard/billing",
    },
    {
      label: "Active Admissions",
      value: data.activeAdmissions,
      subtitle: "Currently admitted",
      icon: BedDouble,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/dashboard/admissions",
    },
    {
      label: "Occupied Beds",
      value: data.occupiedBeds,
      subtitle: `${bedOccupancyRate}% occupancy`,
      icon: BedDouble,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      href: "/dashboard/facility/beds",
    },
    {
      label: "Available Beds",
      value: data.availableBeds,
      subtitle: "Ready for patients",
      icon: BedDouble,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      href: "/dashboard/facility/beds",
    },
    {
      label: "Pending Invoices",
      value: data.pendingInvoices,
      subtitle: "Awaiting payment",
      icon: Receipt,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/dashboard/billing",
    },
    {
      label: "Pending Prescriptions",
      value: data.pendingPrescriptions,
      subtitle: "Pharmacy review",
      icon: Pill,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      href: "/dashboard/pharmacy",
    },
    {
      label: "Pending Lab Requests",
      value: data.pendingLabRequests,
      subtitle: "Results pending",
      icon: FlaskConical,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      href: "/dashboard/lab",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back — here's what's happening today
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200">
          <Clock size={16} />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
            href={stat.href}
          />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bed Occupancy */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <SectionHeader
              title="Bed Occupancy"
              action={{ label: "Manage Beds", href: "/dashboard/facility/beds" }}
            />
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 * (1 - bedOccupancyRate / 100)}
                    className="text-blue-600 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{bedOccupancyRate}%</span>
                  <span className="text-xs text-slate-500">Occupied</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-sm text-slate-600">Occupied</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{data.occupiedBeds}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-600">Available</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{data.availableBeds}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-slate-600">Total Capacity</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{totalBeds}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <SectionHeader
              title="Today's Overview"
              action={{ label: "View Reports", href: "/dashboard/reports" }}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={16} className="text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Revenue</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">₦{data.todayRevenue.toLocaleString()}</p>
                <p className="text-xs text-emerald-600 mt-1">From {data.todayAppointments} appointments</p>
              </div>
              <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-violet-600" />
                  <span className="text-sm font-medium text-violet-800">Active Queue</span>
                </div>
                <p className="text-2xl font-bold text-violet-900">{data.waitingPatients + data.activeConsultations}</p>
                <p className="text-xs text-violet-600 mt-1">
                  {data.waitingPatients} waiting · {data.activeConsultations} in consult
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <SectionHeader
              title="Pending Actions"
              action={{ label: "View All", href: "/dashboard/tasks" }}
            />
            <div className="space-y-2">
              {data.pendingPrescriptions > 0 && (
                <ActivityItem
                  icon={Pill}
                  iconColor="text-pink-600"
                  iconBg="bg-pink-50"
                  title={`${data.pendingPrescriptions} Prescriptions`}
                  description="Awaiting pharmacy review"
                  time="Now"
                  status="urgent"
                />
              )}
              {data.pendingLabRequests > 0 && (
                <ActivityItem
                  icon={FlaskConical}
                  iconColor="text-indigo-600"
                  iconBg="bg-indigo-50"
                  title={`${data.pendingLabRequests} Lab Requests`}
                  description="Results pending"
                  time="Now"
                  status="normal"
                />
              )}
              {data.pendingInvoices > 0 && (
                <ActivityItem
                  icon={Receipt}
                  iconColor="text-orange-600"
                  iconBg="bg-orange-50"
                  title={`${data.pendingInvoices} Invoices`}
                  description="Awaiting payment"
                  time="Now"
                  status="normal"
                />
              )}
              {data.pendingPrescriptions === 0 && data.pendingLabRequests === 0 && data.pendingInvoices === 0 && (
                <div className="flex flex-col items-center py-8 text-slate-400">
                  <CheckCircle2 size={32} className="mb-2 text-emerald-500" />
                  <p className="text-sm font-medium text-slate-600">All caught up!</p>
                  <p className="text-xs">No pending actions</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <SectionHeader title="Recent Activity" />
            <div className="space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => (
                  <ActivityItem
                    key={i}
                    icon={activity.type === "appointment" ? CalendarDays : activity.type === "vitals" ? HeartPulse : Stethoscope}
                    iconColor="text-slate-500"
                    iconBg="bg-slate-100"
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center py-8 text-slate-400">
                  <Clock size={32} className="mb-2" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "New Patient", href: "/dashboard/patients/new", icon: Users },
                { label: "Book Appointment", href: "/dashboard/appointments/new", icon: CalendarDays },
                { label: "Create Invoice", href: "/dashboard/billing/new", icon: Receipt },
                { label: "Admit Patient", href: "/dashboard/admissions/new", icon: BedDouble },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <link.icon size={16} />
                  {link.label}
                  <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

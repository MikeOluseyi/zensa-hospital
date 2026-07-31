"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Users, CalendarDays, CreditCard, BedDouble, Receipt, Pill,
  FlaskConical, Activity, Clock, AlertCircle, CheckCircle2,
  Stethoscope, HeartPulse, ChevronRight, ArrowUpRight, Loader2,
  ClipboardCheck, UserCog, Wallet, Package, Building2,
} from "lucide-react";

// ─── Shared building blocks ──────────────────────────────

function StatCard({
  title, value, subtitle, icon: Icon, color, bgColor, href,
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
        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </Link>
  );
}

function QuickLinks({ links }: { links: { label: string; href: string; icon: any }[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
      <div className="space-y-2">
        {links.map((link) => (
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
  );
}

function HomeHeader({ greeting, subtitle }: { greeting: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{greeting}</h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200">
        <Clock size={16} />
        {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

function HomeLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-sm">Loading...</p>
      </div>
    </div>
  );
}

// ─── DOCTOR home ──────────────────────────────────────────

function DoctorHome({ firstName }: { firstName?: string }) {
  const [loading, setLoading] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [inpatientCount, setInpatientCount] = useState(0);
  const [todayApptCount, setTodayApptCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [queueRes, inpatientsRes, apptsRes] = await Promise.all([
        api.get("/appointments/doctor-queue"),
        api.get("/admissions/my-patients"),
        api.get("/appointments"),
      ]);

      setQueueCount(queueRes.data.length);
      setInpatientCount(inpatientsRes.data.length);

      const today = new Date().toDateString();
      setTodayApptCount(
        apptsRes.data.filter(
          (a: any) => new Date(a.appointmentDate).toDateString() === today
        ).length
      );
    } catch {
      // leave defaults
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <HomeLoading />;

  return (
    <div className="space-y-8">
      <HomeHeader
        greeting={`Welcome back, Dr. ${firstName ?? ""}`}
        subtitle="Here's what's on your list today"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Patients Waiting"
          value={queueCount}
          subtitle="In your consultation queue"
          icon={Stethoscope}
          color="text-blue-600"
          bgColor="bg-blue-50"
          href="/dashboard/doctor/queue"
        />
        <StatCard
          title="My Inpatients"
          value={inpatientCount}
          subtitle="Currently under your care"
          icon={BedDouble}
          color="text-amber-600"
          bgColor="bg-amber-50"
          href="/dashboard/inpatients"
        />
        <StatCard
          title="Today's Appointments"
          value={todayApptCount}
          subtitle="Scheduled for today"
          icon={CalendarDays}
          color="text-violet-600"
          bgColor="bg-violet-50"
          href="/dashboard/appointments"
        />
      </div>

      <QuickLinks
        links={[
          { label: "Consultation Queue", href: "/dashboard/doctor/queue", icon: Stethoscope },
          { label: "My Inpatients", href: "/dashboard/inpatients", icon: BedDouble },
          { label: "All Appointments", href: "/dashboard/appointments", icon: CalendarDays },
          { label: "Medical Records", href: "/dashboard/medical-records", icon: Receipt },
        ]}
      />
    </div>
  );
}

// ─── NURSE home ───────────────────────────────────────────

function NurseHome({ firstName }: { firstName?: string }) {
  const [loading, setLoading] = useState(true);
  const [checkinCount, setCheckinCount] = useState(0);
  const [triageCount, setTriageCount] = useState(0);
  const [wardCount, setWardCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [apptsRes, triageRes, wardRes] = await Promise.all([
        api.get("/appointments"),
        api.get("/visits/triage-queue"),
        api.get("/admissions/ward-patients"),
      ]);

      setCheckinCount(apptsRes.data.filter((a: any) => a.status === "SCHEDULED").length);
      setTriageCount(triageRes.data.length);
      setWardCount(wardRes.data.length);
    } catch {
      // leave defaults
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <HomeLoading />;

  return (
    <div className="space-y-8">
      <HomeHeader
        greeting={`Welcome back, ${firstName ?? ""}`}
        subtitle="Here's today's nursing workload"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Awaiting Check-In"
          value={checkinCount}
          subtitle="Scheduled appointments"
          icon={ClipboardCheck}
          color="text-blue-600"
          bgColor="bg-blue-50"
          href="/dashboard/nurse/checkin"
        />
        <StatCard
          title="Triage Queue"
          value={triageCount}
          subtitle="Checked in, awaiting vitals"
          icon={HeartPulse}
          color="text-rose-600"
          bgColor="bg-rose-50"
          href="/dashboard/nurse/triage"
        />
        <StatCard
          title="Ward Patients"
          value={wardCount}
          subtitle="Assigned to your department"
          icon={BedDouble}
          color="text-amber-600"
          bgColor="bg-amber-50"
          href="/dashboard/ward-patients"
        />
      </div>

      <QuickLinks
        links={[
          { label: "Check-In Queue", href: "/dashboard/nurse/checkin", icon: ClipboardCheck },
          { label: "Triage Queue", href: "/dashboard/nurse/triage", icon: HeartPulse },
          { label: "Ward Patients", href: "/dashboard/ward-patients", icon: BedDouble },
          { label: "Admission Requests", href: "/dashboard/admission-request", icon: BedDouble },
        ]}
      />
    </div>
  );
}

// ─── RECEPTIONIST home ────────────────────────────────────

function ReceptionistHome({ firstName }: { firstName?: string }) {
  const [loading, setLoading] = useState(true);
  const [checkinCount, setCheckinCount] = useState(0);
  const [todayApptCount, setTodayApptCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/appointments");
      setCheckinCount(res.data.filter((a: any) => a.status === "SCHEDULED").length);

      const today = new Date().toDateString();
      setTodayApptCount(
        res.data.filter((a: any) => new Date(a.appointmentDate).toDateString() === today).length
      );
    } catch {
      // leave defaults
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <HomeLoading />;

  return (
    <div className="space-y-8">
      <HomeHeader
        greeting={`Welcome back, ${firstName ?? ""}`}
        subtitle="Front desk overview for today"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Awaiting Check-In"
          value={checkinCount}
          subtitle="Scheduled appointments"
          icon={ClipboardCheck}
          color="text-blue-600"
          bgColor="bg-blue-50"
          href="/dashboard/nurse/checkin"
        />
        <StatCard
          title="Today's Appointments"
          value={todayApptCount}
          subtitle="All appointments today"
          icon={CalendarDays}
          color="text-violet-600"
          bgColor="bg-violet-50"
          href="/dashboard/appointments"
        />
      </div>

      <QuickLinks
        links={[
          { label: "Check-In Queue", href: "/dashboard/nurse/checkin", icon: ClipboardCheck },
          { label: "All Appointments", href: "/dashboard/appointments", icon: CalendarDays },
          { label: "Register Patient", href: "/dashboard/patients/new", icon: Users },
        ]}
      />
    </div>
  );
}

// ─── PHARMACIST home ──────────────────────────────────────

function PharmacistHome({ firstName }: { firstName?: string }) {
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [pendingRes, lowStockRes] = await Promise.all([
        api.get("/pharmacy"),
        api.get("/inventory/low-stock"),
      ]);

      setPendingCount(pendingRes.data.length);
      setLowStockCount(lowStockRes.data.length);
    } catch {
      // leave defaults
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <HomeLoading />;

  return (
    <div className="space-y-8">
      <HomeHeader
        greeting={`Welcome back, ${firstName ?? ""}`}
        subtitle="Pharmacy overview for today"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Pending Prescriptions"
          value={pendingCount}
          subtitle="Awaiting dispensing"
          icon={Pill}
          color="text-pink-600"
          bgColor="bg-pink-50"
          href="/dashboard/pharmacy"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          subtitle="At or below reorder level"
          icon={Package}
          color="text-amber-600"
          bgColor="bg-amber-50"
          href="/dashboard/inventory"
        />
      </div>

      <QuickLinks
        links={[
          { label: "Dispense Queue", href: "/dashboard/pharmacy", icon: Pill },
          { label: "Inventory", href: "/dashboard/inventory", icon: Package },
        ]}
      />
    </div>
  );
}

// ─── LAB_TECH / RADIOLOGY home ────────────────────────────

function LabHome({ firstName }: { firstName?: string }) {
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/procedure/pending");
      setPendingCount(res.data.length);
    } catch {
      // leave defaults
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <HomeLoading />;

  return (
    <div className="space-y-8">
      <HomeHeader
        greeting={`Welcome back, ${firstName ?? ""}`}
        subtitle="Lab & radiology overview for today"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          subtitle="Awaiting results"
          icon={FlaskConical}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
          href="/dashboard/lab"
        />
      </div>

      <QuickLinks
        links={[
          { label: "Pending Requests", href: "/dashboard/lab", icon: FlaskConical },
        ]}
      />
    </div>
  );
}

// ─── ACCOUNTANT home ──────────────────────────────────────

function AccountantHome({ firstName }: { firstName?: string }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/invoices/summary");
      setSummary(res.data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <HomeLoading />;

  return (
    <div className="space-y-8">
      <HomeHeader
        greeting={`Welcome back, ${firstName ?? ""}`}
        subtitle="Billing overview for today"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Billed"
          value={`₦${(summary?.totalBilled ?? 0).toLocaleString()}`}
          subtitle="Lifetime revenue"
          icon={Receipt}
          color="text-slate-600"
          bgColor="bg-slate-100"
          href="/dashboard/billing"
        />
        <StatCard
          title="Outstanding"
          value={`₦${(summary?.outstandingAmount ?? 0).toLocaleString()}`}
          subtitle={`${summary?.outstandingInvoices ?? 0} unpaid invoices`}
          icon={AlertCircle}
          color="text-amber-600"
          bgColor="bg-amber-50"
          href="/dashboard/billing"
        />
        <StatCard
          title="Collected Today"
          value={`₦${(summary?.amountCollectedToday ?? 0).toLocaleString()}`}
          subtitle={`${summary?.paymentsToday ?? 0} payments received`}
          icon={Wallet}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          href="/dashboard/billing"
        />
      </div>

      <QuickLinks
        links={[
          { label: "Billing Dashboard", href: "/dashboard/billing", icon: Wallet },
          { label: "Invoices", href: "/dashboard/billing/invoice", icon: Receipt },
          { label: "Charges", href: "/dashboard/billing/charges", icon: CreditCard },
          { label: "Claims", href: "/dashboard/claims", icon: Building2 },
        ]}
      />
    </div>
  );
}

// ─── ADMIN (and unrecognized roles) home — full hospital overview ──

interface AdminDashboardData {
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

function AdminHome() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
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

  if (loading) return <HomeLoading />;

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load dashboard</h3>
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
    { label: "Total Patients", value: data.totalPatients, subtitle: "Registered patients", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50", href: "/dashboard/patients" },
    { label: "Today's Appointments", value: data.todayAppointments, subtitle: "Scheduled today", icon: CalendarDays, color: "text-violet-600", bgColor: "bg-violet-50", href: "/dashboard/appointments" },
    { label: "Today's Revenue", value: `₦${data.todayRevenue.toLocaleString()}`, subtitle: "From appointments", icon: CreditCard, color: "text-emerald-600", bgColor: "bg-emerald-50", href: "/dashboard/billing" },
    { label: "Active Admissions", value: data.activeAdmissions, subtitle: "Currently admitted", icon: BedDouble, color: "text-amber-600", bgColor: "bg-amber-50", href: "/dashboard/admissions" },
    { label: "Occupied Beds", value: data.occupiedBeds, subtitle: `${bedOccupancyRate}% occupancy`, icon: BedDouble, color: "text-rose-600", bgColor: "bg-rose-50", href: "/dashboard/facility/beds" },
    { label: "Available Beds", value: data.availableBeds, subtitle: "Ready for patients", icon: BedDouble, color: "text-cyan-600", bgColor: "bg-cyan-50", href: "/dashboard/facility/beds" },
    { label: "Pending Invoices", value: data.pendingInvoices, subtitle: "Awaiting payment", icon: Receipt, color: "text-orange-600", bgColor: "bg-orange-50", href: "/dashboard/billing" },
    { label: "Pending Prescriptions", value: data.pendingPrescriptions, subtitle: "Pharmacy review", icon: Pill, color: "text-pink-600", bgColor: "bg-pink-50", href: "/dashboard/pharmacy" },
    { label: "Pending Lab Requests", value: data.pendingLabRequests, subtitle: "Results pending", icon: FlaskConical, color: "text-indigo-600", bgColor: "bg-indigo-50", href: "/dashboard/lab" },
  ];

  return (
    <div className="space-y-8">
      <HomeHeader greeting="Dashboard" subtitle="Here's what's happening across the hospital today" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} title={stat.label} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} color={stat.color} bgColor={stat.bgColor} href={stat.href} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Bed Occupancy</h2>
              <Link href="/dashboard/facility/beds" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Manage Beds <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                  <circle
                    cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
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

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Today's Overview</h2>
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
                <p className="text-xs text-violet-600 mt-1">{data.waitingPatients} waiting · {data.activeConsultations} in consult</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending Actions</h2>
            <div className="space-y-2">
              {data.pendingPrescriptions === 0 && data.pendingLabRequests === 0 && data.pendingInvoices === 0 ? (
                <div className="flex flex-col items-center py-8 text-slate-400">
                  <CheckCircle2 size={32} className="mb-2 text-emerald-500" />
                  <p className="text-sm font-medium text-slate-600">All caught up!</p>
                </div>
              ) : (
                <>
                  {data.pendingPrescriptions > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                        <Pill size={14} className="text-pink-600" />
                      </div>
                      <p className="text-sm text-slate-700">{data.pendingPrescriptions} prescriptions awaiting review</p>
                    </div>
                  )}
                  {data.pendingLabRequests > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                        <FlaskConical size={14} className="text-indigo-600" />
                      </div>
                      <p className="text-sm text-slate-700">{data.pendingLabRequests} lab requests pending</p>
                    </div>
                  )}
                  {data.pendingInvoices > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                        <Receipt size={14} className="text-orange-600" />
                      </div>
                      <p className="text-sm text-slate-700">{data.pendingInvoices} invoices awaiting payment</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <QuickLinks
            links={[
              { label: "New Patient", href: "/dashboard/patients/new", icon: Users },
              { label: "Staff Registry", href: "/dashboard/staff", icon: UserCog },
              { label: "Departments", href: "/dashboard/departments", icon: Building2 },
              { label: "Hospital Services", href: "/dashboard/services", icon: ClipboardCheck },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) return <HomeLoading />;

  switch (user.role) {
    case "DOCTOR":
      return <DoctorHome firstName={user.firstName} />;
    case "NURSE":
      return <NurseHome firstName={user.firstName} />;
    case "RECEPTIONIST":
      return <ReceptionistHome firstName={user.firstName} />;
    case "PHARMACIST":
      return <PharmacistHome firstName={user.firstName} />;
    case "LAB_TECH":
    case "RADIOLOGY":
      return <LabHome firstName={user.firstName} />;
    case "ACCOUNTANT":
      return <AccountantHome firstName={user.firstName} />;
    case "ADMIN":
    default:
      return <AdminHome />;
  }
}
"use client";

import { useEffect, useState } from "react";
import {
  ManagementAPI,
  AuditLogEntry,
  LoginLogEntry,
  WalletTransaction,
  PermissionGrid,
} from "@/services/management";
import {
  ShieldCheck,
  ScrollText,
  LogIn,
  Wallet,
  Loader2,
  Check,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  Shield,
  FileText,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Unlock,
  AlertCircle,
  Clock,
} from "lucide-react";

type Tab = "audit" | "sessions" | "wallet" | "permissions";

export default function HospitalManagementPage() {
  const [tab, setTab] = useState<Tab>("audit");

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Shield size={14} strokeWidth={2.5} />
            Administration
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Hospital Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit trail, staff activity, wallet, and access control
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-sm w-fit">
        <TabButton
          active={tab === "audit"}
          onClick={() => setTab("audit")}
          icon={ScrollText}
          label="Audit Logs"
        />
        <TabButton
          active={tab === "sessions"}
          onClick={() => setTab("sessions")}
          icon={LogIn}
          label="Login Sessions"
        />
        <TabButton
          active={tab === "wallet"}
          onClick={() => setTab("wallet")}
          icon={Wallet}
          label="Wallet"
        />
        <TabButton
          active={tab === "permissions"}
          onClick={() => setTab("permissions")}
          icon={ShieldCheck}
          label="Permissions"
        />
      </div>

      {tab === "audit" && <AuditLogTab />}
      {tab === "sessions" && <SessionsTab />}
      {tab === "wallet" && <WalletTab />}
      {tab === "permissions" && <PermissionsTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

/* ─── Audit Logs ─── */

function AuditLogTab() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ManagementAPI.getAuditLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {logs.length === 0 ? (
        <EmptyState
          icon={<ScrollText size={28} />}
          title="No audit activity yet"
          subtitle="System actions will be recorded here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Staff</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">{log.entity}</td>
                  <td className="px-6 py-3.5">
                    {log.staff ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                          {log.staff.firstName[0]}
                          {log.staff.lastName[0]}
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {log.staff.firstName} {log.staff.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        System
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500 text-xs max-w-xs truncate">
                    {log.details ?? "-"}
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const normalized = action.toUpperCase();
  let colorClass = "bg-slate-50 text-slate-600 border-slate-200";
  if (normalized.includes("CREATE") || normalized.includes("ADD"))
    colorClass = "bg-blue-50 text-blue-700 border-blue-200";
  else if (normalized.includes("UPDATE") || normalized.includes("EDIT"))
    colorClass = "bg-amber-50 text-amber-700 border-amber-200";
  else if (normalized.includes("DELETE") || normalized.includes("REMOVE"))
    colorClass = "bg-red-50 text-red-700 border-red-200";
  else if (normalized.includes("APPROVE"))
    colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  else if (normalized.includes("REJECT"))
    colorClass = "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${colorClass}`}
    >
      {action.replaceAll("_", " ")}
    </span>
  );
}

/* ─── Login Sessions ─── */

function SessionsTab() {
  const [logs, setLogs] = useState<LoginLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ManagementAPI.getLoginLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {logs.length === 0 ? (
        <EmptyState
          icon={<LogIn size={28} />}
          title="No login activity recorded"
          subtitle="Staff login sessions will appear here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4">Staff</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Device</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {log.staff.firstName[0]}
                        {log.staff.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {log.staff.firstName} {log.staff.lastName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {log.staff.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100 uppercase tracking-wide">
                      {log.staff.role.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 font-mono text-xs">
                    {log.ipAddress ?? "-"}
                  </td>
                  <td className="px-6 py-3.5">
                    <DeviceBadge userAgent={log.userAgent} />
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DeviceBadge({ userAgent }: { userAgent?: string | null }) {
  if (!userAgent)
    return (
      <span className="text-xs text-slate-400 flex items-center gap-1">
        <Globe size={12} /> Unknown
      </span>
    );

  const ua = userAgent.toLowerCase();
  let icon = <Monitor size={12} />;
  let label = "Desktop";

  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    icon = <Smartphone size={12} />;
    label = "Mobile";
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
      {icon}
      {label}
    </span>
  );
}

/* ─── Wallet ─── */

function WalletTab() {
  const [data, setData] = useState<{
    balance: number;
    transactions: WalletTransaction[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ManagementAPI.getWallet()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;

  const isLow = (data?.balance ?? 0) <= 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div
          className={`lg:col-span-1 rounded-2xl p-6 relative overflow-hidden ${
            isLow
              ? "bg-gradient-to-br from-red-500 to-rose-600"
              : "bg-gradient-to-br from-blue-600 to-green-500"
          } text-white shadow-xl ${
            isLow ? "shadow-red-500/20" : "shadow-blue-500/20"
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Wallet size={16} />
              </div>
              <span className="text-sm font-medium text-white/80">
                Service Wallet
              </span>
            </div>
            <p className="text-4xl font-bold">
              ₦{(data?.balance ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-white/70 mt-2 leading-relaxed">
              1.5% service fee deducted on every charge posted
            </p>
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">
              Recent Transactions
            </h2>
            <span className="text-xs text-slate-400">Last 30 days</span>
          </div>

          {!data?.transactions.length ? (
            <EmptyState
              icon={<Wallet size={24} />}
              title="No wallet activity yet"
              subtitle="Transactions will appear here once processed."
              compact
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {data.transactions.map((tx) => {
                const isCredit = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isCredit ? "bg-emerald-50" : "bg-red-50"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowUpCircle
                            size={16}
                            className="text-emerald-600"
                          />
                        ) : (
                          <ArrowDownCircle size={16} className="text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {tx.description ?? tx.type}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isCredit ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {isCredit ? "+" : ""}₦{tx.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Permissions ─── */

function PermissionsTab() {
  const [data, setData] = useState<PermissionGrid | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const grid = await ManagementAPI.getPermissionGrid();
      setData(grid);
    } finally {
      setLoading(false);
    }
  }

  async function toggle(
    role: string,
    action: string,
    currentlyGranted: boolean
  ) {
    const key = `${role}:${action}`;
    setToggling(key);
    try {
      if (currentlyGranted) {
        await ManagementAPI.revokePermission(role, action);
      } else {
        await ManagementAPI.grantPermission(role, action);
      }
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to update permission.");
    } finally {
      setToggling(null);
    }
  }

  if (loading || !data) return <LoadingBlock />;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <ShieldCheck size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Access Control Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage role-based permissions across the system
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          {data.roles.length} roles · {data.permissions.length} permissions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50/50 backdrop-blur-sm z-10">
                Permission
              </th>
              {data.roles.map((role) => (
                <th
                  key={role}
                  className="px-3 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {role.replaceAll("_", " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.permissions.map((perm) => (
              <tr
                key={perm.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-2.5 sticky left-0 bg-white z-10">
                  <p className="text-sm font-semibold text-slate-800">
                    {perm.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {perm.action}
                  </p>
                </td>
                {data.roles.map((role) => {
                  const granted = data.grid[role]?.includes(perm.action);
                  const key = `${role}:${perm.action}`;
                  const isAdmin = role === "ADMIN";

                  return (
                    <td key={role} className="px-3 py-2.5 text-center">
                      <button
                        disabled={toggling === key || isAdmin}
                        onClick={() =>
                          toggle(role, perm.action, !!granted)
                        }
                        title={
                          isAdmin
                            ? "ADMIN permissions cannot be revoked"
                            : granted
                            ? "Click to revoke"
                            : "Click to grant"
                        }
                        className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all active:scale-90 ${
                          granted
                            ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                        } ${
                          isAdmin
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {toggling === key ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : granted ? (
                          <Check size={14} strokeWidth={3} />
                        ) : (
                          <X size={12} strokeWidth={3} />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Shared ─── */

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
  compact,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`text-center ${compact ? "py-12" : "py-20"}`}
    >
      <div
        className={`rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400 ${
          compact ? "w-14 h-14" : "w-16 h-16"
        }`}
      >
        {icon}
      </div>
      <p className="text-slate-600 font-semibold text-sm">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}
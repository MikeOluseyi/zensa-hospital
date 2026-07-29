"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  ShieldCheck,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Ban,
  CreditCard,
  FileText,
  Loader2,
  ArrowUpDown,
  TrendingUp,
  Receipt,
  ExternalLink,
  UserRound,
  Building2,
  Calendar,
} from "lucide-react";

type Claim = {
  id: string;
  claimNumber?: string;
  status: string;
  totalAmount: number;
  approvedAmount?: number;
  createdAt: string;

  patient: {
    firstName: string;
    lastName: string;
  };

  insurance?: {
    provider?: {
      organization?: {
        name?: string;
      };
    };
  };

  invoice?: {
    id: string;
  } | null;
};

type SortField = "claim" | "patient" | "insurer" | "total" | "approved" | "status" | "date";
type SortOrder = "asc" | "desc";

const STATUS_OPTIONS = ["ALL", "PENDING", "SUBMITTED", "APPROVED", "PARTIALLY_APPROVED", "REJECTED", "PAID"] as const;

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Clock className="w-3 h-3" />,
  },
  SUBMITTED: {
    label: "Submitted",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <FileText className="w-3 h-3" />,
  },
  APPROVED: {
    label: "Approved",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  PARTIALLY_APPROVED: {
    label: "Partial",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: <XCircle className="w-3 h-3" />,
  },
  PAID: {
    label: "Paid",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: <CreditCard className="w-3 h-3" />,
  },
};

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    fetchClaims();
  }, []);

  async function fetchClaims() {
    setLoading(true);
    try {
      const res = await api.get("/claims");
      setClaims(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        `${claim.patient.firstName} ${claim.patient.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (claim.claimNumber || claim.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (claim.insurance?.provider?.organization?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || claim.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [claims, searchQuery, statusFilter]);

  const sortedClaims = useMemo(() => {
    return [...filteredClaims].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "claim":
          comparison = (a.claimNumber || a.id).localeCompare(b.claimNumber || b.id);
          break;
        case "patient":
          comparison = `${a.patient.firstName} ${a.patient.lastName}`.localeCompare(
            `${b.patient.firstName} ${b.patient.lastName}`
          );
          break;
        case "insurer":
          comparison = (a.insurance?.provider?.organization?.name || "").localeCompare(
            b.insurance?.provider?.organization?.name || ""
          );
          break;
        case "total":
          comparison = a.totalAmount - b.totalAmount;
          break;
        case "approved":
          comparison = (a.approvedAmount || a.totalAmount) - (b.approvedAmount || b.totalAmount);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredClaims, sortField, sortOrder]);

  const stats = useMemo(() => {
    const totalValue = claims.reduce((sum, c) => sum + c.totalAmount, 0);
    const approvedValue = claims.reduce(
      (sum, c) => sum + (c.approvedAmount || c.totalAmount),
      0
    );
    return {
      total: claims.length,
      pending: claims.filter((c) => c.status === "PENDING" || c.status === "SUBMITTED").length,
      approved: claims.filter((c) => c.status === "APPROVED").length,
      partial: claims.filter((c) => c.status === "PARTIALLY_APPROVED").length,
      rejected: claims.filter((c) => c.status === "REJECTED").length,
      paid: claims.filter((c) => c.status === "PAID").length,
      totalValue,
      approvedValue,
    };
  }, [claims]);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-50 transition-opacity" />
      );
    return sortOrder === "asc" ? (
      <TrendingUp className="w-3.5 h-3.5 text-slate-900" />
    ) : (
      <TrendingUp className="w-3.5 h-3.5 text-slate-900 rotate-180" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Insurance Claims
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage and track patient insurance claims
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Total Claim Value
            </p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total"
            value={stats.total}
            icon={<Receipt className="w-4 h-4 text-gray-600" />}
            color="bg-gray-100"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<Clock className="w-4 h-4 text-amber-600" />}
            color="bg-amber-50"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            color="bg-emerald-50"
          />
          <StatCard
            title="Partial"
            value={stats.partial}
            icon={<AlertCircle className="w-4 h-4 text-orange-600" />}
            color="bg-orange-50"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={<Ban className="w-4 h-4 text-rose-600" />}
            color="bg-rose-50"
          />
          <StatCard
            title="Paid"
            value={stats.paid}
            icon={<CreditCard className="w-4 h-4 text-purple-600" />}
            color="bg-purple-50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by claim number, patient, or insurer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === status
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {status === "ALL" ? "All" : statusConfig[status]?.label || status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th
                    className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => toggleSort("claim")}
                  >
                    <div className="flex items-center gap-2">
                      Claim #
                      <SortIcon field="claim" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => toggleSort("patient")}
                  >
                    <div className="flex items-center gap-2">
                      Patient
                      <SortIcon field="patient" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => toggleSort("insurer")}
                  >
                    <div className="flex items-center gap-2">
                      Insurer
                      <SortIcon field="insurer" />
                    </div>
                  </th>
                  <th
                    className="text-right py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => toggleSort("total")}
                  >
                    <div className="flex items-center gap-2 justify-end">
                      Total
                      <SortIcon field="total" />
                    </div>
                  </th>
                  <th
                    className="text-right py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => toggleSort("approved")}
                  >
                    <div className="flex items-center gap-2 justify-end">
                      Approved
                      <SortIcon field="approved" />
                    </div>
                  </th>
                  <th
                    className="text-center py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </th>
                  <th className="text-right py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="w-24 h-3.5 bg-gray-200 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-200" />
                          <div className="w-28 h-3.5 bg-gray-200 rounded" />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-32 h-3 bg-gray-200 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-20 h-4 bg-gray-200 rounded ml-auto" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-20 h-4 bg-gray-200 rounded ml-auto" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-20 h-6 bg-gray-200 rounded-full mx-auto" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-20 h-3 bg-gray-200 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-12 h-8 bg-gray-200 rounded-lg ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : sortedClaims.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <ShieldCheck className="w-12 h-12 stroke-1" />
                        <p className="text-sm font-medium">No claims found</p>
                        {(searchQuery || statusFilter !== "ALL") && (
                          <p className="text-xs">Try adjusting your search or filters</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedClaims.map((claim) => {
                    const config = statusConfig[claim.status] || {
                      label: claim.status,
                      color: "text-gray-700",
                      bg: "bg-gray-100",
                      border: "border-gray-200",
                      icon: <AlertCircle className="w-3 h-3" />,
                    };
                    return (
                      <tr
                        key={claim.id}
                        className="group hover:bg-gray-50/80 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-sm font-semibold text-gray-900 font-mono">
                              {claim.claimNumber || claim.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                              {claim.patient.firstName[0]}
                              {claim.patient.lastName[0]}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {claim.patient.firstName} {claim.patient.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-700">
                              {claim.insurance?.provider?.organization?.name || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(claim.totalAmount)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-semibold text-gray-700">
                            {formatCurrency(claim.approvedAmount || claim.totalAmount)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}
                          >
                            {config.icon}
                            {config.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(claim.createdAt)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/dashboard/claims/${claim.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && sortedClaims.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {sortedClaims.length} of {claims.length} claims
              </span>
              <span className="font-medium text-gray-900">
                Total Value: {formatCurrency(sortedClaims.reduce((sum, c) => sum + c.totalAmount, 0))}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Receipt,
  Search,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  FileText,
  Loader2,
  TrendingUp,
  DollarSign,
  X,
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  Filter,
} from "lucide-react";

interface Charge {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: "PENDING" | "POSTED" | "PAID" | "CANCELLED" | string;
  createdAt?: string;
  date?: string;

  patient: {
    firstName: string;
    lastName: string;
  };

  invoice: {
    id: string;
  } | null;

  service: {
    name: string;
  } | null;
}

type SortField = "patient" | "description" | "amount" | "status" | "date";
type SortOrder = "asc" | "desc";
type DateFilter = "ALL" | "TODAY" | "YESTERDAY" | "WEEK" | "MONTH";

const dateFilters: { key: DateFilter; label: string; icon: React.ReactNode }[] = [
  { key: "ALL", label: "All Time", icon: <CalendarRange className="w-3.5 h-3.5" /> },
  { key: "TODAY", label: "Today", icon: <CalendarCheck className="w-3.5 h-3.5" /> },
  { key: "YESTERDAY", label: "Yesterday", icon: <Calendar className="w-3.5 h-3.5" /> },
  { key: "WEEK", label: "This Week", icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { key: "MONTH", label: "This Month", icon: <CalendarRange className="w-3.5 h-3.5" /> },
];

function isDateInRange(dateStr: string | undefined, filter: DateFilter): boolean {
  if (!dateStr || filter === "ALL") return true;
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const chargeDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  switch (filter) {
    case "TODAY":
      return chargeDay.getTime() === today.getTime();
    case "YESTERDAY": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return chargeDay.getTime() === yesterday.getTime();
    }
    case "WEEK": {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return chargeDay >= weekStart;
    }
    case "MONTH": {
      return chargeDay.getMonth() === today.getMonth() && chargeDay.getFullYear() === today.getFullYear();
    }
    default:
      return true;
  }
}

export default function ChargesPage() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [postingId, setPostingId] = useState<string | null>(null);

  async function loadCharges() {
    setLoading(true);
    try {
      const res = await api.get("/charges");
      setCharges(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCharges();
  }, []);

  async function postCharge(id: string) {
    setPostingId(id);
    try {
      await api.post("/billing/post-charge", { chargeId: id });
      loadCharges();
    } catch (err) {
      console.error(err);
    } finally {
      setPostingId(null);
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

  const filteredCharges = useMemo(() => {
    return charges.filter((charge) => {
      const matchesSearch =
        `${charge.patient.firstName} ${charge.patient.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        charge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        charge.service?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || charge.status === statusFilter;
      const matchesDate = isDateInRange(charge.createdAt || charge.date, dateFilter);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [charges, searchQuery, statusFilter, dateFilter]);

  const sortedCharges = useMemo(() => {
    return [...filteredCharges].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "patient":
          comparison = `${a.patient.firstName} ${a.patient.lastName}`.localeCompare(
            `${b.patient.firstName} ${b.patient.lastName}`
          );
          break;
        case "description":
          comparison = a.description.localeCompare(b.description);
          break;
        case "amount":
          comparison = a.totalPrice - b.totalPrice;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "date": {
          const dateA = a.createdAt || a.date ? new Date(a.createdAt || a.date!).getTime() : 0;
          const dateB = b.createdAt || b.date ? new Date(b.createdAt || b.date!).getTime() : 0;
          comparison = dateA - dateB;
          break;
        }
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredCharges, sortField, sortOrder]);

  const stats = useMemo(() => {
    const pending = charges.filter((c) => c.status === "PENDING");
    const posted = charges.filter((c) => c.status === "POSTED");
    const paid = charges.filter((c) => c.status === "PAID");
    return {
      pendingTotal: pending.reduce((sum, c) => sum + c.totalPrice, 0),
      pendingCount: pending.length,
      postedTotal: posted.reduce((sum, c) => sum + c.totalPrice, 0),
      postedCount: posted.length,
      paidTotal: paid.reduce((sum, c) => sum + c.totalPrice, 0),
      paidCount: paid.length,
    };
  }, [charges]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pending",
          icon: <Clock className="w-3.5 h-3.5" />,
          color: "text-amber-700",
          bg: "bg-amber-50",
          border: "border-amber-200",
        };
      case "POSTED":
        return {
          label: "Posted",
          icon: <FileText className="w-3.5 h-3.5" />,
          color: "text-blue-700",
          bg: "bg-blue-50",
          border: "border-blue-200",
        };
      case "PAID":
        return {
          label: "Paid",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          color: "text-emerald-700",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          icon: <X className="w-3.5 h-3.5" />,
          color: "text-gray-600",
          bg: "bg-gray-100",
          border: "border-gray-200",
        };
      default:
        return {
          label: status,
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          color: "text-gray-600",
          bg: "bg-gray-100",
          border: "border-gray-200",
        };
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
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
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-slate-900 transition-colors w-fit group"
          >
            <div className="p-1 rounded-md group-hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Billing</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Billing Charges
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Manage and post patient billing charges
              </p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Total Revenue
              </p>
              <p className="text-xl font-bold text-slate-900">
                ₦{(stats.postedTotal + stats.paidTotal).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Charges</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₦{stats.pendingTotal.toLocaleString()}
                </p>
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  {stats.pendingCount} charge{stats.pendingCount !== 1 ? "s" : ""} awaiting
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Posted Charges</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₦{stats.postedTotal.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  {stats.postedCount} charge{stats.postedCount !== 1 ? "s" : ""} invoiced
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₦{stats.paidTotal.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  {stats.paidCount} charge{stats.paidCount !== 1 ? "s" : ""} settled
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search + Status */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient, description, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {(["ALL", "PENDING", "POSTED", "PAID"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === status
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
              <Filter className="w-3.5 h-3.5" />
              Date
            </div>
            {dateFilters.map((df) => (
              <button
                key={df.key}
                onClick={() => setDateFilter(df.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  dateFilter === df.key
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {df.icon}
                {df.label}
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
                    onClick={() => toggleSort("patient")}
                  >
                    <div className="flex items-center gap-2">
                      Patient
                      <SortIcon field="patient" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => toggleSort("description")}
                  >
                    <div className="flex items-center gap-2">
                      Description
                      <SortIcon field="description" />
                    </div>
                  </th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th
                    className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => toggleSort("amount")}
                  >
                    <div className="flex items-center gap-2">
                      Amount
                      <SortIcon field="amount" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-2">
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
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-200" />
                          <div className="space-y-2">
                            <div className="w-28 h-3.5 bg-gray-200 rounded" />
                            <div className="w-16 h-2.5 bg-gray-100 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-40 h-3 bg-gray-200 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-24 h-3 bg-gray-200 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-20 h-4 bg-gray-200 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-16 h-6 bg-gray-200 rounded-full" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-20 h-3 bg-gray-200 rounded" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-16 h-8 bg-gray-200 rounded-lg ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : sortedCharges.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Receipt className="w-12 h-12 stroke-1" />
                        <p className="text-sm font-medium">No charges found</p>
                        {(searchQuery || statusFilter !== "ALL" || dateFilter !== "ALL") && (
                          <p className="text-xs">Try adjusting your search or filters</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedCharges.map((charge) => {
                    const status = getStatusConfig(charge.status);
                    return (
                      <tr
                        key={charge.id}
                        className="group hover:bg-gray-50/80 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                              {getInitials(charge.patient.firstName, charge.patient.lastName)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {charge.patient.firstName} {charge.patient.lastName}
                              </p>
                              {charge.invoice && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Inv: {charge.invoice.id.slice(0, 8)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900 font-medium">
                            {charge.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Qty: {charge.quantity} × ₦{charge.unitPrice.toLocaleString()}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          {charge.service ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                              <CreditCard className="w-3 h-3" />
                              {charge.service.name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-bold text-gray-900">
                            ₦{charge.totalPrice.toLocaleString()}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs text-gray-500">
                            {formatDate(charge.createdAt || charge.date)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {charge.status === "PENDING" ? (
                            <button
                              onClick={() => postCharge(charge.id)}
                              disabled={postingId === charge.id}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                              {postingId === charge.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              Post
                            </button>
                          ) : charge.status === "POSTED" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                              <FileText className="w-3.5 h-3.5" />
                              Invoiced
                            </span>
                          ) : charge.status === "PAID" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Settled
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && sortedCharges.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {sortedCharges.length} of {charges.length} charges
              </span>
              <span className="font-medium text-gray-900">
                Total: ₦{sortedCharges.reduce((sum, c) => sum + c.totalPrice, 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
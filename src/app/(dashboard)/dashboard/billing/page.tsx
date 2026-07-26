"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Receipt,
  AlertCircle,
  Wallet,
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Loader2
} from "lucide-react";

interface BillingSummary {
  totalInvoices: number;
  totalBilled: number;
  totalPaid: number;
  outstandingAmount: number;
  outstandingInvoices: number;
  paymentsToday: number;
  amountCollectedToday: number;
}

export default function BillingDashboard() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/invoices/summary")
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!summary) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-medium">Failed to load billing data</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-slate-900 font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const collectionRate = summary.totalBilled === 0 ? 0 : Math.round((summary.totalPaid / summary.totalBilled) * 100);

  const primaryMetrics = [
    {
      title: "Total Billed",
      value: `₦${summary.totalBilled.toLocaleString()}`,
      subtitle: "Lifetime revenue",
      icon: <Receipt className="w-5 h-5" />,
      color: "bg-slate-900 text-white",
      trend: null,
    },
    {
      title: "Outstanding",
      value: `₦${summary.outstandingAmount.toLocaleString()}`,
      subtitle: `${summary.outstandingInvoices} unpaid invoices`,
      icon: <AlertCircle className="w-5 h-5" />,
      color: "bg-amber-500 text-white",
      trend: summary.outstandingAmount > 0 ? "negative" : null,
    },
    {
      title: "Collected Today",
      value: `₦${summary.amountCollectedToday.toLocaleString()}`,
      subtitle: `${summary.paymentsToday} payments received`,
      icon: <Wallet className="w-5 h-5" />,
      color: "bg-emerald-500 text-white",
      trend: summary.amountCollectedToday > 0 ? "positive" : null,
    },
  ];

  const secondaryMetrics = [
    {
      title: "Total Invoices",
      value: summary.totalInvoices.toLocaleString(),
      label: "All time",
      icon: <FileText className="w-4 h-4" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Outstanding",
      value: summary.outstandingInvoices.toLocaleString(),
      label: "Awaiting payment",
      icon: <Clock className="w-4 h-4" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Payments Today",
      value: summary.paymentsToday.toLocaleString(),
      label: "Transactions",
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Collection Rate",
      value: `${collectionRate}%`,
      label: "Of total billed",
      icon: <Activity className="w-4 h-4" />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Billing Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Financial overview and collection metrics
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="font-medium">NGN</span>
            <span className="text-gray-300">|</span>
            <span>Today</span>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {primaryMetrics.map((metric) => (
            <div
              key={metric.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">
                      {metric.value}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {metric.trend === "positive" && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <ArrowUpRight className="w-3 h-3" />
                        Active
                      </span>
                    )}
                    {metric.trend === "negative" && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <ArrowDownRight className="w-3 h-3" />
                        Attention
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{metric.subtitle}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${metric.color}`}>
                  {metric.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Collection Progress */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Collection Progress</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                ₦{(summary.totalBilled - summary.outstandingAmount).toLocaleString()} collected of {" "}
                ₦{summary.totalBilled.toLocaleString()} total billed
              </p>
            </div>
            <span className="text-2xl font-bold text-gray-900">{collectionRate}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Invoice Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {secondaryMetrics.map((metric) => (
              <div
                key={metric.title}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${metric.bg} ${metric.color}`}>
                    {metric.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-500">{metric.title}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-xs text-gray-400 mt-1">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <p className="text-slate-300 text-sm mt-1">
                Manage invoices, record payments, or review outstanding charges
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/dashboard/billing/invoice"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors backdrop-blur-sm text-center"
              >
                View Invoices
              </Link>
              <Link
                href="/dashboard/billing/charges"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors backdrop-blur-sm text-center"
              >
                View Charges
              </Link>
              <Link 
                href="/dashboard/billing/wallet"
                className="px-5 py-2.5 bg-white text-slate-900 hover:bg-gray-100 text-sm rounded-xl transition-colors font-semibold">
               
                Service Wallet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-64 h-4 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-4 w-full">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="w-full h-3 bg-gray-100 rounded-full animate-pulse" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import InvoiceTable, { Invoice } from "@/components/billing/InvoiceTable";
import {
  Search,
  Filter,
  Calendar,
  X,
  Receipt,
  Loader2,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses", color: "text-gray-600" },
  { value: "PENDING", label: "Pending", color: "text-amber-600" },
  { value: "PARTIALLY_PAID", label: "Partially Paid", color: "text-sky-600" },
  { value: "PAID", label: "Paid", color: "text-emerald-600" },
  { value: "CANCELLED", label: "Cancelled", color: "text-rose-600" },
];

export default function InvoicePage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [patientId, setPatientId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  async function loadInvoices() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (patientId) params.append("patientId", patientId);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    try {
      const res = await api.get(`/invoices?${params.toString()}`);
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  const hasActiveFilters = status || patientId || from || to;

  const clearFilters = () => {
    setStatus("");
    setPatientId("");
    setFrom("");
    setTo("");
  };

  const activeFilterCount = [status, patientId, from, to].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Invoices
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} found
              {hasActiveFilters && " matching your filters"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div
          className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${
            showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-transparent"
          }`}
        >
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              <Filter className="w-4 h-4" />
              Filter Invoices
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Patient ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Patient ID</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-gray-400"
                    placeholder="Enter patient ID..."
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Status</label>
                <div className="relative">
                  <select
                    className="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all bg-white appearance-none cursor-pointer"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date From */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-gray-600"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
              </div>

              {/* Date To */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-gray-600"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-gray-500 font-medium">Active:</span>
                {patientId && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    Patient: {patientId}
                    <button onClick={() => setPatientId("")} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {status && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    Status: {STATUS_OPTIONS.find(s => s.value === status)?.label}
                    <button onClick={() => setStatus("")} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {from && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    From: {from}
                    <button onClick={() => setFrom("")} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {to && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    To: {to}
                    <button onClick={() => setTo("")} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={loadInvoices}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Bar (collapsed view) */}
        {!showFilters && hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Active filters:</span>
            {patientId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-slate-700 rounded-lg text-xs font-medium shadow-sm">
                Patient: {patientId}
                <button onClick={() => setPatientId("")} className="hover:text-slate-900 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-slate-700 rounded-lg text-xs font-medium shadow-sm">
                Status: {STATUS_OPTIONS.find(s => s.value === status)?.label}
                <button onClick={() => setStatus("")} className="hover:text-slate-900 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {from && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-slate-700 rounded-lg text-xs font-medium shadow-sm">
                From: {from}
                <button onClick={() => setFrom("")} className="hover:text-slate-900 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {to && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-slate-700 rounded-lg text-xs font-medium shadow-sm">
                To: {to}
                <button onClick={() => setTo("")} className="hover:text-slate-900 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results */}
        {loading && invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">Loading invoices...</p>
            </div>
          </div>
        ) : (
          <InvoiceTable
            invoices={invoices}
            showSearch={false}
            showSummary={true}
          />
        )}
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpDown,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Receipt,
  Search,
  User,
  Wallet,
  X
} from "lucide-react";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  paidAmount: number;
  balance: number;
  status: string;
  createdAt: string;
  patient: {
    patientNumber: string;
    firstName: string;
    lastName: string;
  };
  visit: {
    visitNumber: string;
  } | null;
}

interface Props {
  invoices: Invoice[];
  showSearch?: boolean;
  showSummary?: boolean;
}

type SortField = "invoice" | "patient" | "total" | "paid" | "balance" | "date" | "status";
type SortOrder = "asc" | "desc";

export default function InvoiceTable({
  invoices,
  showSearch = true,
  showSummary = true,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const query = searchQuery.toLowerCase();
    return (
      (invoice.invoiceNumber ?? "").toLowerCase().includes(query) ||
      `${invoice.patient.firstName} ${invoice.patient.lastName}`.toLowerCase().includes(query) ||
      invoice.patient.patientNumber.toLowerCase().includes(query) ||
      invoice.visit?.visitNumber?.toLowerCase().includes(query)
    );
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "invoice":
        comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
        break;
      case "patient":
        comparison = `${a.patient.firstName} ${a.patient.lastName}`.localeCompare(
          `${b.patient.firstName} ${b.patient.lastName}`
        );
        break;
      case "total":
        comparison = a.subtotal - b.subtotal;
        break;
      case "paid":
        comparison = a.paidAmount - b.paidAmount;
        break;
      case "balance":
        comparison = a.balance - b.balance;
        break;
      case "date":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const SortHeader = ({
    field,
    children,
    align = "left",
  }: {
    field: SortField;
    children: React.ReactNode;
    align?: "left" | "right" | "center";
  }) => {
    const isActive = sortField === field;
    const alignClass = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";

    return (
      <th
        className="py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group select-none"
        onClick={() => toggleSort(field)}
      >
        <div className={`flex items-center gap-1.5 ${alignClass}`}>
          {children}
          <span className="opacity-0 group-hover:opacity-50 transition-opacity">
            {isActive ? (
              sortOrder === "asc" ? (
                <ArrowUpRight className="w-3.5 h-3.5 -rotate-45deg text-slate-900" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 rotate-135deg text-slate-900" />
              )
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      {showSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Billed</p>
                <p className="text-xl font-bold text-gray-900 mt-1">₦{totalBilled.toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <Receipt className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">₦{totalPaid.toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</p>
                <p className="text-xl font-bold text-amber-700 mt-1">₦{totalOutstanding.toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice #, patient name, or visit number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <SortHeader field="invoice">Invoice</SortHeader>
                <SortHeader field="patient">Patient</SortHeader>
                <SortHeader field="date">Date</SortHeader>
                <SortHeader field="total" align="right">Total</SortHeader>
                <SortHeader field="paid" align="right">Paid</SortHeader>
                <SortHeader field="balance" align="right">Balance</SortHeader>
                <SortHeader field="status" align="center">Status</SortHeader>
                <th className="py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FileText className="w-12 h-12 stroke-1" />
                      <p className="text-sm font-medium">
                        {searchQuery ? "No invoices match your search" : "No invoices found"}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-xs text-slate-900 font-medium hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedInvoices.map((invoice) => {
                  const paymentProgress = invoice.subtotal > 0
                    ? Math.round((invoice.paidAmount / invoice.subtotal) * 100)
                    : 0;

                  return (
                    <tr
                      key={invoice.id}
                      className="group hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Receipt className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {invoice.invoiceNumber}
                            </p>
                            {invoice.visit && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Visit: {invoice.visit.visitNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                            {getInitials(invoice.patient.firstName, invoice.patient.lastName)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {invoice.patient.firstName} {invoice.patient.lastName}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {invoice.patient.patientNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(invoice.createdAt)}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ₦{invoice.subtotal.toLocaleString()}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <p className="text-sm font-medium text-emerald-700">
                          ₦{invoice.paidAmount.toLocaleString()}
                        </p>
                        {paymentProgress > 0 && paymentProgress < 100 && (
                          <div className="w-16 h-1 bg-gray-100 rounded-full mt-1.5 ml-auto overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${paymentProgress}%` }}
                            />
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <p className={`text-sm font-semibold ${invoice.balance > 0 ? "text-amber-700" : "text-gray-400"}`}>
                          ₦{invoice.balance.toLocaleString()}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <InvoiceStatusBadge status={invoice.status} size="sm" />
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/dashboard/billing/invoice/${invoice.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        >
                          View
                          <ChevronRight className="w-3 h-3" />
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
        {sortedInvoices.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {sortedInvoices.length} of {invoices.length} invoices
            </span>
            <span>
              Total outstanding: ₦{sortedInvoices.reduce((sum, inv) => sum + inv.balance, 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Receipt,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  CreditCard,
  FileText,
  Hash,
  Plus,
  Wallet,
} from "lucide-react";
import CreateClaimModal from "@/components/claims/CreateClaimModal";
import RecordPaymentModal from "@/components/billing/RecordPaymentModal";
import { useHospitalInfo } from "@/hooks/useHospitalInfo";

interface InvoiceCharge {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface InvoicePayment {
  id: string;
  amount: number;
  method: string;
  createdAt: string;
}

interface InvoiceClaim {
  id: string;
  claimNumber?: string;
  status: string;
  totalAmount: number;
}

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "CANCELLED" | string;
  createdAt: string;
  dueDate?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  balance: number;
  notes?: string;

  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
  };

  charges: InvoiceCharge[];
  payments: InvoicePayment[];
  claims: InvoiceClaim[];

  createdBy?: {
    firstName: string;
    lastName: string;
  } | null;

  insurance?: {
    provider?: {
      name?: string;
    };
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Clock className="w-4 h-4" />,
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    icon: <CreditCard className="w-4 h-4" />,
  },
  PAID: {
    label: "Paid",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: <XCircle className="w-4 h-4" />,
  },
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showCreateClaim, setShowCreateClaim] = useState(false);
  const { hospital } = useHospitalInfo();

  useEffect(() => {
    loadInvoice();
  }, [params.id]);

  async function loadInvoice() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/invoices/${params.id}`);
      setInvoice(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount?: number | null) => {
    const value = Number(amount ?? 0);
    const safeValue = Number.isNaN(value) ? 0 : value;
    return `₦${safeValue.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const status = invoice ? statusConfig[invoice.status] || statusConfig.PENDING : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dashboard/billing/invoice"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-slate-900 transition-colors w-fit group mb-6"
          >
            <div className="p-1 rounded-md group-hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Invoices</span>
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Invoice Not Found</h2>
            <p className="text-sm text-gray-500">{error || "The requested invoice could not be loaded."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 print:bg-white print:p-0">
      <style jsx global>{`
        @media print {
          @page {
            margin: 1.5cm;
            size: A4;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-shadow {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <Link
            href="/dashboard/billing/invoice"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-slate-900 transition-colors w-fit group"
          >
            <div className="p-1 rounded-md group-hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Invoices</span>
          </Link>
        </div>
        <div className="print-only mb-6 pb-4 border-b-2 border-slate-900">
  <h1 className="text-xl font-bold">{hospital?.name ?? "Zensa Health"}</h1>
  {hospital?.address && <p className="text-xs text-slate-500">{hospital.address}</p>}
  {hospital?.phone && <p className="text-xs text-slate-500">{hospital.phone}</p>}
  <p className="text-sm font-semibold mt-2">INVOICE — {invoice.invoiceNumber}</p>
  <p className="text-xs text-slate-500 mt-1">
    {invoice.patient.firstName} {invoice.patient.lastName} · {invoice.patient.id}
  </p>
  <p className="text-xs text-slate-500">Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
</div>

        {/* Invoice Document */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print-shadow print:rounded-none print:border-0">
          {/* Header */}
          <div className="p-8 md:p-10 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Invoice Meta */}
              <div className="text-left space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-700 border-gray-200">
                  <Hash className="w-3 h-3" />
                  {invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}
                </div>
                <div className="pt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Issue Date:</span> {formatDate(invoice.createdAt)}
                  </p>
                  {invoice.dueDate && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">Due Date:</span> {formatDate(invoice.dueDate)}
                    </p>
                  )}
                  {status && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-2 ${status.bg} ${status.color} ${status.border}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Patient & Bill To */}
          <div className="p-8 md:p-10 border-b border-gray-100 bg-gray-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Bill To</p>
                <div className="space-y-2">
                  <p className="text-base font-bold text-gray-900">
                    {invoice.patient.firstName} {invoice.patient.lastName}
                  </p>
                  {invoice.patient.address && (
                    <p className="text-sm text-gray-500 flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {invoice.patient.address}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {invoice.patient.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Phone className="w-3 h-3" />
                        {invoice.patient.phone}
                      </p>
                    )}
                    {invoice.patient.email && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        {invoice.patient.email}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
                    <User className="w-3 h-3" />
                    Patient ID: {invoice.patient.id}
                  </p>
                </div>
              </div>

              <div className="md:text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Summary</p>
                <div className="space-y-2 md:ml-auto md:w-fit">
                  <div className="flex justify-between md:justify-end gap-8 text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.tax > 0 && (
                    <div className="flex justify-between md:justify-end gap-8 text-sm">
                      <span className="text-gray-500">Tax</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(invoice.tax)}</span>
                    </div>
                  )}
                  {invoice.discount > 0 && (
                    <div className="flex justify-between md:justify-end gap-8 text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-semibold text-emerald-600">-{formatCurrency(invoice.discount)}</span>
                    </div>
                  )}
                  {invoice.paidAmount > 0 && (
                    <div className="flex justify-between md:justify-end gap-8 text-sm pt-1">
                      <span className="text-gray-500">Amount Paid</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(invoice.paidAmount)}</span>
                    </div>
                  )}
                  {invoice.balance > 0 && (
                    <div className="flex justify-between md:justify-end gap-8 text-sm">
                      <span className="text-gray-500">Balance Due</span>
                      <span className="font-semibold text-amber-600">{formatCurrency(invoice.balance)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-8 md:p-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Invoice Items</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-full">
                      Description
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Qty
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Unit Price
                    </th>
                    <th className="text-right py-3 pl-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoice.charges?.map((charge) => (
                    <tr key={charge.id} className="group">
                      <td className="py-4 text-sm text-gray-900 font-medium">
                        {charge.description}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 text-right">
                        {charge.quantity}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 text-right">
                        {formatCurrency(charge.unitPrice)}
                      </td>
                      <td className="py-4 pl-4 text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(charge.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Totals */}
          <div className="p-8 md:p-10 border-t border-gray-100 bg-gray-50/30">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              <div className="max-w-sm">
                {invoice.notes && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{invoice.notes}</p>
                  </div>
                )}
                <div className="mt-6 p-4 rounded-xl bg-slate-900/5 border border-slate-900/10">
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    Payment can be made via bank transfer, POS, or cash at our accounting department. 
                    Please reference your invoice number when making payment.
                  </p>
                </div>
              </div>

              <div className="md:text-right space-y-2 min-w-60">
                <div className="flex justify-between md:justify-end gap-8 text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between md:justify-end gap-8 text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.tax)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between md:justify-end gap-8 text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-semibold text-emerald-600">-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                {invoice.paidAmount > 0 && (
                  <>
                    <div className="flex justify-between md:justify-end gap-8 text-sm pt-2">
                      <span className="text-gray-500">Amount Paid</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(invoice.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between md:justify-end gap-8 text-sm">
                      <span className="text-gray-500">Balance</span>
                      <span className="font-bold text-amber-600">{formatCurrency(invoice.balance)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stamp Area (Print Only) */}
          <div className="print-only p-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Authorized Signature</p>
                <div className="mt-8 w-48 border-b border-gray-400" />
                <p className="text-xs text-gray-500 mt-1">Account Officer</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Official Stamp</p>
                <div className="mt-4 w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-[10px] text-gray-300 font-bold uppercase">Stamp</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 no-print">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
               
                <RecordPaymentModal
                  invoice={invoice}
                  onSuccess={() => loadInvoice()}
                />
                <button
                  onClick={() => setShowCreateClaim(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Claim
                </button>
                <button
  onClick={() => window.print()}
  className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors no-print"
>
  <Printer size={16} />
  Print Invoice
</button>
              </div>
            </div>
          </div>

          {/* Digital Footer */}
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Generated on {new Date().toLocaleDateString("en-NG")}
              </span>
              <span>Invoice ID: {invoice.id}</span>
            </div>
          </div>
        </div>

        {/* Print Footer Info */}
        <div className="print-only text-center pt-4">
          <p className="text-[10px] text-gray-400">
            This is a computer-generated invoice and does not require a physical signature.
            For inquiries, contact the accounting department.
          </p>
        </div>
      </div>

      {/* Modals */}
      <CreateClaimModal
        open={showCreateClaim}
        invoiceId={invoice.id}
        invoiceSubtotal={invoice.subtotal}
        patientId={invoice.patient.id}
        onClose={() => setShowCreateClaim(false)}
        onCreated={() => {
          loadInvoice();
          setShowCreateClaim(false);
        }}
      />
    </div>
  );
}
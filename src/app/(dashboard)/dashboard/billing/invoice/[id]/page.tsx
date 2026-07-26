"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

import RecordPaymentModal from "@/components/billing/RecordPaymentModal";
import { useRouter } from "next/navigation";
import CreateClaimModal from "@/components/claims/CreateClaimModal";
import InvoiceStatusBadge from "@/components/billing/InvoiceStatusBadge";
import {
  Receipt,
  User,
  CreditCard,
  FileText,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Calendar,
} from "lucide-react";

export default function InvoiceDetailsPage() {

  const { id } = useParams();

  const [invoice, setInvoice] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const router = useRouter();
  const [showCreateClaim, setShowCreateClaim] = useState(false);

  async function loadInvoice() {

    try {

      const res =
        await api.get(`/invoices/${id}`);

      setInvoice(res.data);

    } catch {

      setLoadError(true);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadInvoice();

  }, []);

  if (loading) {

    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading invoice...</p>
        </div>
      </div>
    );

  }

  if (loadError || !invoice) {

    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-lg font-medium text-slate-600">Invoice not found</p>
        <Link href="/dashboard/billing/invoice" className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium inline-block">
          Back to invoices
        </Link>
      </div>
    );

  }

  return (

    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/billing/invoice"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt size={22} className="text-blue-600" />
              {invoice.invoiceNumber ?? invoice.id}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
              <Calendar size={12} />
              {new Date(invoice.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              <InvoiceStatusBadge status={invoice.status} size="sm" />
            </p>
          </div>

          <div className="flex items-center gap-3">
  {invoice.status !== "PAID" ? (
    <RecordPaymentModal invoice={invoice} onSuccess={loadInvoice} />
  ) : (
    <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-medium">
      Fully Paid
    </span>
  )}
  <button
    onClick={() => setShowCreateClaim(true)}
    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
  >
    <FileText size={16} />
    Create Claim
  </button>
</div>
        </div>
      </div>

      <CreateClaimModal
  open={showCreateClaim}
  invoiceId={invoice.id}
  patientId={invoice.patient.id}
  onClose={() => setShowCreateClaim(false)}
  onCreated={(claimId) => router.push(`/dashboard/claims/${claimId}`)}
/>


      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <SummaryCard
          icon={<Receipt size={18} />}
          title="Subtotal"
          value={`₦${invoice.subtotal.toLocaleString()}`}
        />

        <SummaryCard
          icon={<CreditCard size={18} />}
          title="Paid"
          value={`₦${invoice.paidAmount.toLocaleString()}`}
          accent="emerald"
        />

        <SummaryCard
          icon={<FileText size={18} />}
          title="Balance"
          value={`₦${invoice.balance.toLocaleString()}`}
          accent={invoice.balance > 0 ? "amber" : undefined}
        />

      </div>

      {/* Patient */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

        <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">

          <User size={18} className="text-blue-600" />

          Patient

        </h2>

        <div className="grid grid-cols-2 gap-5">

          <Info label="Name">

            {invoice.patient.firstName} {invoice.patient.lastName}

          </Info>

          <Info label="Patient Number">

            {invoice.patient.patientNumber}

          </Info>

        </div>

      </div>

      {/* Charges */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Charges</h2>
        </div>

        {invoice.charges.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400">No charges on this invoice yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3">Unit Price</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.charges.map((charge: any) => (
                  <tr key={charge.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-slate-700">{charge.description}</td>
                    <td className="px-6 py-3 text-slate-600">{charge.quantity}</td>
                    <td className="px-6 py-3 text-slate-600">₦{charge.unitPrice.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">₦{charge.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Payments */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Payments</h2>
        </div>

        {invoice.payments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-slate-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-slate-600">{payment.method}</td>
                    <td className="px-6 py-3 font-medium text-emerald-700">₦{payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-slate-500">{payment.reference || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>

  );
  
}

function SummaryCard({
  icon,
  title,
  value,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  accent?: "emerald" | "amber";
}) {
  const accentClass =
    accent === "emerald" ? "text-emerald-700" :
    accent === "amber" ? "text-amber-700" :
    "text-slate-900";

  return(
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        {icon}
        {title}
      </div>
      <div className={`text-2xl font-bold mt-2 ${accentClass}`}>
        {value}
      </div>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return(
    <div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="font-medium text-slate-900">{children}</div>
    </div>
  );
}

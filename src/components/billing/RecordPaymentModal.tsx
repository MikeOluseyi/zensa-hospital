"use client";

import { useState } from "react";
import api from "@/lib/api";
import { X, Wallet, Loader2, Banknote, CheckCircle2 } from "lucide-react";

type Props = {
  invoice: any;
  onSuccess: () => void;
};

const METHOD_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "INSURANCE", label: "Insurance" },
];

export default function RecordPaymentModal({ invoice, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    amount: "",
    method: "CASH",
    reference: "",
    notes: "",
  });

  function resetAndClose() {
    setForm({ amount: "", method: "CASH", reference: "", notes: "" });
    setError("");
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const amount = Number(form.amount);

    if (!amount || amount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (amount > invoice.balance) {
      setError("Amount exceeds the outstanding balance.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/billing/payment", {
        invoiceId: invoice.id,
        amount,
        method: form.method,
        reference: form.reference,
        notes: form.notes,
      });

      resetAndClose();
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to record payment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
      >
        <Wallet size={16} />
        Record Payment
      </button>
    );
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && resetAndClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Wallet size={18} className="text-emerald-600" />
            Record Payment
          </h2>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Balance summary */}
        <div className="px-6 pt-5">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">Outstanding Balance</span>
            <span className="text-lg font-bold text-amber-900">₦{invoice.balance.toLocaleString()}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className={labelClass}>
              <Banknote size={12} className="inline mr-1" />
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₦</span>
              <input
                type="number"
                min="0"
                step="0.01"
                max={invoice.balance}
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={`${inputClass} pl-8`}
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Payment Method</label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className={inputClass}
            >
              {METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Reference</label>
            <input
              placeholder="Transaction reference (optional)"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              placeholder="Optional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputClass} resize-none`}
              rows={2}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  Record Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
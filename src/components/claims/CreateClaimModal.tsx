"use client";

import { useEffect, useState } from "react";
import { X, FileText, Loader2, AlertCircle } from "lucide-react";
import { InsuranceAPI, PatientInsurance, ClaimAPI } from "@/services/insurance";

interface Props {
  open: boolean;
  invoiceId: string;
  invoiceSubtotal: number;
  patientId: string;
  onClose: () => void;
  onCreated: (claimId: string) => void;
}

export default function CreateClaimModal({ open, invoiceId, invoiceSubtotal, patientId, onClose, onCreated }: Props) {
  const [insurances, setInsurances] = useState<PatientInsurance[]>([]);
  const [insuranceId, setInsuranceId] = useState("");
  const [claimedAmount, setClaimedAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setInsuranceId("");
    setClaimedAmount(String(invoiceSubtotal));
    load();
  }, [open]);

  async function load() {
    setLoading(true);
    try {
      const data = await InsuranceAPI.getPatientInsurance(patientId);
      setInsurances(data);
    } catch {
      setInsurances([]);
    } finally {
      setLoading(false);
    }
  }

  // AFTER
  async function handleCreate() {
    if (!insuranceId) return;

    const amount = Number(claimedAmount);
    if (!amount || amount <= 0 || amount > invoiceSubtotal) {
      alert(`Claimed amount must be between ₦1 and ₦${invoiceSubtotal.toLocaleString()}.`);
      return;
    }

    setSubmitting(true);
    try {
      const claim = await ClaimAPI.create({ insuranceId, invoiceId, claimedAmount: amount });
      onCreated(claim.id);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to create claim.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Create Insurance Claim
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="animate-spin text-slate-400" />
              {insurances.length > 0 && (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">Claimed Amount</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₦</span>
      <input
        type="number"
        min="0"
        max={invoiceSubtotal}
        value={claimedAmount}
        onChange={(e) => setClaimedAmount(e.target.value)}
        className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
      />
    </div>
    <p className="text-xs text-slate-400 mt-1">Invoice subtotal: ₦{invoiceSubtotal.toLocaleString()}</p>
  </div>
)}
            </div>
          ) : insurances.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <AlertCircle size={16} className="shrink-0" />
              This patient has no insurance on file. Add insurance on their profile before creating a claim.
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Insurance</label>
              <div className="space-y-2">
                {insurances.map((ins) => {
                  const isSelected = insuranceId === ins.id;
                  return (
                    <button
                      key={ins.id}
                      type="button"
                      onClick={() => setInsuranceId(ins.id)}
                      className={`w-full text-left p-3 border rounded-lg transition-all ${
                        isSelected ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{ins.provider.organization.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Policy: {ins.policyNumber}{ins.isPrimary ? " · Primary" : ""}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {insurances.length > 0 && (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">Claimed Amount</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₦</span>
      <input
        type="number"
        min="0"
        max={invoiceSubtotal}
        value={claimedAmount}
        onChange={(e) => setClaimedAmount(e.target.value)}
        className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
      />
    </div>
    <p className="text-xs text-slate-400 mt-1">Invoice subtotal: ₦{invoiceSubtotal.toLocaleString()}</p>
  </div>
)}
        </div>

        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!insuranceId || !claimedAmount || submitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {submitting ? (<><Loader2 size={14} className="animate-spin" />Creating...</>) : "Create Claim"}
          </button>
        </div>
      </div>
    </div>
  );
}
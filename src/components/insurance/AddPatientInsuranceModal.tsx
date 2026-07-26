"use client";

import { useState } from "react";
import { X, Shield, Loader2 } from "lucide-react";
import { InsuranceAPI } from "@/services/insurance";
import InsuranceProviderSelect from "./InsuranceProviderSelect";

interface Props {
  open: boolean;
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddPatientInsuranceModal({ open, patientId, onClose, onSaved }: Props) {
  const [providerId, setProviderId] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [memberId, setMemberId] = useState("");
  const [authorizationNumber, setAuthorizationNumber] = useState("");
  const [planName, setPlanName] = useState("");
  const [coveragePercent, setCoveragePercent] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);
  const [authorizationRequired, setAuthorizationRequired] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function reset() {
    setProviderId("");
    setPolicyNumber("");
    setMemberId("");
    setAuthorizationNumber("");
    setPlanName("");
    setCoveragePercent("");
    setIsPrimary(true);
    setAuthorizationRequired(false);
    setStartDate("");
    setEndDate("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!providerId || !policyNumber.trim()) return;

    setSaving(true);
    try {
      await InsuranceAPI.assignInsurance({
        patientId,
        providerId,
        policyNumber: policyNumber.trim(),
        memberId: memberId.trim() || undefined,
        authorizationNumber: authorizationNumber.trim() || undefined,
        planName: planName.trim() || undefined,
        coveragePercent: coveragePercent ? Number(coveragePercent) : undefined,
        isPrimary,
        authorizationRequired,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      reset();
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add insurance. Please check all fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Shield size={18} className="text-amber-600" />
            Add Insurance
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className={labelClass}>Insurer <span className="text-red-500">*</span></label>
              <InsuranceProviderSelect value={providerId} onChange={setProviderId} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Policy Number <span className="text-red-500">*</span></label>
                <input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Member ID</label>
                <input value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Plan Name</label>
                <input value={planName} onChange={(e) => setPlanName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Coverage %</label>
                <input type="number" min="0" max="100" value={coveragePercent} onChange={(e) => setCoveragePercent(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Authorization Number</label>
              <input value={authorizationNumber} onChange={(e) => setAuthorizationNumber(e.target.value)} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
                Primary insurance
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={authorizationRequired} onChange={(e) => setAuthorizationRequired(e.target.checked)} />
                Requires prior authorization
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 bg-white shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !providerId || !policyNumber.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? (<><Loader2 size={14} className="animate-spin" />Saving...</>) : "Add Insurance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
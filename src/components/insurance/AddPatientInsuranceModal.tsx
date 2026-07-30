"use client";

import { useEffect, useState } from "react";
import { X, Shield, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { InsuranceAPI, InsuranceProvider } from "@/services/insurance";
import InsuranceProviderSelect from "./InsuranceProviderSelect";

interface Plan {
  id: string;
  name: string;
  scope: "GENERAL" | "CONDITION_SPECIFIC";
  coveragePercent: number;
  authorizationRequired: boolean;
  maxClaimAmount: number | null;
}

interface Props {
  open: boolean;
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddPatientInsuranceModal({ open, patientId, onClose, onSaved }: Props) {
  const [providerId, setProviderId] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider | null>(null);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [planId, setPlanId] = useState("");

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

  const isZensa = selectedProvider?.integrationMode === "ZENSA";

  useEffect(() => {
    if (!providerId) {
      setSelectedProvider(null);
      setPlans([]);
      setPlanId("");
      return;
    }

    InsuranceAPI.getProviders().then((all) => {
      const found = all.find((p) => p.id === providerId) ?? null;
      setSelectedProvider(found);
    });

  }, [providerId]);

  useEffect(() => {
    if (!providerId || !isZensa) {
      setPlans([]);
      setPlanId("");
      return;
    }

    setLoadingPlans(true);
    api.get(`/insurance-Provider/${providerId}/plans`)
      .then((r) => setPlans(r.data))
      .catch(() => setPlans([]))
      .finally(() => setLoadingPlans(false));

  }, [providerId, isZensa]);

  if (!open) return null;

  function reset() {
    setProviderId("");
    setSelectedProvider(null);
    setPlans([]);
    setPlanId("");
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
    if (isZensa && !planId) {
      alert("Please select a plan for this insurer.");
      return;
    }

    setSaving(true);
    try {
      await InsuranceAPI.assignInsurance({
        patientId,
        providerId,
        planId: isZensa ? planId : undefined,
        policyNumber: policyNumber.trim(),
        memberId: memberId.trim() || undefined,
        authorizationNumber: authorizationNumber.trim() || undefined,
        planName: isZensa ? undefined : (planName.trim() || undefined),
        coveragePercent: isZensa ? undefined : (coveragePercent ? Number(coveragePercent) : undefined),
        isPrimary,
        authorizationRequired: isZensa ? undefined : authorizationRequired,
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

            {isZensa && (
              <div>
                <label className={labelClass}>Plan <span className="text-red-500">*</span></label>
                {loadingPlans ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                    <Loader2 size={14} className="animate-spin" />
                    Loading plans...
                  </div>
                ) : plans.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    This insurer has no active plans configured yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {plans.map((plan) => {
                      const selected = planId === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setPlanId(plan.id)}
                          className={`w-full text-left p-3 border rounded-lg transition-all ${
                            selected ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
                            <span className="text-xs font-medium text-slate-500">{plan.coveragePercent}% coverage</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                              plan.scope === "CONDITION_SPECIFIC"
                                ? "bg-violet-50 text-violet-700 border-violet-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}>
                              {plan.scope === "CONDITION_SPECIFIC" ? "Condition-specific" : "General"}
                            </span>
                            {plan.authorizationRequired && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                Requires pre-auth
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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

            {!isZensa && (
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
            )}

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
              {!isZensa && (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={authorizationRequired} onChange={(e) => setAuthorizationRequired(e.target.checked)} />
                  Requires prior authorization
                </label>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 bg-white shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !providerId || !policyNumber.trim() || (isZensa && !planId)}
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
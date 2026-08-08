"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ShieldCheck, Loader2, Plus, X } from "lucide-react";

interface AuthRequest {
  id: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  patientInsurance: {
    patient: { firstName: string; lastName: string; patientNumber: string };
    provider: { organization: { name: string } };
  };
}

interface PatientInsuranceOption {
  id: string;
  policyNumber: string;
  patient: { id: string; firstName: string; lastName: string; patientNumber: string };
  provider: { organization: { name: string } };
}

export default function AuthorizationRequestsPage() {
  const [requests, setRequests] = useState<AuthRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [patientSearch, setPatientSearch] = useState("");
  const [insuranceOptions, setInsuranceOptions] = useState<PatientInsuranceOption[]>([]);
  const [selectedInsuranceId, setSelectedInsuranceId] = useState("");
  const [visitId, setVisitId] = useState("");
  const [cptSearch, setCptSearch] = useState("");
  const [cptResults, setCptResults] = useState<any[]>([]);
  const [selectedCpt, setSelectedCpt] = useState<any>(null);

  const [icdSearch, setIcdSearch] = useState("");
  const [icdResults, setIcdResults] = useState<any[]>([]);
  const [selectedIcd, setSelectedIcd] = useState<any>(null);

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get("/authorization-requests");
      setRequests(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function searchPatientInsurance(term: string) {
    setPatientSearch(term);
    if (!term.trim()) { setInsuranceOptions([]); return; }
    const res = await api.get(`/insurance/search?patient=${encodeURIComponent(term)}`);
    setInsuranceOptions(res.data);
  }

  async function searchCpt(term: string) {
  setCptSearch(term);
  setSelectedCpt(null);
  if (!term.trim()) { setCptResults([]); return; }
  const res = await api.get(`/authorization-requests/lookup/services?search=${encodeURIComponent(term)}`);
  setCptResults(res.data);
}

async function searchIcd(term: string) {
  setIcdSearch(term);
  setSelectedIcd(null);
  if (!term.trim()) { setIcdResults([]); return; }
  const res = await api.get(`/authorization-requests/lookup/icd10?search=${encodeURIComponent(term)}`);
  setIcdResults(res.data);
}

async function submit() {
  if (!selectedInsuranceId) return;
  if (!selectedCpt && !selectedIcd && !reason.trim()) {
    alert("Select a service or diagnosis, or add a note.");
    return;
  }
  setSubmitting(true);
  try {
    await api.post("/authorization-requests", {
      patientInsuranceId: selectedInsuranceId,
      visitId: visitId || undefined,
      cptCodeId: selectedCpt?.cpt?.id,
      icd10Id: selectedIcd?.id,
      reason: reason.trim(),
    });
    setShowForm(false);
    setSelectedInsuranceId(""); setReason(""); setSelectedCpt(null); setSelectedIcd(null);
    load();
  } catch (err: any) {
    alert(err.response?.data?.error || "Failed to submit authorization request.");
  } finally {
    setSubmitting(false);
  }
}

  const statusStyle: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={24} className="text-blue-600" />
            Prior Authorizations
          </h1>
          <p className="text-sm text-slate-500 mt-1">Request and track insurer pre-authorizations</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> New Request
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-slate-400" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">No authorization requests yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-slate-900">
                  {r.patientInsurance.patient.firstName} {r.patientInsurance.patient.lastName}
                  <span className="text-xs text-slate-400 ml-2">{r.patientInsurance.patient.patientNumber}</span>
                </p>
                <p className="text-sm text-slate-600">{r.reason}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {r.patientInsurance.provider.organization.name} · {new Date(r.requestedAt).toLocaleString()}
                </p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusStyle[r.status]}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Request Authorization</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                <input value={patientSearch} onChange={(e) => searchPatientInsurance(e.target.value)}
                  placeholder="Search patient..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
                {insuranceOptions.length > 0 && (
                  <div className="mt-2 border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
                    {insuranceOptions.map((o) => (
                      <button key={o.id} onClick={() => setSelectedInsuranceId(o.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${selectedInsuranceId === o.id ? "bg-blue-50" : ""}`}>
                        {o.patient.firstName} {o.patient.lastName} — {o.provider.organization.name} ({o.policyNumber})
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">Service (CPT)</label>
  <input value={cptSearch} onChange={(e) => searchCpt(e.target.value)}
    placeholder="Search enabled services..."
    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
  {cptResults.length > 0 && !selectedCpt && (
    <div className="mt-1 border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-32 overflow-y-auto">
      {cptResults.map((r) => (
        <button key={r.id} onClick={() => { setSelectedCpt(r); setCptSearch(""); setCptResults([]); }}
          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50">
          {r.service.cpt?.code} — {r.service.name}
        </button>
      ))}
    </div>
  )}
  {selectedCpt && (
    <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs">
      {selectedCpt.service.cpt?.code} — {selectedCpt.service.name}
      <button onClick={() => setSelectedCpt(null)}><X size={12} /></button>
    </div>
  )}
</div>

<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis (ICD-10)</label>
  <input value={icdSearch} onChange={(e) => searchIcd(e.target.value)}
    placeholder="Search diagnosis..."
    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
  {icdResults.length > 0 && !selectedIcd && (
    <div className="mt-1 border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-32 overflow-y-auto">
      {icdResults.map((r) => (
        <button key={r.id} onClick={() => { setSelectedIcd(r); setIcdSearch(""); setIcdResults([]); }}
          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50">
          {r.code} — {r.description}
        </button>
      ))}
    </div>
  )}
  {selectedIcd && (
    <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 bg-violet-50 border border-violet-200 rounded-lg text-xs">
      {selectedIcd.code} — {selectedIcd.description}
      <button onClick={() => setSelectedIcd(null)}><X size={12} /></button>
    </div>
  )}
</div>

<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
  <textarea value={reason} onChange={(e) => setReason(e.target.value)}
    placeholder="Optional context for the insurer..."
    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm resize-none" rows={2} />
</div>
            </div>
            <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600">Cancel</button>
              <button onClick={submit} disabled={submitting || !selectedInsuranceId ||(!selectedCpt && !selectedIcd && !reason.trim())}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
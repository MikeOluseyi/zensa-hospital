"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  History,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Search,
  RefreshCw,
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
}

interface CompletedProcedure {
  id: string;
  createdAt: string;
  medicalRecordService: {
    notes?: string;
    hospitalService: {
      service: {
        name: string;
        cpt?: { code: string };
      };
    };
    medicalRecord: {
      patient: Patient;
    };
  };
  procedureResult?: {
    results: string;
    notes?: string;
    createdAt: string;
    performedBy?: { firstName: string; lastName: string };
  } | null;
  labResult?: {
    data: Record<string, any>;
  } | null;
}

export default function LabHistoryPage() {
  const [procedures, setProcedures] = useState<CompletedProcedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCompleted();
  }, []);

  async function fetchCompleted() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/procedure/completed");
      setProcedures(res.data || []);
    } catch (err) {
      console.error("Failed to fetch completed procedures:", err);
      setError("Unable to load lab history.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = procedures.filter((p) => {
    const patient = p.medicalRecordService.medicalRecord.patient;
    const term = search.toLowerCase();
    return (
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(term) ||
      patient.patientNumber.toLowerCase().includes(term) ||
      p.medicalRecordService.hospitalService.service.name.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading lab history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 max-w-sm mx-auto">
        <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
        <p className="text-lg font-medium text-slate-800">Something went wrong</p>
        <p className="text-sm text-slate-500 mt-1 mb-6">{error}</p>
        <button
          onClick={fetchCompleted}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History size={24} className="text-blue-600" />
            Lab History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {procedures.length} completed {procedures.length === 1 ? "result" : "results"}
          </p>
        </div>
        <button
          onClick={fetchCompleted}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1.5 font-medium border border-slate-200 bg-white"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient or test..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
          <CheckCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-600">No results yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((proc) => {
            const patient = proc.medicalRecordService.medicalRecord.patient;
            const service = proc.medicalRecordService.hospitalService.service;

            return (
              <div key={proc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-slate-900">
                        {patient.firstName} {patient.lastName}
                      </h2>
                      <span className="text-xs font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {patient.patientNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium text-slate-800 text-sm">{service.name}</span>
                      {service.cpt?.code && (
                        <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-500">
                          CPT {service.cpt.code}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {proc.procedureResult?.performedBy
                      ? `${proc.procedureResult.performedBy.firstName} ${proc.procedureResult.performedBy.lastName}`
                      : ""}
                    {proc.procedureResult?.createdAt &&
                      ` · ${new Date(proc.procedureResult.createdAt).toLocaleString()}`}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  {proc.labResult?.data ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(proc.labResult.data).map(([key, val]) => (
                        <div key={key} className="bg-slate-50 rounded-lg border border-slate-100 p-2">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {key.replace(/_/g, " ")}
                          </p>
                          <p className="text-sm font-semibold text-slate-800">{String(val)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {proc.procedureResult?.results}
                    </p>
                  )}
                  {proc.procedureResult?.notes && (
                    <p className="text-xs text-slate-500 mt-2">
                      <span className="font-medium">Notes:</span> {proc.procedureResult.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
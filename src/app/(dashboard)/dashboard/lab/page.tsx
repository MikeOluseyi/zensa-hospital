"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ResultModal from "./components/ResultsModal";
import {
  FlaskConical,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  ClipboardList,
  RefreshCw,
  History,
} from "lucide-react";


export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
}

export interface MedicalRecord {
  patient: Patient;
}

export interface CPT {
  code: string;
}

export interface Service {
  name: string;
  cpt?: CPT;
}

export interface HospitalService {
  service: Service;
}

export interface MedicalRecordService {
  id: string;
  notes?: string;
  hospitalService: HospitalService;
  medicalRecord: MedicalRecord;
}

export interface ProcedureRequest {
  id: string;
  notes?: string;
  status: string;
  createdAt: string;
  medicalRecordService: MedicalRecordService;
}

export default function LabWorkspacePage() {
  const [procedures, setProcedures] = useState<ProcedureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultTarget, setResultTarget] = useState<ProcedureRequest | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/procedure/pending");
      setProcedures(res.data || []);
    } catch (err) {
      console.error("Failed to fetch pending procedures:", err);
      setError("Unable to load pending procedures. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const getInitials = (patient: Patient) => {
    const f = patient.firstName?.[0] || "";
    const l = patient.lastName?.[0] || "";
    return `${f}${l}`.toUpperCase() || "??";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading pending procedures...</p>
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
          onClick={fetchPending}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    // AFTER
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical size={24} className="text-blue-600" />
            Lab Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {procedures.length} {procedures.length === 1 ? "request" : "requests"} awaiting results
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/lab/history"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1.5 font-medium border border-slate-200 bg-white"
          >
            <History size={12} />
            History
          </Link>

          {procedures.length > 0 && (
            <button 
              onClick={fetchPending}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1.5 font-medium border border-slate-200 bg-white"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          )}
        </div>
      {procedures.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
          <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
          <p className="text-lg font-medium text-slate-600">All caught up</p>
          <p className="text-sm text-slate-400 mt-1">No pending procedure requests right now.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {procedures.map((proc) => {
            const { medicalRecordService } = proc;
            const patient = medicalRecordService?.medicalRecord?.patient;
            const service = medicalRecordService?.hospitalService?.service;

            if (!patient || !service) return null;

            return (
              <div
                key={proc.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 select-none">
                      {getInitials(patient)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-slate-900">
                          {patient.firstName} {patient.lastName}
                        </h2>
                        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                          {patient.patientNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-medium text-slate-800 text-sm">
                          {service.name}
                        </span>
                        {service.cpt?.code && (
                          <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-500">
                            CPT {service.cpt.code}
                          </span>
                        )}
                      </div>
                      {(medicalRecordService.notes || proc.notes) && (
                        <div className="flex items-start gap-1.5 mt-3 text-sm text-slate-600 bg-slate-50/60 p-2.5 rounded-lg border border-slate-150">
                          <ClipboardList size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-3">{medicalRecordService.notes || proc.notes}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                        <Clock size={12} />
                        Requested {new Date(proc.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setResultTarget(proc)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0 shadow-sm"
                  >
                    <Send size={14} />
                    Enter Result
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ResultModal
        target={resultTarget}
        onClose={() => setResultTarget(null)}
        onSaved={() => {
          setResultTarget(null);
          fetchPending();
        }}
      />
    </div>
  );
}
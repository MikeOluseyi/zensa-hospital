"use client";

import { useEffect, useMemo, useState } from "react";
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
  Search,
  UserRound,
  TestTube,
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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredProcedures = useMemo(() => {
    return procedures.filter((proc) => {
      const patient = proc.medicalRecordService?.medicalRecord?.patient;
      const service = proc.medicalRecordService?.hospitalService?.service;
      const q = searchQuery.toLowerCase();
      return (
        `${patient?.firstName} ${patient?.lastName}`.toLowerCase().includes(q) ||
        service?.name.toLowerCase().includes(q) ||
        patient?.patientNumber.toLowerCase().includes(q)
      );
    });
  }, [procedures, searchQuery]);

  const getInitials = (patient: Patient) => {
    const f = patient.firstName?.[0] || "";
    const l = patient.lastName?.[0] || "";
    return `${f}${l}`.toUpperCase() || "??";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Loading pending procedures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 flex items-center justify-center">
        <div className="max-w-sm mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">{error}</p>
          <button
            onClick={fetchPending}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a237e] flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              Lab Workspace
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              {procedures.length} pending {procedures.length === 1 ? "request" : "requests"} awaiting results
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/lab/history"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <History className="w-3.5 h-3.5" />
              History
            </Link>
            {procedures.length > 0 && (
              <button
                onClick={fetchPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        {procedures.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient, service, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-gray-400"
            />
          </div>
        )}

        {/* Content */}
        {procedures.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-20 text-center">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <CheckCircle2 className="w-12 h-12 stroke-1 text-emerald-400" />
              <p className="text-lg font-semibold text-gray-900">All caught up</p>
              <p className="text-sm text-gray-500">No pending procedure requests right now.</p>
            </div>
          </div>
        ) : filteredProcedures.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-20 text-center">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <TestTube className="w-12 h-12 stroke-1" />
              <p className="text-sm font-medium">No matching requests</p>
              <p className="text-xs">Try adjusting your search</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProcedures.map((proc) => {
              const { medicalRecordService } = proc;
              const patient = medicalRecordService?.medicalRecord?.patient;
              const service = medicalRecordService?.hospitalService?.service;

              if (!patient || !service) return null;

              return (
                <div
                  key={proc.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0 select-none">
                        {getInitials(patient)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-semibold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h2>
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                            {patient.patientNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="font-medium text-gray-800 text-sm">
                            {service.name}
                          </span>
                          {service.cpt?.code && (
                            <span className="font-mono text-[10px] bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-600">
                              CPT {service.cpt.code}
                            </span>
                          )}
                        </div>
                        {(medicalRecordService.notes || proc.notes) && (
                          <div className="flex items-start gap-2 mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <ClipboardList className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <span className="line-clamp-3">
                              {medicalRecordService.notes || proc.notes}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          Requested {formatDate(proc.createdAt)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setResultTarget(proc)}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
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
    </div>
  );
}
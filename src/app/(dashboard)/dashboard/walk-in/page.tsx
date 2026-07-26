// src/app/(dashboard)/dashboard/walk-in/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getPatients } from "@/services/patients";
import {
  UserPlus,
  Loader2,
  Search,
  X,
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
}

export default function WalkInVisitPage() {
  const router = useRouter();
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadPatients() {
    if (allPatients.length > 0) return;
    setLoadingPatients(true);
    try {
      const data = await getPatients();
      setAllPatients(data);
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setLoadingPatients(false);
    }
  }

  async function loadDoctors() {
    try {
      const res = await api.get("/staff?role=DOCTOR");
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to load doctors:", err);
    }
  }

  const filtered = search.trim()
    ? allPatients.filter((p) => {
        const term = search.toLowerCase();
        return (
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(term) ||
          p.patientNumber.toLowerCase().includes(term)
        );
      }).slice(0, 8)
    : [];

  async function submit() {
    if (!patient || !doctorId || !reason.trim()) return;

    setSubmitting(true);
    try {

      const appointment = await api.post("/appointments", {
        patientId: patient.id,
        doctorId,
        appointmentDate: new Date().toISOString(),
        reason: reason.trim(),
      });

      await api.patch(`/appointments/${appointment.data.id}/checkin`);

      router.push("/dashboard/triage");

    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to register walk-in visit.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserPlus size={24} className="text-blue-600" />
          Walk-In Visit
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Register a patient who arrived without a scheduled appointment.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Patient <span className="text-red-500">*</span>
          </label>

          {patient ? (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-900">
                {patient.firstName} {patient.lastName}
              </span>
              <span className="text-xs text-blue-600">{patient.patientNumber}</span>
              <button
                onClick={() => { setPatient(null); setSearch(""); }}
                className="ml-auto p-1 rounded hover:bg-blue-100 text-blue-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onFocus={loadPatients}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or patient number..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {search.trim() && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {loadingPatients ? (
                    <div className="p-3 text-sm text-slate-400 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Loading...
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="p-3 text-sm text-slate-400">No matches found</div>
                  ) : (
                    filtered.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setPatient(p); setSearch(""); }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm flex items-center justify-between"
                      >
                        <span>{p.firstName} {p.lastName}</span>
                        <span className="text-xs text-slate-400">{p.patientNumber}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Assign to Doctor <span className="text-red-500">*</span>
          </label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select doctor...</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Reason for Visit <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Chief complaint or reason for the visit..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={submit}
          disabled={submitting || !patient || !doctorId || !reason.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {submitting ? "Registering..." : "Register Walk-In & Send to Triage"}
        </button>
      </div>
    </div>
  );
}
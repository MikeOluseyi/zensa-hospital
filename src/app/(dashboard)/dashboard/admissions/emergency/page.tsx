"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getPatients } from "@/services/patients";
import {
  AlertTriangle,
  Loader2,
  BedDouble,
  Search,
  X,
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
}

interface Bed {
  id: string;
  bedNumber: string;
  status: string;
  ward: { name: string };
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
}

export default function EmergencyAdmissionPage() {
  const router = useRouter();
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bedId, setBedId] = useState("");
  const [attendingDoctorId, setAttendingDoctorId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBeds();
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

  async function loadBeds() {
    try {
      const res = await api.get("/beds/available");
      setBeds(res.data);
    } catch (err) {
      console.error("Failed to load beds:", err);
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
    if (!patient || !bedId || !attendingDoctorId || !reason.trim()) return;

    setSubmitting(true);
    try {

      const res = await api.post("/admissions", {
        patientId: patient.id,
        bedId,
        attendingDoctorId,
        reason: reason.trim(),
      });

      router.push(`/dashboard/inpatients/${res.data.id}`);

    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to admit patient.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle size={24} className="text-red-600" />
          Emergency Admission
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Admit a patient directly, without a prior consultation or admission request.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Patient <span className="text-red-500">*</span>
          </label>

          {patient ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-sm font-medium text-red-900">
                {patient.firstName} {patient.lastName}
              </span>
              <span className="text-xs text-red-600">{patient.patientNumber}</span>
              <button
                onClick={() => { setPatient(null); setSearch(""); }}
                className="ml-auto p-1 rounded hover:bg-red-100 text-red-600"
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
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
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
            Bed <span className="text-red-500">*</span>
          </label>
          <select
            value={bedId}
            onChange={(e) => setBedId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
          >
            <option value="">Select an available bed...</option>
            {beds.map((b) => (
              <option key={b.id} value={b.id}>{b.ward.name} — Bed {b.bedNumber}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Attending Doctor <span className="text-red-500">*</span>
          </label>
          <select
            value={attendingDoctorId}
            onChange={(e) => setAttendingDoctorId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
          >
            <option value="">Select doctor...</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Reason for Admission <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Clinical reason for immediate admission..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={submit}
          disabled={submitting || !patient || !bedId || !attendingDoctorId || !reason.trim()}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <BedDouble size={16} />}
          {submitting ? "Admitting..." : "Admit Patient Now"}
        </button>
      </div>
    </div>
  );
}
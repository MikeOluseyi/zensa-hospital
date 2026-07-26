"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  Users,
  BedDouble,
  Building2,
  Stethoscope,
  ArrowRight,
  HeartPulse,
  Loader2,
  Search,
  ClipboardList,
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  patientNumber: string;
}

interface Ward {
  id: string;
  name: string;
  type: string;
}

interface Bed {
  id: string;
  bedNumber: string;
  ward: Ward;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
}

interface Admission {
  id: string;
  patient: Patient;
  bed: Bed;
  reason: string;
  status: string;
  admittedAt: string;
  attendingDoctor: Doctor | null;
  vitalSigns: any | null;
}

export default function WardPatientsPage() {
  const router = useRouter();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [filtered, setFiltered] = useState<Admission[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      admissions.filter(
        (a) =>
          `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase().includes(term) ||
          a.patient.patientNumber.toLowerCase().includes(term) ||
          a.bed.ward.name.toLowerCase().includes(term) ||
          a.reason.toLowerCase().includes(term)
      )
    );
  }, [search, admissions]);

  async function fetchPatients() {
    try {
      setLoading(true);
      const res = await api.get("/admissions/ward-patients");
      setAdmissions(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch ward patients:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            Ward Patients
          </h1>
          <p className="text-sm text-slate-500">Loading patients...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            Ward Patients
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} patient{filtered.length !== 1 ? "s" : ""} assigned to your department wards
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
          <HeartPulse size={16} className="text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            {admissions.filter((a) => a.vitalSigns).length} with vitals
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ward, or reason..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <BedDouble size={48} />
            <p className="text-lg font-medium text-slate-600">
              {search ? "No patients match your search" : "No patients in your wards"}
            </p>
            <p className="text-sm text-slate-500">
              {search ? "Try a different search term" : "Patients will appear here when admitted to your department"}
            </p>
          </div>
        </div>
      )}

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((admission) => (
          <div
            key={admission.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                    {admission.patient.firstName[0]}{admission.patient.lastName[0]}
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {admission.patient.firstName} {admission.patient.lastName}
                    </h2>
                    <p className="text-xs text-slate-500">{admission.patient.patientNumber}</p>
                  </div>
                </div>
                {admission.vitalSigns && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <HeartPulse size={10} className="mr-1" />
                    Vitals
                  </span>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 size={14} className="text-slate-400" />
                <span>{admission.bed.ward.name}</span>
                <span className="text-slate-300">·</span>
                <BedDouble size={14} className="text-slate-400" />
                <span>Bed {admission.bed.bedNumber}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Stethoscope size={14} className="text-slate-400" />
                <span>
                  {admission.attendingDoctor
                    ? `Dr. ${admission.attendingDoctor.firstName} ${admission.attendingDoctor.lastName}`
                    : "No doctor assigned"}
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm text-slate-600">
                <ClipboardList size={14} className="text-slate-400 mt-0.5" />
                <span className="line-clamp-2">{admission.reason}</span>
              </div>

              <p className="text-xs text-slate-400">
                Admitted {new Date(admission.admittedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Card Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => router.push(`/dashboard/inpatients/${admission.id}`)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Open Admission
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
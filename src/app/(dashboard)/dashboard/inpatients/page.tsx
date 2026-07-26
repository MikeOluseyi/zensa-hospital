"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { BedDouble, User, ArrowRight } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
}

interface Bed {
  bedNumber: string;
  ward: {
    name: string;
  };
}

interface Admission {
  id: string;
  reason: string;
  patient: Patient;
  bed: Bed;
  status: string;
  admittedAt: string;
}

export default function InpatientsPage() {
  const router = useRouter();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      setLoading(true);
      const res = await api.get("/admissions/my-patients");
      setAdmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch inpatients:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Inpatients</h1>
          <p className="text-sm text-slate-500">Loading patients...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Inpatients</h1>
        <p className="text-sm text-slate-500">
          {admissions.length} patient{admissions.length !== 1 ? "s" : ""} currently admitted under your care
        </p>
      </div>

      {/* Empty State */}
      {admissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <BedDouble size={48} className="mb-4" />
          <p className="text-lg font-medium text-slate-600">No inpatients</p>
          <p className="text-sm">No patients currently admitted under your care</p>
        </div>
      )}

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admissions.map((admission) => (
          <div
            key={admission.id}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                  {admission.patient.firstName[0]}{admission.patient.lastName[0]}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {admission.patient.firstName} {admission.patient.lastName}
                  </h2>
                  <p className="text-xs text-slate-500 capitalize">{admission.patient.gender}</p>
                </div>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {admission.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BedDouble size={14} className="text-slate-400" />
                <span>{admission.bed.ward.name} · Bed {admission.bed.bedNumber}</span>
              </div>
              <p className="text-sm text-slate-600">
                <span className="text-slate-400">Reason:</span> {admission.reason}
              </p>
            </div>

            <button
              onClick={() => router.push(`/dashboard/inpatients/${admission.id}`)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Open Admission
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
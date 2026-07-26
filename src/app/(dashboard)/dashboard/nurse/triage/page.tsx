"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  HeartPulse,
  Users,
  ArrowRight,
  Clock,
  Activity,
  Search,
  Filter,
  Stethoscope,
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
  gender: string;
  dateOfBirth: string;
}

interface Visit {
  id: string;
  createdAt: string;
  status: string;
  patient: Patient;
  appointment: {
    reason: string;
  };
}

export default function NurseTriagePage() {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredVisits(
      visits.filter(
        (a) =>
          `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase().includes(term) ||
          a.patient.patientNumber.toLowerCase().includes(term) ||
          a.appointment.reason.toLowerCase().includes(term)
      )
    );
  }, [search, visits]);

  async function loadVisits() {
  try {
    setLoading(true);
    const res =
      await api.get("/visits/triage-queue");
    setVisits(res.data);
    setFilteredVisits(res.data);
  } catch (err) {
    console.error(
      "Failed to load triage queue:",
      err
    );
  } finally {
    setLoading(false);
  }
}

  const getUrgencyColor = (reason: string) => {
    const urgent = ["emergency", "critical", "severe", "trauma", "bleeding", "chest pain"];
    if (urgent.some((u) => reason.toLowerCase().includes(u))) {
      return "bg-red-50 border-red-200 text-red-700";
    }
    return "bg-amber-50 border-amber-200 text-amber-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse size={24} className="text-rose-600" />
            Triage Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filteredVisits.length} patient{filteredVisits.length !== 1 ? "s" : ""} waiting for triage
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <Activity size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {visits.length} checked in
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
          placeholder="Search by name, number, or reason..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Queue */}
      {loading ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-rose-600 rounded-full animate-spin mb-4" />
          <p className="text-sm">Loading triage queue...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Users size={48} className="mb-2" />
            <p className="text-lg font-medium text-slate-600">
              {search ? "No patients match your search" : "No patients in triage queue"}
            </p>
            <p className="text-sm text-slate-500">
              {search ? "Try a different search term" : "Patients will appear here after check-in"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVisits.map((visit, index) => (
            <div
              key={visit.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Queue number */}
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold shrink-0">
                    {index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">
                        {visit.patient.firstName} {visit.patient.lastName}
                      </h3>
                      <span className="text-xs text-slate-500">{visit.patient.patientNumber}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                      <span className="capitalize">{visit.patient.gender}</span>
                      <span>·</span>
                      <span>
                        {visit.patient.dateOfBirth
                          ? `${Math.floor((Date.now() - new Date(visit.patient.dateOfBirth).getTime()) / 31557600000)} yrs`
                          : "Age unknown"}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Checked in {new Date(visit.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(visit.appointment.reason)}`}>
                        <Stethoscope size={12} className="mr-1" />
                        {visit.appointment.reason}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/dashboard/nurse/triage/${visit.id}`)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
                >
                  Start Triage
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
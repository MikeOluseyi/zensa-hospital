"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Users,
  HeartPulse,
  Stethoscope,
  ArrowRight,
  Loader2,
  Search,
  Activity,
  Thermometer,
  Wind,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
  gender: string;
  dateOfBirth: string;
}

interface VitalSigns {
  bloodPressure: string;
  temperature: string;
  pulse: string;
  spo2: string;
  weight: string;
  height: string;
}

interface Appointment {
  id: string;
  patient: Patient;
  reason: string;
  status: string;
  triagedAt: string;
  vitalSigns: VitalSigns | null;
  bloodPressure: string;
}

export default function NurseQueuePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [queuing, setQueuing] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      appointments.filter(
        (a) =>
          `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase().includes(term) ||
          a.patient.patientNumber.toLowerCase().includes(term) ||
          a.reason.toLowerCase().includes(term)
      )
    );
  }, [search, appointments]);

  async function loadAppointments() {
    try {
      setLoading(true);
      const res = await api.get("/appointments");
      const triaged = res.data.filter((a: any) => a.status === "TRIAGED");
      setAppointments(triaged);
      setFiltered(triaged);
    } catch (err) {
      console.error("Failed to load triaged patients:", err);
    } finally {
      setLoading(false);
    }
  }

  async function queuePatient(id: string) {
    setQueuing(id);
    try {
      await api.patch(`/appointments/${id}/queue`);
      await loadAppointments();
    } catch (err) {
      console.error("Failed to queue patient:", err);
      alert("Failed to queue patient for doctor. Please try again.");
    } finally {
      setQueuing(null);
    }
  }

  const getVitalsDisplay = (appt: Appointment) => {
    const vitals = appt.vitalSigns;
    if (!vitals) return null;

    return [
      { label: "BP", value: vitals.bloodPressure, icon: HeartPulse, color: "text-rose-500" },
      { label: "Temp", value: `${vitals.temperature}°C`, icon: Thermometer, color: "text-amber-500" },
      { label: "Pulse", value: `${vitals.pulse} bpm`, icon: Activity, color: "text-blue-500" },
      { label: "SpO₂", value: `${vitals.spo2}%`, icon: Wind, color: "text-cyan-500" },
    ].filter((v) => v.value && v.value !== "undefined" && v.value !== "null°C" && v.value !== "null bpm" && v.value !== "null%");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope size={24} className="text-purple-600" />
            Doctor Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} patient{filtered.length !== 1 ? "s" : ""} triaged and ready for consultation
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
          <Clock size={16} className="text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            {appointments.length} waiting
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
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
        />
      </div>

      {/* Queue */}
      {loading ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <Loader2 size={32} className="animate-spin mb-4" />
          <p className="text-sm">Loading triaged patients...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <CheckCircle2 size={48} className="text-emerald-400" />
            <p className="text-lg font-medium text-slate-600">
              {search ? "No patients match your search" : "No patients in queue"}
            </p>
            <p className="text-sm text-slate-500">
              {search ? "Try a different search term" : "Triaged patients will appear here ready for doctor consultation"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt, index) => {
            const vitals = getVitalsDisplay(appt);
            const isQueuing = queuing === appt.id;

            return (
              <div
                key={appt.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Queue number */}
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
                        {index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">
                            {appt.patient.firstName} {appt.patient.lastName}
                          </h3>
                          <span className="text-xs text-slate-500">{appt.patient.patientNumber}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                          <span className="capitalize">{appt.patient.gender}</span>
                          <span>·</span>
                          <span>
                            {appt.patient.dateOfBirth
                              ? `${Math.floor((Date.now() - new Date(appt.patient.dateOfBirth).getTime()) / 31557600000)} yrs`
                              : "Age unknown"}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Triaged {appt.triagedAt ? new Date(appt.triagedAt).toLocaleTimeString() : "recently"}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 mb-3">{appt.reason}</p>

                        {/* Vitals */}
                        {vitals && vitals.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            {vitals.map((vital) => {
                              const Icon = vital.icon;
                              return (
                                <span
                                  key={vital.label}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100"
                                >
                                  <Icon size={12} className={vital.color} />
                                  {vital.label}: {vital.value}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {!vitals && appt.bloodPressure && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100">
                              <HeartPulse size={12} className="text-rose-500" />
                              BP: {appt.bloodPressure}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => queuePatient(appt.id)}
                      disabled={isQueuing}
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors shrink-0"
                    >
                      {isQueuing ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Queuing...
                        </>
                      ) : (
                        <>
                          <ArrowRight size={14} />
                          Queue for Doctor
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
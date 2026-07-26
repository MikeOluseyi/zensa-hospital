"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Stethoscope,
  ArrowRight,
  Loader2,
  Clock,
  HeartPulse,
  Activity,
  Thermometer,
  Wind,
  CheckCircle2,
  Search,
  AlertTriangle,
  UserRound,
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
}

interface Appointment {
  id: string;
  patient: Patient;
  reason: string;
  status: string;
  appointmentDate: string;
  vitalSigns: VitalSigns | null;
  queuedAt: string;
}

// New state
interface OngoingAppointment {
  id: string;
  patient: Patient;
  reason: string;
  status: "IN_PROGRESS" | "READY_FOR_REVIEW";
  appointmentDate: string;
}

function getAge(dateOfBirth: string): string {
  if (!dateOfBirth) return "Age unknown";
  const years = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / 31557600000);
  return `${years} yrs`;
}

export default function DoctorQueuePage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [ongoing, setOngoing] = useState<OngoingAppointment[]>([]);
  const [resuming, setResuming] = useState<string | null>(null);

  useEffect(() => {
    loadQueue();
    loadOngoing();
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

  async function loadQueue() {
    try {
      setLoading(true);
      const res = await api.get("/appointments/doctor-queue");
      setAppointments(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to load doctor queue:", err);
    } finally {
      setLoading(false);
    }
  }

  async function startConsultation(id: string) {
    setStarting(id);
    try {
      await api.patch(
  `/consultations/${id}/start`
);
      router.push(`/dashboard/consultations/new?appointmentId=${id}`);
    } catch (err) {
      console.error("Failed to start consultation:", err);
      alert("Failed to start consultation. Please try again.");
      setStarting(null);
    }
  }

  async function loadOngoing() {
  try {
    const res = await api.get("/appointments/my-consultations");
    setOngoing(res.data);
  } catch (err) {
    console.error("Failed to load ongoing consultations:", err);
  }
}

async function resumeOrContinue(appt: OngoingAppointment) {
  setResuming(appt.id);
  try {
    if (appt.status === "READY_FOR_REVIEW") {
      await api.patch(`/consultations/${appt.id}/resume`);
    }
    router.push(`/dashboard/consultations/new?appointmentId=${appt.id}`);
  } catch (err) {
    console.error("Failed to resume consultation:", err);
    alert("Failed to resume consultation. Please try again.");
    setResuming(null);
  }
}

  const getVitalsDisplay = (appt: Appointment) => {
    const vitals = appt.vitalSigns;
    if (!vitals) return [];

    const items = [
      { label: "BP", value: vitals.bloodPressure, icon: HeartPulse, color: "text-rose-500" },
      { label: "Temp", value: vitals.temperature ? `${vitals.temperature}°C` : null, icon: Thermometer, color: "text-amber-500" },
      { label: "Pulse", value: vitals.pulse ? `${vitals.pulse} bpm` : null, icon: Activity, color: "text-blue-500" },
      { label: "SpO₂", value: vitals.spo2 ? `${vitals.spo2}%` : null, icon: Wind, color: "text-cyan-500" },
    ];

    return items.filter((v) => v.value && v.value !== "null°C" && v.value !== "null bpm" && v.value !== "null%");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope size={24} className="text-blue-600" />
            Doctor Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} patient{filtered.length !== 1 ? "s" : ""} waiting for consultation
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <Clock size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {appointments.length} in queue
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

      {/* Continue Where You Left Off */}
      {ongoing.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Continue Where You Left Off
          </h2>
          {ongoing.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-xl border border-amber-200 shadow-sm p-5 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {appt.patient.firstName} {appt.patient.lastName}
                  </h3>
                  <span className="text-xs text-slate-500">{appt.patient.patientNumber}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      appt.status === "READY_FOR_REVIEW"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}
                  >
                    {appt.status === "READY_FOR_REVIEW" ? "Ready for review" : "In progress"}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{appt.reason}</p>
              </div>
              <button
                onClick={() => resumeOrContinue(appt)}
                disabled={resuming === appt.id}
                className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {resuming === appt.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ArrowRight size={14} />
                )}
                {appt.status === "READY_FOR_REVIEW" ? "Resume" : "Continue"}
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Queue */}
      {loading ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <Loader2 size={32} className="animate-spin mb-4" />
          <p className="text-sm">Loading queue...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <CheckCircle2 size={48} className="text-emerald-400" />
            <p className="text-lg font-medium text-slate-600">
              {search ? "No patients match your search" : "Queue is empty"}
            </p>
            <p className="text-sm text-slate-500">
              {search ? "Try a different search term" : "No patients waiting for consultation"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt, index) => {
            const vitals = getVitalsDisplay(appt);
            const isStarting = starting === appt.id;
            const hasVitals = vitals.length > 0;

            return (
              <div
                key={appt.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Queue number */}
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
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
                          <span>{getAge(appt.patient.dateOfBirth)}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Queued {appt.queuedAt ? new Date(appt.queuedAt).toLocaleTimeString() : "recently"}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 mb-3">{appt.reason}</p>

                        {/* Vitals */}
                        {hasVitals ? (
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
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle size={12} />
                            No vitals recorded
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => startConsultation(appt.id)}
                      disabled={isStarting}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
                    >
                      {isStarting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <ArrowRight size={14} />
                          Start Consultation
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
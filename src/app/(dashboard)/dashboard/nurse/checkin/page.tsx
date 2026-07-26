"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  ClipboardCheck,
  User,
  Calendar,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Users,
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
  gender: string;
  dateOfBirth: string;
}

interface Appointment {
  id: string;
  patient: Patient;
  reason: string;
  status: string;
  appointmentDate: string;
  doctor: {
    firstName: string;
    lastName: string;
  };
}

export default function NurseCheckinPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
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

  async function fetchAppointments() {
    try {
      setLoading(true);
      const res = await api.get("/appointments");
      const scheduled = res.data.filter((a: any) => a.status === "SCHEDULED");
      setAppointments(scheduled);
      setFiltered(scheduled);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function checkIn(id: string) {
    setCheckingIn(id);
    try {
      await api.patch(`/appointments/${id}/checkin`);
      await fetchAppointments();
    } catch (err) {
      console.error("Failed to check in:", err);
      alert("Failed to check in patient. Please try again.");
    } finally {
      setCheckingIn(null);
    }
  }

  const getAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return "Age unknown";
    const years = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / 31557600000);
    return `${years} yrs`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck size={24} className="text-blue-600" />
            Check-In Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} appointment{filtered.length !== 1 ? "s" : ""} waiting for check-in
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <Users size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {appointments.length} scheduled
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
          <Loader2 size={32} className="animate-spin mb-4" />
          <p className="text-sm">Loading scheduled appointments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <CheckCircle2 size={48} className="text-emerald-400" />
            <p className="text-lg font-medium text-slate-600">
              {search ? "No appointments match your search" : "All caught up"}
            </p>
            <p className="text-sm text-slate-500">
              {search ? "Try a different search term" : "No scheduled appointments waiting for check-in"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt, index) => {
            const isCheckingIn = checkingIn === appt.id;

            return (
              <div
                key={appt.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Number */}
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
                            <Calendar size={12} />
                            {new Date(appt.appointmentDate).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <AlertCircle size={10} />
                            {appt.reason}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <User size={10} />
                            Dr. {appt.doctor.firstName} {appt.doctor.lastName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => checkIn(appt.id)}
                      disabled={isCheckingIn}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
                    >
                      {isCheckingIn ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Checking in...
                        </>
                      ) : (
                        <>
                          <ArrowRight size={14} />
                          Check In
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
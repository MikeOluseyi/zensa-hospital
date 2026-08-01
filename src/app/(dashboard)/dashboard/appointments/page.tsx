"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import AddAppointmentModal from "@/components/appointments/AddAppointmentModal";
import AppointmentsCalendar from "@/components/appointments/AppointmentsCalendar";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";

interface Appointment {
  id: string;
  appointmentDate: string;
  reason: string;
  status: "SCHEDULED" | "CHECKED_IN" | "TRIAGED" | "QUEUED" | "IN_PROGRESS" | "AWAITING_RESULTS" | "READY_FOR_REVIEW" | "CONSULTED" | "ADMISSION_REQUESTED" |
  "ADMITTED" | 
  "TRANSFERRED" |"COMPLETED" | "CANCELLED";
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const statusStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  SCHEDULED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Scheduled" },
  CHECKED_IN: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", label: "Checked In" },
  TRIAGED: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", label: "Triaged" },
  QUEUED: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", label: "Queued" },
  IN_PROGRESS: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "In Progress" },
  AWAITING_RESULTS: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Awaiting Results" },
  READY_FOR_REVIEW: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "Ready for Review" },
  CONSULTED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Consulted" },
  ADMISSION_REQUESTED: { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200", label: "Admission Requested" },
  ADMITTED: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", label: "Admitted" },
  TRANSFERRED: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", label: "Transferred" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Completed" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Cancelled" },
};

export default function AppointmentsPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateTab, setDateTab] = useState<"TODAY" | "UPCOMING" | "PAST" | "ALL">("TODAY");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);


  useEffect(() => {
    let result = appointments;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  if (dateTab === "TODAY") {
    result = result.filter((a) => {
      const d = new Date(a.appointmentDate);
      return d >= startOfToday && d < startOfTomorrow;
    });
  } else if (dateTab === "UPCOMING") {
    result = result.filter((a) => new Date(a.appointmentDate) >= startOfTomorrow);
  } else if (dateTab === "PAST") {
    result = result.filter((a) => new Date(a.appointmentDate) < startOfToday);
  }

  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      (a) =>
        `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase().includes(term) ||
        a.reason.toLowerCase().includes(term)
    );
  }

  if (statusFilter !== "ALL") {
    result = result.filter((a) => a.status === statusFilter);
  }

  setFiltered(result);
}, [search, statusFilter, dateTab, appointments]);

  async function fetchAppointments() {
    try {
      setLoading(true);
      const res = await api.get("/appointments");
      setAppointments(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function completeConsultation(id: string) {
    try {
      await api.patch(`/appointments/${id}/complete`);
      fetchAppointments();
    } catch (err) {
      console.error("Failed to complete consultation:", err);
    }
  }

  const activeStatuses = ["SCHEDULED", "IN_PROGRESS", "CONSULTED"];
  const activeCount = appointments.filter((a) => activeStatuses.includes(a.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-sm text-slate-500">
            {activeCount} active · {appointments.length} total
          </p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Create Appointment
        </button>
      </div>

<div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg w-fit">
  {[
    { id: "TODAY", label: "Today" },
    { id: "UPCOMING", label: "Upcoming" },
    { id: "PAST", label: "Past" },
    { id: "ALL", label: "All" },
  ].map((tab) => (
    <button
      key={tab.id}
      onClick={() => setDateTab(tab.id as typeof dateTab)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
        dateTab === tab.id
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient or reason..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CONSULTED">Consulted</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-sm">Loading appointments...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Calendar size={32} />
                      <p className="text-sm font-medium text-slate-600">
                        {search || statusFilter !== "ALL"
                          ? "No appointments match your filters"
                          : "No appointments found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => {
                  const style = statusStyles[appt.status] || statusStyles.SCHEDULED;
                  const isOwner = user?.role !== "DOCTOR" || appt.doctor.id === user?.id;

                  return (
                    <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {appt.patient.firstName[0]}{appt.patient.lastName[0]}
                          </div>
                          <Link
                            href={`/dashboard/patients/${appt.patient.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {appt.patient.firstName} {appt.patient.lastName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        Dr. {appt.doctor.firstName} {appt.doctor.lastName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock size={14} className="text-slate-400" />
                          {new Date(appt.appointmentDate).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{appt.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {appt.status === "IN_PROGRESS" && isOwner && (
                            <button
                              onClick={() =>
                                router.push(`/dashboard/consultations/new?appointmentId=${appt.id}`)
                              }
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors"
                            >
                              <Stethoscope size={12} />
                              Consult
                            </button>
                          )}
                          {appt.status === "READY_FOR_REVIEW" && isOwner && (
                            <button
                              onClick={async () => {
                                await api.patch(`/consultations/${appt.id}/resume`);
                                router.push(`/dashboard/consultations/new?appointmentId=${appt.id}`);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-medium hover:bg-orange-700 transition-colors"
                            >
                              <Stethoscope size={12} /> Resume
                            </button>
                          )}
                          {appt.status === "CONSULTED" && (
                            <button
                              onClick={() => completeConsultation(appt.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                            >
                              <CheckCircle2 size={12} />
                              Complete
                            </button>
                          )}
                          {appt.status === "SCHEDULED" && (
                           <span className="text-xs text-slate-400">Awaiting check-in</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-blue-600" />
          Calendar View
        </h2>
        <AppointmentsCalendar appointments={appointments} />
      </div>

      <AddAppointmentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={fetchAppointments}
      />
    </div>
  );
}
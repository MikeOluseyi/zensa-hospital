"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  Hospital,
  BedDouble,
  ArrowRightLeft,
  LogOut,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  X,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
  gender: string;
}

interface Ward {
  id: string;
  name: string;
}

interface Bed {
  id: string;
  bedNumber: string;
  ward: Ward;
}

interface Admission {
  id: string;
  patient: Patient;
  bed: Bed;
  reason: string;
  status: "ADMITTED" | "DISCHARGED" | "TRANSFERRED";
  admittedAt: string;
  attendingDoctor?: {
    firstName: string;
    lastName: string;
  };
}

interface AvailableBed {
  id: string;
  bedNumber: string;
  ward: Ward;
  dailyRate: number | null;
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [filtered, setFiltered] = useState<Admission[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Transfer states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [availableBeds, setAvailableBeds] = useState<AvailableBed[]>([]);
  const [transferring, setTransferring] = useState(false);

  const [transferForm, setTransferForm] = useState({
    newBedId: "",
    reason: "MEDICAL",
    notes: ""
  });

  useEffect(() => {
    fetchAdmissions();
  }, []);

  useEffect(() => {
    let result = admissions;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (a) =>
          `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase().includes(term) ||
          a.patient.patientNumber.toLowerCase().includes(term) ||
          a.reason.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((a) => a.status === statusFilter);
    }

    setFiltered(result);
  }, [search, statusFilter, admissions]);

  async function fetchAdmissions() {
    try {
      setLoading(true);
      const res = await api.get("/admissions");
      setAdmissions(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch admissions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailableBeds() {
    try {
      const res = await api.get("/beds/available");
      setAvailableBeds(res.data);
    } catch (err) {
      console.error("Failed to fetch available beds:", err);
    }
  }

  function openTransferModal(admission: Admission) {
    setSelectedAdmission(admission);
    setShowTransferModal(true);
    setTransferForm({ newBedId: "", reason: "MEDICAL", notes: "" });
    fetchAvailableBeds();
  }

  async function transferPatient() {
    if (!selectedAdmission || !transferForm.newBedId) return;

    setTransferring(true);
    try {
      await api.patch(
        `/admissions/${selectedAdmission.id}/transfer`,
        transferForm
      );
      setShowTransferModal(false);
      setSelectedAdmission(null);
      fetchAdmissions();
    } catch (err) {
      console.error("Failed to transfer patient:", err);
      alert("Failed to transfer patient. Please try again.");
    } finally {
      setTransferring(false);
    }
  }

  async function dischargePatient(admission: Admission) {
    const confirmed = confirm(
      `Discharge ${admission.patient.firstName} ${admission.patient.lastName}?`
    );
    if (!confirmed) return;

    try {
      await api.patch(`/admissions/${admission.id}/discharge`);
      fetchAdmissions();
    } catch (err) {
      console.error("Failed to discharge patient:", err);
      alert("Failed to discharge patient. Please try again.");
    }
  }

  const admittedCount = admissions.filter((a) => a.status === "ADMITTED").length;
  const dischargedCount = admissions.filter((a) => a.status === "DISCHARGED").length;

  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    ADMITTED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    DISCHARGED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    TRANSFERRED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  };

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
  const selectClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Hospital size={24} className="text-blue-600" />
            Admissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {admittedCount} admitted · {dischargedCount} discharged · {admissions.length} total
          </p>
        </div>
        <Link
          href="/dashboard/admissions/emergency"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <BedDouble size={16} />
          New Admission
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, number, or reason..."
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
            <option value="ADMITTED">Admitted</option>
            <option value="DISCHARGED">Discharged</option>
            <option value="TRANSFERRED">Transferred</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Admitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm">Loading admissions...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Hospital size={32} />
                      <p className="text-sm font-medium text-slate-600">
                        {search || statusFilter !== "ALL"
                          ? "No admissions match your filters"
                          : "No admissions found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((admission) => {
                  const style = statusStyles[admission.status] || statusStyles.ADMITTED;

                  return (
                    <tr key={admission.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {admission.patient.firstName[0]}{admission.patient.lastName[0]}
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/patients/${admission.patient.id}`}
                              className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                            >
                              {admission.patient.firstName} {admission.patient.lastName}
                            </Link>
                            <p className="text-xs text-slate-500">{admission.patient.patientNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Building2 size={14} className="text-slate-400" />
                          <span>
                            {admission.bed?.ward?.name} · Bed {admission.bed?.bedNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{admission.reason}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(admission.admittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
                          {admission.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {admission.attendingDoctor
                          ? `Dr. ${admission.attendingDoctor.firstName} ${admission.attendingDoctor.lastName}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {admission.status === "ADMITTED" && (
                            <>
                              <button
                                onClick={() => openTransferModal(admission)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                              >
                                <ArrowRightLeft size={12} />
                                Transfer
                              </button>
                              <button
                                onClick={() => dischargePatient(admission)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors"
                              >
                                <LogOut size={12} />
                                Discharge
                              </button>
                            </>
                          )}
                          {admission.status === "DISCHARGED" && (
                            <span className="text-xs text-slate-400">Completed</span>
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

      {/* Transfer Modal */}
      {showTransferModal && selectedAdmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft size={20} className="text-blue-600" />
                  Transfer Patient
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {selectedAdmission.patient.firstName} {selectedAdmission.patient.lastName} · Current: Bed {selectedAdmission.bed?.bedNumber}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedAdmission(null);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Bed</label>
                <div className="relative">
                  <BedDouble size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={transferForm.newBedId}
                    onChange={(e) => setTransferForm({ ...transferForm, newBedId: e.target.value })}
                    className={`${selectClass} pl-9`}
                    required
                  >
                    <option value="">Select new bed</option>
                    {availableBeds.map((bed) => (
                      <option key={bed.id} value={bed.id}>
                        {bed.ward.name} - {bed.bedNumber} {bed.dailyRate ? `(₦${bed.dailyRate.toLocaleString()}/day)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {availableBeds.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    No available beds. Please check ward capacity.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Reason</label>
                <div className="relative">
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={transferForm.reason}
                    onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                    className={selectClass}
                  >
                    <option value="MEDICAL">Medical</option>
                    <option value="UPGRADE">Upgrade</option>
                    <option value="DOWNGRADE">Downgrade</option>
                    <option value="ISOLATION">Isolation</option>
                    <option value="BED_AVAILABILITY">Bed Availability</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  placeholder="Additional notes for transfer..."
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className={`${inputClass} min-h-[80px] resize-none`}
                  rows={3}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 flex items-center justify-end gap-3 bg-white">
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedAdmission(null);
                }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={transferPatient}
                disabled={transferring || !transferForm.newBedId || availableBeds.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {transferring ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={14} />
                    Transfer Patient
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
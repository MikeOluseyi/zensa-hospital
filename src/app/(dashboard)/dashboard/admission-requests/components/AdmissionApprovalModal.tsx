"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  X,
  BedDouble,
  Stethoscope,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
}

interface Bed {
  id: string;
  bedNumber: string;
  status: string;
}

interface Ward {
  id: string;
  name: string;
  beds: Bed[];
}

interface AdmissionRequest {
  id: string;
  reason: string;
  notes?: string;
  patient: {
    firstName: string;
    lastName: string;
    patientNumber: string;
  };
  evaluationHospitalService?: {
    id: string;
    price: number;
    service: {
      name: string;
      cpt?: { code: string };
    };
  } | null;
}

interface Props {
  open: boolean;
  request: AdmissionRequest | null;
  wards: Ward[];
  doctors: Doctor[];
  onClose: () => void;
  onApproved: () => void;
}

export default function AdmissionApprovalModal({
  open,
  request,
  wards,
  doctors,
  onClose,
  onApproved,
}: Props) {
  const [bedId, setBedId] = useState("");
  const [attendingDoctorId, setAttendingDoctorId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBedId("");
    setAttendingDoctorId("");
  }, [open, request]);

  async function handleApprove() {
    if (!request || !bedId || !attendingDoctorId) return;

    setSubmitting(true);
    try {
      await api.patch(`/admission-requests/${request.id}/approve`, {
        bedId,
        attendingDoctorId,
      });

      onApproved();
      onClose();
    } catch (err: any) {
      console.error("Failed to approve admission:", err);
      alert(err?.response?.data?.error || "Failed to approve admission.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open || !request) return null;

  const availableBeds = wards.flatMap((ward) =>
    ward.beds.filter((bed) => bed.status === "AVAILABLE")
  );

  const hasEvaluationService = !!request.evaluationHospitalService;
  const canSubmit = !!(bedId && attendingDoctorId && hasEvaluationService);

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BedDouble size={20} className="text-blue-600" />
              Approve Admission
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {request.patient.firstName} {request.patient.lastName} · {request.patient.patientNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 transition-colors rounded-full hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {/* Read-only context from the doctor's request */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason for Request</p>
            <p className="text-sm text-slate-700">{request.reason}</p>
            {request.notes && (
              <p className="text-sm text-slate-500 mt-1 italic">{request.notes}</p>
            )}
          </div>

          {hasEvaluationService ? (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Evaluation Service (set by doctor)</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-900">{request.evaluationHospitalService!.service.name}</p>
                  <p className="text-xs text-blue-600/80">CPT: {request.evaluationHospitalService!.service.cpt?.code || "N/A"}</p>
                </div>
                <p className="text-sm font-semibold text-blue-700">
                  ₦{request.evaluationHospitalService!.price.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              No evaluation service was set on this request. The doctor needs to resubmit before this can be approved.
            </div>
          )}

          <p className="text-sm text-slate-500">
            The doctor's diagnosis, notes, and prescriptions will carry over automatically — you only need to assign a bed and attending doctor.
          </p>

          {/* Bed & Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <BedDouble size={12} className="inline mr-1" />
                Assign Bed <span className="text-red-500">*</span>
              </label>
              <select
                value={bedId}
                onChange={(e) => setBedId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select Bed</option>
                {availableBeds.map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {bed.bedNumber}
                  </option>
                ))}
              </select>
              {availableBeds.length === 0 && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  No available beds.
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <Stethoscope size={12} className="inline mr-1" />
                Attending Doctor <span className="text-red-500">*</span>
              </label>
              <select
                value={attendingDoctorId}
                onChange={(e) => setAttendingDoctorId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit || submitting}
            onClick={handleApprove}
            className="px-4 py-2 text-sm font-medium text-white transition-all bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Approving...
              </span>
            ) : (
              "Approve Admission"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
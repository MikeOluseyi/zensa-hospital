"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AdmissionApprovalModal from "./components/AdmissionApprovalModal";
import { User, BedDouble, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
}

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
  rejectionReason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  patient: Patient;
  evaluationHospitalService?: {
    id: string;
    price: number;
    service: {
      name: string;
      cpt?: { code: string };
    };
  } | null;
}

export default function AdmissionRequestsPage() {
  const [requests, setRequests] = useState<AdmissionRequest[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [approvalTarget, setApprovalTarget] = useState<AdmissionRequest | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchRequests(), fetchWards(), fetchDoctors()]);
    setLoading(false);
  }

  async function fetchRequests() {
    try {
      const res = await api.get("/admission-requests");
      setRequests(res.data);
    } catch {
      // silently fail
    }
  }

  async function fetchWards() {
    try {
      const res = await api.get("/wards");
      setWards(res.data);
    } catch {
      // silently fail
    }
  }

  async function fetchDoctors() {
    try {
      const res = await api.get("/staff/doctors");
      setDoctors(res.data);
    } catch {
      // silently fail
    }
  }

async function reject(requestId: string, rejectionReason: string) {
  try {
    await api.patch(`/admission-requests/${requestId}/reject`, { rejectionReason });
    fetchRequests();
  } catch {
    alert("Failed to reject admission request.");
  }
}

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const otherRequests = requests.filter((r) => r.status !== "PENDING");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading admission requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BedDouble size={24} className="text-blue-600" />
          Admission Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {pendingRequests.length} pending {pendingRequests.length === 1 ? "request" : "requests"} awaiting review
        </p>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending</h2>
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <AdmissionCard
                key={request.id}
                request={request}
                onReview={() => setApprovalTarget(request)}
                onReject={reject}
              />
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {otherRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">History</h2>
          <div className="grid gap-4">
            {otherRequests.map((request) => (
              <AdmissionCard
                key={request.id}
                request={request}
                onReview={() => setApprovalTarget(request)}
                onReject={reject}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="text-center py-20">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-600">No admission requests found</p>
          <p className="text-sm text-slate-400 mt-1">New requests will appear here when submitted.</p>
        </div>
      )}

      <AdmissionApprovalModal
        open={!!approvalTarget}
        request={approvalTarget}
        wards={wards}
        doctors={doctors}
        onClose={() => setApprovalTarget(null)}
        onApproved={fetchRequests}
      />
    </div>
  );
}

/* ============================= */
/* ADMISSION CARD COMPONENT */
/* ============================= */

// AFTER
function AdmissionCard({
  request,
  onReview,
  onReject,
}: {
  request: AdmissionRequest;
  onReview: () => void;
  onReject: (requestId: string, rejectionReason: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const isPending = request.status === "PENDING";

  const initials = `${request.patient.firstName[0] ?? ""}${request.patient.lastName[0] ?? ""}`;

  async function handleReject() {
    if (!rejectionReason.trim()) return;
    setRejecting(true);
    await onReject(request.id, rejectionReason.trim());
    setRejecting(false);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
          {initials || <User size={18} />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-semibold text-slate-900">
              {request.patient.firstName} {request.patient.lastName}
            </h2>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">ID: {request.patient.patientNumber}</p>
          <p className="text-sm text-slate-700 mt-2">{request.reason}</p>
{request.notes && (
  <p className="text-sm text-slate-500 mt-1 italic">{request.notes}</p>
)}
{request.status === "REJECTED" && request.rejectionReason && (
  <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
    <p className="text-xs font-medium text-red-700">Rejection reason</p>
    <p className="text-sm text-red-800 mt-0.5">{request.rejectionReason}</p>
  </div>
)}
          <p className="text-xs text-slate-400 mt-2">
            Requested {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions — only for pending */}
{isPending && !showRejectForm && (
  <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-3">
    <button
      onClick={onReview}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
    >
      <CheckCircle size={16} />
      Review & Approve
    </button>

    <button
      onClick={() => setShowRejectForm(true)}
      className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
    >
      <XCircle size={16} />
      Reject
    </button>
  </div>
)}

{isPending && showRejectForm && (
  <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
    <label className="block text-sm font-medium text-slate-700">
      Reason for rejection <span className="text-red-500">*</span>
    </label>
    <textarea
      autoFocus
      value={rejectionReason}
      onChange={(e) => setRejectionReason(e.target.value)}
      placeholder="Let the doctor know why this wasn't approved..."
      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
      rows={2}
    />
    <div className="flex items-center gap-3">
      <button
        disabled={rejecting || !rejectionReason.trim()}
        onClick={handleReject}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        {rejecting ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
        Confirm Reject
      </button>
      <button
        disabled={rejecting}
        onClick={() => {
          setShowRejectForm(false);
          setRejectionReason("");
        }}
        className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
)}
    </div>
  );
}

function StatusBadge({ status }: { status: AdmissionRequest["status"] }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
}
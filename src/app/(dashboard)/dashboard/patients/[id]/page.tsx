"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/services/api";
import Link from "next/link";
import AddPatientInsuranceModal from "@/components/insurance/AddPatientInsuranceModal";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Users,
  HeartPulse,
  Stethoscope,
  Pill,
  FileText,
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  BedDouble,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Thermometer,
  Activity,
  Wind,
  Weight,
  Ruler,
  ClipboardList,
  Briefcase,
  ArrowRightLeft,
  Clock,
  FlaskConical,
  Droplet,
  Dna,
} from "lucide-react";

interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  genotype: string;
  stateOfOrigin: string;
  localGovernmentOfOrigin: string;
  maritalStatus: string;
  numberOfChildren: number;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhone: string;
  nextOfKinEmail: string;
  nextOfKinAddress: string;
  insuranceId: string;
  insuranceProvider: string;
  insurance: {
    provider?: { name: string };
    policyNumber: string;
  } | null;
  visits: any[];
}

export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [openConsultationModal, setOpenConsultationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);
  const [showAddInsurance, setShowAddInsurance] = useState(false);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  async function fetchPatient() {
    try {
      setLoading(true);
      const response = await api.get(`/patients/${id}`);
      setPatient(response.data);
    } catch (err) {
      console.error("Failed to fetch patient:", err);
    } finally {
      setLoading(false);
    }
  }

  // Safe client-side handler to evaluate structured JSON metric maps or plain text
 // AFTER
  const renderProcedureResultData = (
    structuredData: Record<string, any> | null | undefined,
    fallbackText: string | null | undefined
  ) => {

    if (structuredData && typeof structuredData === "object" && Object.keys(structuredData).length > 0) {
      return (
        <div className="mt-3 bg-white border border-violet-100 rounded-lg p-3 shadow-inner">
          <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider block mb-2">
            📊 Analyzed Metrics Panel
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(structuredData).map(([key, val]) => (
              <div key={key} className="bg-slate-50/70 border border-slate-100 p-2 rounded-md">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!fallbackText) return null;

    return (
      <div className="mt-3 bg-white border border-violet-100 rounded-lg p-3">
        <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider block mb-1">
          📝 Findings Summary
        </span>
        <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap">{fallbackText}</p>
      </div>
    );

  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Patient not found</p>
        <Link href="/dashboard/patients" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          Back to patients
        </Link>
      </div>
    );
  }

  const visits = patient.visits || [];

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number | null }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon size={16} className="text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value || "-"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/patients"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {patient.firstName} {patient.middleName} {patient.lastName}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {patient.patientNumber} · {patient.gender} · Born {new Date(patient.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpenConsultationModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            New Consultation
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            Personal Information
          </h2>
          <div className="divide-y divide-slate-100">
            <InfoRow icon={Phone} label="Phone" value={patient.phone} />
            <InfoRow icon={Mail} label="Email" value={patient.email} />
            <InfoRow icon={MapPin} label="Address" value={patient.address} />
            <InfoRow icon={Droplet} label="bloodGroup" value={patient.bloodGroup} />
            <InfoRow icon={Dna} label="genotype" value={patient.genotype} />
            <InfoRow icon={MapPin} label="State of Origin" value={patient.stateOfOrigin} />
            <InfoRow icon={MapPin} label="LGA" value={patient.localGovernmentOfOrigin} />
            <InfoRow icon={Users} label="Marital Status" value={patient.maritalStatus} />
            <InfoRow icon={Users} label="Children" value={patient.numberOfChildren} />
          </div>
        </div>

        {/* Next of Kin */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users size={18} className="text-green-600" />
            Next of Kin
          </h2>
          <div className="divide-y divide-slate-100">
            <InfoRow icon={User} label="Name" value={patient.nextOfKinName} />
            <InfoRow icon={Users} label="Relationship" value={patient.nextOfKinRelationship} />
            <InfoRow icon={Phone} label="Phone" value={patient.nextOfKinPhone} />
            <InfoRow icon={Mail} label="Email" value={patient.nextOfKinEmail} />
            <InfoRow icon={MapPin} label="Address" value={patient.nextOfKinAddress} />
          </div>
        </div>

        {/* Insurance */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Shield size={18} className="text-amber-600" />
              Insurance
            </h2>
            <button
              onClick={() => setShowAddInsurance(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {Array.isArray(patient.insurance) && patient.insurance.length > 0 ? (
            <div className="space-y-3">
              {patient.insurance.map((ins: any) => (
                <div key={ins.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {ins.provider?.organization?.name ?? "Unknown Insurer"}
                    </p>
                    {ins.isPrimary && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Policy: {ins.policyNumber}</p>
                  {ins.memberId && <p className="text-xs text-slate-500">Member ID: {ins.memberId}</p>}
                  {ins.planName && <p className="text-xs text-slate-500">Plan: {ins.planName}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-2">No insurance information on file</p>
          )}
        </div>
      </div>
      
      <AddPatientInsuranceModal
        open={showAddInsurance}
        patientId={patient.id}
        onClose={() => setShowAddInsurance(false)}
        onSaved={fetchPatient}
      />

      {/* Visit History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Stethoscope size={18} className="text-rose-600" />
            Visit History
          </h2>
          <span className="text-sm text-slate-500">
            {visits.length} visit{visits.length !== 1 ? "s" : ""}
          </span>
        </div>

        {visits.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-slate-400">
            <FileText size={32} className="mb-2" />
            <p className="text-sm font-medium text-slate-600">No visit history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((visit: any) => {
              // AFTER
              const record = visit.medicalRecord;
              const expanded = expandedVisit === visit.id;

              const hasAdmission = !!visit.admission;
              const hasPrescriptions = record?.prescriptions?.length > 0;
              const hasProcedures = visit.procedureRequests?.length > 0;

              return (
                <div
                  key={visit.id}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all"
                >
                  {/* Collapsed Header */}
                  <div
                    className="cursor-pointer p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                    onClick={() =>
                      setExpandedVisit(expandedVisit === visit.id ? null : visit.id)
                    }
                  >
                    <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                      {/* Date */}
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Date</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(visit.visitDate || visit.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Doctor */}
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Doctor</p>
                        <p className="text-sm font-medium text-slate-900">
                          {record?.doctor
                            ? `Dr. ${record.doctor.firstName} ${record.doctor.lastName}`
                            : "-"}
                        </p>
                      </div>

                      {/* Diagnosis */}
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Diagnosis</p>
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {record?.diagnosis || "No diagnosis recorded"}
                        </p>
                      </div>

                      {/* ICD10 */}
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">ICD10</p>
                        <p className="text-sm font-medium text-slate-900">
                          {record?.icd10?.code || "-"}
                        </p>
                      </div>

                      {/* Admission */}
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Admission</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${hasAdmission ? "text-emerald-600" : "text-slate-400"}`}>
                          {hasAdmission ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {hasAdmission ? "YES" : "NO"}
                        </span>
                      </div>

                      {/* Prescription */}
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Prescription</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${hasPrescriptions ? "text-emerald-600" : "text-slate-400"}`}>
                          {hasPrescriptions ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {hasPrescriptions ? "YES" : "NO"}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${expanded ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expanded && record && (
                    <div className="border-t border-slate-100 px-5 py-5 space-y-5 bg-slate-50/50">
                      {/* Chief Complaint & History */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <HeartPulse size={12} className="text-rose-500" />
                            Chief Complaint
                          </p>
                          <p className="text-sm text-slate-700">{record?.chiefComplaint || "-"}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <ClipboardList size={12} className="text-blue-500" />
                            History
                          </p>
                          <p className="text-sm text-slate-700">{record?.historyOfComplaint || "-"}</p>
                        </div>
                      </div>

                      {/* Vitals */}
                      <div className="p-3 bg-white rounded-lg border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Triage
                        </p>

                        <div className="grid grid-cols-5 gap-3">
                          <div>
                            <p className="text-xs text-slate-500">BP</p>
                            <p className="text-sm font-medium">
                              {visit.systolicBP && visit.diastolicBP
                                ? `${visit.systolicBP}/${visit.diastolicBP}`
                                : "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Temp</p>
                            <p className="text-sm font-medium">{visit.temperature ?? "-"}°C</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Pulse</p>
                            <p className="text-sm font-medium">{visit.pulse ?? "-"} bpm</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">SpO₂</p>
                            <p className="text-sm font-medium">{visit.spo2 ?? "-"}%</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Weight</p>
                            <p className="text-sm font-medium">{visit.weight ?? "-"} kg</p>
                          </div>
                        </div>

                        {visit.triageNotes && (
                          <div className="mt-4">
                            <p className="text-xs text-slate-500">Nurse Notes</p>
                            <p className="text-sm font-medium">{visit.triageNotes}</p>
                          </div>
                        )}
                      </div> 

                      {/* Diagnosis & ICD10 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Diagnosis</p>
                          <p className="text-sm text-slate-700">{record?.diagnosis || "-"}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ICD10</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {record?.icd10?.code || "-"}
                            </span>
                            <span className="text-sm text-slate-700">{record?.icd10?.description || ""}</span>
                          </div>
                        </div>
                      </div>

                      {/* Treatment & Notes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Treatment</p>
                          <p className="text-sm text-slate-700">{record?.treatment || "-"}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                          <p className="text-sm text-slate-700">{record?.notes || "-"}</p>
                        </div>
                      </div>

                      {/* Procedures / Labs Section */}
                      {hasProcedures && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Briefcase size={14} className="text-violet-600" />
                            Procedures & Diagnostics
                          </p>
                          <div className="grid grid-cols-1 gap-3">
                            {visit.procedureRequests.map((p: any) => (
                              <div key={p.id} className="p-4 bg-violet-50/60 rounded-xl border border-violet-100 flex flex-col justify-between">
                                <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                                  <div className="flex items-start gap-3">
                                    <FlaskConical size={18} className="text-violet-600 shrink-0 mt-0.5" />
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-slate-900 text-sm">
                                          {p.medicalRecordService.hospitalService.service.name}
                                        </span>
                                        <span className="font-mono text-xs bg-white border border-slate-200 text-slate-500 rounded px-1.5 py-0.5">
                                          CPT {p.medicalRecordService.hospitalService.service.cpt?.code}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {p.medicalRecordService.hospitalService.service.cpt?.description}
                                      </p>
                                      {p.notes && (
                                        <p className="text-xs text-slate-600 mt-2 bg-white/40 px-2 py-1 rounded border border-slate-100">
                                          <span className="font-semibold text-slate-500">Order Note:</span> {p.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Lab Request Status Badge */}
                                  <div className="shrink-0">
                                    {p.status === "COMPLETED" ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-200 rounded-full">
                                        <CheckCircle2 size={12} />
                                        COMPLETED
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 border border-amber-200 rounded-full">
                                        <Clock size={12} className="animate-pulse" />
                                        PENDING LAB
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Dynamic Results Interceptor */}
                                {p.status === "COMPLETED" && (p.labResult || p.procedureResult) && (
                                  <div className="mt-2 space-y-2">
                                    {renderProcedureResultData(p.labResult?.data, p.procedureResult?.results)}
                                    
                                    {/* Tech internal notes */}
                                    {p.procedureResult?.notes && (
                                      <div className="text-xs text-slate-500 bg-slate-100/60 p-2 rounded-lg border border-slate-200 mt-2">
                                        <span className="font-semibold text-slate-600 block text-[10px] uppercase tracking-wider mb-0.5">
                                          Lab Tech Comments:
                                        </span>
                                        {p.procedureResult.notes}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prescriptions */}
                      {hasPrescriptions && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Pill size={14} className="text-amber-600" />
                            Prescriptions
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {record.prescriptions.map((p: any) => (
                              <div key={p.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <Pill size={16} className="text-amber-600 shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{p.inventoryItem.name}</p>
                                  <p className="text-xs text-slate-600">
                                    {p.dosage} · {p.frequency} · {p.duration}
                                  </p>
                                  {p.instructions && <p className="text-xs text-slate-500 mt-1">{p.instructions}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admission */}
                      {hasAdmission && visit.admission && (
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <BedDouble size={14} />
                            Admission
                          </p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-slate-500">Ward</p>
                              <p className="font-medium text-slate-900">{visit.admission.bed?.ward?.name || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Bed</p>
                              <p className="font-medium text-slate-900">{visit.admission.bed?.bedNumber || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Status</p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                {visit.admission.status}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Admitted</p>
                              <p className="font-medium text-slate-900">
                                {new Date(visit.admission.admittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {hasAdmission && visit.admission && visit.admission.medicationOrders?.length > 0 && (
  <div>
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
      <Pill size={14} className="text-emerald-600" />
      Inpatient Medications
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {visit.admission.medicationOrders.map((m: any) => {
        const givenCount = m.administrations.filter((a: any) => a.status === "GIVEN").length;
        return (
          <div key={m.id} className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-sm font-medium text-slate-900">{m.medicationName}</p>
            <p className="text-xs text-slate-600">{m.dosage} · {m.route} · {m.orderType}</p>
            <p className="text-xs text-slate-500 mt-1">
              {m.orderType === "PRN"
                ? `${givenCount}${m.quantityLimit ? ` / ${m.quantityLimit}` : ""} given`
                : `${givenCount} / ${m.administrations.length} doses given`}
            </p>
          </div>
        );
      })}
    </div>
  </div>
)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
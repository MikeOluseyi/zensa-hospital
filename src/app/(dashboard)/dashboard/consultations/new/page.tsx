"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import ICD10Search from "@/components/medical-records/ICD10Search";
import {HospitalService, ServiceAPI } from "@/services/services";
import ServiceSearch from "@/components/search/ServiceSearch";
import InventorySearch from "@/components/inventory/InventorySearch";
import MedicationScheduleFields from "@/components/medications/MedicationScheduleFields";
import {
  ArrowLeft,
  Stethoscope,
  User,
  Calendar,
  FileText,
  Pill,
  Briefcase,
  BedDouble,
  Save,
  Send,
  Loader2,
  Plus,
  X,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
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
  appointmentDate: string;
  status: string;
}

interface Visit {
  id: string;
  admissionRequest?: {
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
  } | null;
  systolicBP?: number;
  diastolicBP?: number;
  temperature?: number;
  pulse?: number;
  spo2?: number;
  weight?: number;
  height?: number;
  respiratoryRate?: number;
  painScore?: number;
  bloodSugar?: number;
  bmi?: number;
  headCircumference?: number;
  triageNotes?: string;
}

interface ICD10Item {
  id: string;
  code: string;
  description: string;
}

interface ServiceItem {
  id: string;
  name: string;
  cpt: {
    id: string;
    code: string;
    description: string;
  };
}

interface Prescription {
  id?: string;
  medication: string;
  inventoryItemId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  saleUnit: string;
  baseUnit: string;
  quantityPerSaleUnit: number;
  instructions: string;
  route: string;
}

interface ProcedureRequest {
  id?: string;
  hospitalServiceId: string;
  serviceId: string;
  name: string;
  code: string;
  description: string;
  notes: string;
  status?: string;
  workflow?: string;
  procedureResult?: { results: string; notes?: string } | null;
  labResult?: { data: Record<string, any> } | null;
}

interface MedicalRecord {
  id: string;
  chiefComplaint: string;
  historyOfComplaint: string;
  diagnosis: string;
  icd10: ICD10Item | null;
  treatment: string;
  notes: string;
  prescriptions: Prescription[];
  procedureRequests: ProcedureRequest[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

type SelectedProcedureService = {
  id: string;
  hospitalServiceId: string;
  serviceId: string;
  name: string;
  code: string;
  description: string;
  notes: string;
}

// Add above the component, or near your other interfaces
type MedicationDecision = {
  continue: boolean;
  orderType: "SCHEDULED" | "PRN";
  quantityLimit: string;
  scheduledTimes: string[];
};

export default function NewConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentIdFromUrl = searchParams.get("appointmentId");

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visit, setVisit] = useState<Visit | null>(null);

  // Form state
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [historyOfComplaint, setHistoryOfComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [selectedICD10, setSelectedICD10] = useState<ICD10Item | null>(null);
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [procedureRequests, setProcedureRequests] = useState<ProcedureRequest[]>([]);
  const [resuming, setResuming] = useState(false);
  const [orderingProcedure, setOrderingProcedure] = useState(false);
  const [stagedProcedures, setStagedProcedures] = useState<SelectedProcedureService[]>([]);
  const [orderingIndex, setOrderingIndex] = useState<number | null>(null);

  // Admission modal
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [admissionReason, setAdmissionReason] = useState("");
  const [admissionServices, setAdmissionServices] = useState<HospitalService[]>([]);
  const [selectedAdmissionService, setSelectedAdmissionService] = useState<HospitalService | null>(null);
  const [loadingAdmissionServices, setLoadingAdmissionServices] = useState(false);
  const [admissionNotes, setAdmissionNotes] = useState("");
  const [medicationDecisions, setMedicationDecisions] = useState<Record<number, MedicationDecision>>({});
  const [submittingAdmission, setSubmittingAdmission] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [consultationServices, setConsultationServices] = useState<HospitalService[]>([]);
  const [selectedConsultationService, setSelectedConsultationService] = useState<HospitalService | null>(null);
  const [loadingConsultationServices, setLoadingConsultationServices] = useState(false);

  useEffect(() => {
    if (appointmentIdFromUrl) {
      loadAppointment();
    } else {
      setLoading(false);
    }
  }, [appointmentIdFromUrl]);

  async function loadAppointment() {
    try {
      setLoading(true);
      const res = await api.get(`/appointments/${appointmentIdFromUrl}`);
      const appt = res.data;
      setAppointment(appt);
      try {
  const visitRes = await api.get(`/visits/by-appointment/${appt.id}`);
  setVisit(visitRes.data);
} catch (err) {
  console.log("No visit found");
}

      // AFTER
      try {
       const consultationRes = await api.get(`/consultations/${appt.id}`);
       const record = consultationRes.data?.visit?.medicalRecord;
       const visitProcedures = consultationRes.data?.visit?.procedureRequests || [];
       if (record) {
         setConsultation(record);
         populateForm(record, visitProcedures);
       } else if (visitProcedures.length > 0) {
         // No medical record yet, but procedures were already ordered
         // (e.g. sent to lab before the first draft save).
         setProcedureRequests(mapVisitProcedures(visitProcedures));
       }
      } catch {
        // No existing consultation — fresh form
      }
    } catch (err) {
      console.error("Failed to load appointment:", err);
    } finally {
      setLoading(false);
    }
  }

 // AFTER
  function mapVisitProcedures(raw: any[]): ProcedureRequest[] {
    return raw.map((p) => ({
      id: p.id,
      hospitalServiceId: p.medicalRecordService?.hospitalServiceId || "",
      serviceId: p.medicalRecordService?.hospitalService?.serviceId || "",
      name: p.medicalRecordService?.hospitalService?.service?.name || "",
      code: p.medicalRecordService?.hospitalService?.service?.cpt?.code || "",
      description: p.medicalRecordService?.hospitalService?.service?.cpt?.description || "",
      notes: p.notes || "",
      status: p.status,
      workflow: p.medicalRecordService?.workflow,
      procedureResult: p.procedureResult || null,
      labResult: p.labResult || null,
    }));
  }

  function populateForm(record: MedicalRecord, visitProcedures: any[] = []) {
    setChiefComplaint(record.chiefComplaint || "");
    setHistoryOfComplaint(record.historyOfComplaint || "");
    setDiagnosis(record.diagnosis || "");
    setTreatment(record.treatment || "");
    setNotes(record.notes || "");
    setPrescriptions(record.prescriptions || []);
    setProcedureRequests(mapVisitProcedures(visitProcedures));
    if (record.icd10) {
      // Would need to fetch ICD10 details, or store them in record
      setSelectedICD10(record.icd10);
    }
  }

  function addPrescription() {
    setPrescriptions([
      ...prescriptions,
      {
        medication: "",
        inventoryItemId: "",
        dosage: "",
        frequency: "",
        duration: "",
        quantity: 0,
        saleUnit: "",
        baseUnit: "",
        quantityPerSaleUnit: 0,
        instructions: "",
        route: "ORAL"
      },
    ]);
  }

  function updatePrescription(index: number, field: keyof Prescription, value: any) {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptions(updated);
  }

  function removePrescription(index: number) {
    setPrescriptions(prescriptions.filter((_: Prescription, i: number) => i !== index));
  }

  // AFTER
// AFTER — staging only, no API call
function addProcedure(service: SelectedProcedureService) {
  const alreadyStaged = stagedProcedures.some((p) => p.hospitalServiceId === service.id);
  const alreadyOrdered = procedureRequests.some((p) => p.hospitalServiceId === service.id);

  if (alreadyStaged || alreadyOrdered) {
    alert("Already added");
    return;
  }

  setStagedProcedures([...stagedProcedures, { ...service, notes: "" } as any]);
}

function updateStagedNotes(index: number, notes: string) {
  const updated = [...stagedProcedures];
  updated[index] = { ...updated[index], notes };
  setStagedProcedures(updated);
}

function removeStagedProcedure(index: number) {
  setStagedProcedures(stagedProcedures.filter((_, i) => i !== index));
}

async function sendProcedureToLab(index: number) {
  if (!appointment) return;

  const staged = stagedProcedures[index];
  setOrderingIndex(index);

  try {

    let currentVisit = visit;

    if (!consultation) {

      const draftRes = await api.post("/medical-records", {
        appointmentId: appointment.id,
        chiefComplaint, historyOfComplaint, diagnosis,
        icd10Id: selectedICD10?.id, treatment, notes,
        prescriptions,
      });

      setConsultation(draftRes.data);
      setPrescriptions(draftRes.data.prescriptions || []);

    }

    if (!currentVisit) {
      const visitRes = await api.get(`/visits/by-appointment/${appointment.id}`);
      currentVisit = visitRes.data;
      setVisit(currentVisit);
    }

    const orderRes = await api.post("/procedure", {
      visitId: currentVisit!.id,
      hospitalServiceId: (staged as any).hospitalServiceId,
      notes: (staged as any).notes || "",
    });

    setProcedureRequests([
      ...procedureRequests,
      {
        id: orderRes.data.id,
        hospitalServiceId: (staged as any).hospitalServiceId,
        serviceId: (staged as any).serviceId,
        name: (staged as any).name,
        code: (staged as any).code,
        description: (staged as any).description,
        notes: (staged as any).notes || "",
        status: orderRes.data.status,
        workflow: orderRes.data.workflow,
      },
    ]);

    setStagedProcedures(stagedProcedures.filter((_, i) => i !== index));

  } catch (err: any) {
    alert(err.response?.data?.error || "Failed to order procedure.");
  } finally {
    setOrderingIndex(null);
  }

}

  function removeProcedure(index: number) {
    setProcedureRequests(procedureRequests.filter((_, i) => i !== index));
  }

  function updateProcedureNotes(index: number, notes: string) {
    const updated = [...procedureRequests];
    updated[index].notes = notes;
    setProcedureRequests(updated);
  }

  function toggleContinue(index: number) {
  setMedicationDecisions((prev) => ({
    ...prev,
    [index]: prev[index] ?? { continue: true, orderType: "SCHEDULED", quantityLimit: "", scheduledTimes: [""] },
  }));
  setMedicationDecisions((prev) => ({
    ...prev,
    [index]: { ...prev[index], continue: !prev[index]?.continue },
  }));
}

function updateDecision(index: number, patch: Partial<typeof medicationDecisions[number]>) {
  setMedicationDecisions((prev) => ({ ...prev, [index]: { ...prev[index], ...patch } }));
}

  async function saveDraft() {
    if (!appointment) return;

    setSaving(true);
    try {
// Should be
 const res =  await api.post("/medical-records", {
  appointmentId: appointment.id,
  chiefComplaint,
  historyOfComplaint,
  diagnosis,
  icd10Id: selectedICD10?.id,
  treatment,
  notes,
  prescriptions
});
setConsultation(res.data);
populateForm(res.data, procedureRequests.map((p) => ({
  id: p.id,
  medicalRecordService: { hospitalService: { hospitalServiceId: p.hospitalServiceId, service: { serviceId: p.serviceId, name: p.name, cpt: { code: p.code, description: p.description } } }, workflow: p.workflow },
  notes: p.notes,
  status: p.status,
  procedureResult: p.procedureResult,
  labResult: p.labResult,
})));
      alert("Draft saved successfully");
    } catch (err: any) {
    console.log(err.response?.data);
    console.log(err);
} finally {
        setSaving(false);
    }
  }

  // AFTER
  async function requestAdmission() {
    if (!appointment || !selectedAdmissionService) return;

    setSubmittingAdmission(true);
    try {

      const draftRes = await api.post("/medical-records", {
        appointmentId: appointment.id,
        chiefComplaint, historyOfComplaint, diagnosis,
        icd10Id: selectedICD10?.id, treatment, notes,
        prescriptions
      });
      setConsultation(draftRes.data);

      const savedPrescriptions: Prescription[] = draftRes.data.prescriptions || [];
      setPrescriptions(savedPrescriptions);

      const medicationDecisionsPayload = savedPrescriptions
        .map((p, index) => ({ p, decision: medicationDecisions[index] }))
        .filter(({ decision }) => decision?.continue)
        .map(({ p, decision }) => ({
          prescriptionId: p.id,
          orderType: decision.orderType,
          quantityLimit: decision.orderType === "PRN" ? Number(decision.quantityLimit) || null : null,
          dosage: p.dosage,
          frequency: p.frequency,
          duration: p.duration,
          route: p.route,
          scheduledTimes: decision.orderType === "SCHEDULED"
            ? decision.scheduledTimes.filter(Boolean).map((t) => new Date(t).toISOString())
            : undefined,
        }));

      await api.post("/admission-requests", {
        appointmentId: appointment.id,
        reason: admissionReason,
        notes: admissionNotes,
        evaluationHospitalServiceId: selectedAdmissionService.id,
        medicationDecisions: medicationDecisionsPayload,
      });

      alert("Admission request submitted successfully");
      setShowAdmissionModal(false);
      setAdmissionReason("");
      setAdmissionNotes("");
      setSelectedAdmissionService(null);
    } catch (err) {
      console.error("Failed to submit admission request:", err);
      alert("Failed to submit admission request. Please check that diagnosis is filled in and try again.");
    } finally {
      setSubmittingAdmission(false);
    }
  }

  async function openAdmissionModal() {
  setShowAdmissionModal(true);
  setLoadingAdmissionServices(true);
  try {
    const services = await ServiceAPI.getHospitalServices("CONSULTATION", "INPATIENT");
    setAdmissionServices(services);
  } finally {
    setLoadingAdmissionServices(false);
  }
}

async function resumeConsultation() {
  if (!appointment) return;

  setResuming(true);
  try {
    const res = await api.patch(`/consultations/${appointment.id}/resume`);
    setAppointment((prev) => (prev ? { ...prev, status: res.data.status } : prev));
  } catch (err: any) {
    alert(err.response?.data?.error || "Failed to resume consultation.");
  } finally {
    setResuming(false);
  }
}

  function validatePrescriptions(): string | null {
    for (let i = 0; i < prescriptions.length; i++) {
      const p = prescriptions[i];
      if (!p.inventoryItemId) {
        return `Prescription #${i + 1}: please select a medication from the search box.`;
      }
      if (!p.quantity || p.quantity <= 0) {
        return `Prescription #${i + 1} (${p.medication || "unnamed"}): quantity must be greater than 0.`;
      }
    }
    return null;
  }

  async function submit(consultationHospitalServiceId: string) {
    if (!appointment) return;

    const validationError = validatePrescriptions();
    if (validationError) {
      alert(validationError);
      return;
    }

    setSaving(true);
    try {
     await api.patch(
  `/consultations/${appointment.id}/complete`,
  {
    consultationHospitalServiceId,
    chiefComplaint,
    historyOfComplaint,
    diagnosis,
    icd10Id: selectedICD10?.id,
    treatment,
    notes,
    prescriptions,
    procedures: []
  }
);

      alert("Consultation completed successfully");
      setShowCompleteModal(false);
      router.push("/dashboard/medical-records");
    } catch (err) {
      console.error("Failed to save consultation:", err);
      alert("Failed to save consultation. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function openCompleteModal() {
    setLoadingConsultationServices(true);
    try {
        const services =
            await ServiceAPI.getHospitalServices("CONSULTATION", "OUTPATIENT");
        setConsultationServices(services);
    } finally {
        setLoadingConsultationServices(false);
    }
    setShowCompleteModal(true);
}

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";
  const sectionClass = "bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4";

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading appointment...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
        <p className="text-lg font-medium text-slate-600">No appointment selected</p>
        <Link href="/dashboard/appointments" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          Go to appointments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/appointments"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope size={24} className="text-blue-600" />
            New Consultation
          </h1>
          {consultation && (
            <p className="text-sm text-amber-600 flex items-center gap-1 mt-0.5">
              <AlertCircle size={14} />
              Draft saved — {new Date(consultation.updatedAt || Date.now()).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Patient Card */}
      <div className="bg-linear-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white border border-blue-200 flex items-center justify-center text-blue-600 text-lg font-bold">
            {appointment.patient.firstName[0]}{appointment.patient.lastName[0]}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900">
              {appointment.patient.firstName} {appointment.patient.lastName}
            </h2>
            <div className="flex items-center gap-3 text-sm text-slate-600 mt-0.5">
              <span className="flex items-center gap-1">
                <User size={14} />
                {appointment.patient.patientNumber}
              </span>
              <span>·</span>
              <span className="capitalize">{appointment.patient.gender}</span>
              <span>·</span>
              <span>
                {appointment.patient.dateOfBirth
                  ? `${Math.floor((Date.now() - new Date(appointment.patient.dateOfBirth).getTime()) / 31557600000)} yrs`
                  : "Age unknown"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
              <Calendar size={14} />
              {new Date(appointment.appointmentDate).toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">{appointment.reason}</p>
          </div>
        </div>
      </div>

      {appointment.status === "READY_FOR_REVIEW" && (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
    <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="font-semibold text-amber-900">
        {visit?.admissionRequest?.status === "REJECTED"
          ? "Admission request was not approved"
          : "Results are ready for review"}
      </p>
      {visit?.admissionRequest?.status === "REJECTED" && visit.admissionRequest.rejectionReason && (
        <p className="text-sm text-amber-800 mt-1">
          Reason: {visit.admissionRequest.rejectionReason}
        </p>
      )}
      <p className="text-sm text-amber-700 mt-1">
        Resume the consultation to continue — the form is locked until then.
      </p>
      <button
        onClick={resumeConsultation}
        disabled={resuming}
        className="mt-3 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        {resuming ? <Loader2 size={14} className="animate-spin" /> : null}
        Resume Consultation
      </button>
    </div>
  </div>
)}

      {visit && (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
    <h2 className="text-lg font-semibold mb-4">
      Triage
    </h2>

    <div className="grid grid-cols-3 gap-4">

      <div>
        <p className="text-xs text-slate-500">Blood Pressure</p>
        <p className="font-semibold">
          {visit.systolicBP}/{visit.diastolicBP} mmHg
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500">Temperature</p>
        <p>{visit.temperature} °C</p>
      </div>

      <div>
        <p className="text-xs text-slate-500">Pulse</p>
        <p>{visit.pulse} bpm</p>
      </div>

      <div>
        <p className="text-xs text-slate-500">SpO₂</p>
        <p>{visit.spo2}%</p>
      </div>

      <div>
        <p className="text-xs text-slate-500">Weight</p>
        <p>{visit.weight} kg</p>
      </div>

      <div>
        <p className="text-xs text-slate-500">Height</p>
        <p>{visit.height} cm</p>
      </div>

    </div>

    {visit.triageNotes && (
      <div className="mt-5">
        <p className="text-xs text-slate-500">Nurse Notes</p>
        <p>{visit.triageNotes}</p>
      </div>
    )}
  </div>
)}

      {/* Chief Complaint */}
      <div className={sectionClass}>
        <label className={labelClass}>
          <HeartPulse size={14} className="inline mr-1 text-slate-400" />
          Chief Complaint *
        </label>
        <textarea
          placeholder="Patient's primary complaint..."
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          className={`${inputClass} min-h-20`}
          rows={3}
        />
      </div>

      {/* History */}
      <div className={sectionClass}>
        <label className={labelClass}>
          <ClipboardList size={14} className="inline mr-1 text-slate-400" />
          History of Present Illness
        </label>
        <textarea
          placeholder="Detailed history of the complaint..."
          value={historyOfComplaint}
          onChange={(e) => setHistoryOfComplaint(e.target.value)}
          className={`${inputClass} min-h-25`}
          rows={4}
        />
      </div>

      {/* Diagnosis */}
      <div className={sectionClass}>
        <label className={labelClass}>
          <Stethoscope size={14} className="inline mr-1 text-slate-400" />
          Diagnosis *
        </label>
        <textarea
          placeholder="Clinical diagnosis..."
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className={`${inputClass} min-h-20`}
          rows={3}
        />

        <div className="pt-2">
          <label className={labelClass}>ICD-10 Diagnosis Code</label>
          <ICD10Search
            onSelect={(item) => setSelectedICD10(item)}
          />
          {selectedICD10 && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="font-mono text-sm font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                {selectedICD10.code}
              </span>
              <span className="text-sm text-blue-800">{selectedICD10.description}</span>
              <button
                onClick={() => setSelectedICD10(null)}
                className="ml-auto p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Treatment */}
      <div className={sectionClass}>
        <label className={labelClass}>
          <FileText size={14} className="inline mr-1 text-slate-400" />
          Treatment Plan
        </label>
        <textarea
          placeholder="Treatment plan and recommendations..."
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          className={`${inputClass} min-h-25`}
          rows={4}
        />
      </div>

      {/* Clinical Notes */}
      <div className={sectionClass}>
        <label className={labelClass}>
          <FileText size={14} className="inline mr-1 text-slate-400" />
          Clinical Notes
        </label>
        <textarea
          placeholder="Additional clinical observations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} min-h-20`}
          rows={3}
        />
      </div>

      {/* Procedures */}
<div className={sectionClass}>
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
      <Briefcase size={18} className="text-violet-600" />
      Procedures
    </h2>
    <span className="text-sm text-slate-500">
      {procedureRequests.length} ordered
      {stagedProcedures.length > 0 && ` · ${stagedProcedures.length} pending review`}
    </span>
  </div>

  <ServiceSearch category="SPECIALIST" onSelect={addProcedure} />

  {stagedProcedures.length > 0 && (
    <div className="space-y-3 mt-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Not yet sent — review before ordering
      </p>
      {stagedProcedures.map((staged: any, index: number) => (
        <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
          <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
            <Briefcase size={14} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{staged.name}</span>
              <span className="font-mono text-xs bg-white border rounded px-2 py-0.5">{staged.code}</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{staged.description}</p>
            <textarea
              placeholder="Procedure notes (optional)..."
              value={staged.notes}
              onChange={(e) => updateStagedNotes(index, e.target.value)}
              className="mt-2 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none"
              rows={2}
            />
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => sendProcedureToLab(index)}
                disabled={orderingIndex === index}
                className="flex items-center gap-1.5 bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {orderingIndex === index ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Send to Lab
              </button>
              <button
                onClick={() => removeStagedProcedure(index)}
                className="text-xs text-slate-500 hover:text-red-600 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  {procedureRequests.length > 0 && (
    <div className="space-y-3 mt-4">
      {stagedProcedures.length > 0 && (
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordered</p>
      )}
      {procedureRequests.map((procedure: ProcedureRequest, index: number) => (
        <div key={index} className="flex items-start gap-3 p-4 bg-violet-50 rounded-lg border border-violet-200">
          <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
            <Briefcase size={14} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{procedure.name}</span>
              <span className="font-mono text-xs bg-white border rounded px-2 py-0.5">{procedure.code}</span>
              {procedure.status && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  procedure.status === "COMPLETED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : procedure.status === "IN_PROGRESS"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}>
                  {procedure.status === "COMPLETED" ? "Result ready" : procedure.status === "IN_PROGRESS" ? "In progress" : "Ordered — awaiting result"}
                </span>
              )}
            </div>
            <p className="text-sm text-violet-900 mt-1">{procedure.description}</p>
            {procedure.notes && (
              <p className="text-sm text-slate-600 mt-2 bg-white/60 rounded-lg border border-violet-100 p-2">
                {procedure.notes}
              </p>
            )}
            {(procedure.labResult || procedure.procedureResult) && (
              <div className="mt-3 pt-3 border-t border-violet-200">
                <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-2">Result</p>
                {procedure.labResult?.data ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(procedure.labResult.data).map(([key, val]) => (
                      <div key={key} className="bg-white rounded-lg border border-violet-100 p-2">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{key.replace(/_/g, " ")}</p>
                        <p className="text-sm font-semibold text-slate-800">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 bg-white rounded-lg border border-violet-100 p-2 whitespace-pre-wrap">
                    {procedure.procedureResult?.results}
                  </p>
                )}
                {procedure.procedureResult?.notes && (
                  <p className="text-xs text-slate-500 mt-2">
                    <span className="font-medium">Lab notes:</span> {procedure.procedureResult.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      {/* Prescriptions */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Pill size={18} className="text-amber-600" />
            Prescriptions
          </h2>
          <button
            type="button"
            onClick={addPrescription}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Add Drug
          </button>
        </div>

        <div className="space-y-4 mt-4">
          {prescriptions.map((prescription, index) => (
            <div key={index} className="p-5 bg-amber-50/50 rounded-xl border border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Prescription #{index + 1}</span>
                <button
                  onClick={() => removePrescription(index)}
                  className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-400 hover:text-amber-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

             <InventorySearch
    filterType="MEDICATION"
    placeholder="Search medication..."
    onSelect={(item) => {
  setPrescriptions(prev => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      medication: item.name,
      inventoryItemId: item.id,
      saleUnit: item.saleUnit,
      baseUnit: item.baseUnit,
      quantityPerSaleUnit: item.unitsPerSaleUnit
    };
    return updated;
  });
}}
/>
{prescription.saleUnit && (
  <div className="text-xs text-slate-500 mt-1">
    Each {prescription.saleUnit} contains{" "}
    {prescription.quantityPerSaleUnit}{" "}
    {prescription.baseUnit}
  </div>
)}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">Dosage</label>
                  <input
                    placeholder="e.g. 500mg"
                    value={prescription.dosage}
                    onChange={(e) => updatePrescription(index, "dosage", e.target.value)}
                    className="mt-1 w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Frequency</label>
                  <input
                    placeholder="e.g. Twice daily"
                    value={prescription.frequency}
                    onChange={(e) => updatePrescription(index, "frequency", e.target.value)}
                    className="mt-1 w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Duration</label>
                  <input
                    placeholder="e.g. 5 days"
                    value={prescription.duration}
                    onChange={(e) => updatePrescription(index, "duration", e.target.value)}
                    className="mt-1 w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Quantity {prescription.saleUnit &&
` (${prescription.saleUnit})`} </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={prescription.quantity || ""}
                    onChange={(e) => updatePrescription(index, "quantity", parseInt(e.target.value) || 0)}
                    className="mt-1 w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Instructions</label>
                <textarea
                  placeholder="e.g. Take after meals, Avoid alcohol..."
                  value={prescription.instructions}
                  onChange={(e) => updatePrescription(index, "instructions", e.target.value)}
                  className="mt-1 w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 sticky bottom-4 bg-white p-4 rounded-xl border border-slate-200 shadow-lg">
        <button
  type="button"
  onClick={openAdmissionModal}
  className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-100 border border-orange-200 transition-colors"
>
  <BedDouble size={16} />
  Request Admission
</button>

        <button
          type="button"
          onClick={saveDraft}
          disabled={saving || appointment.status === "READY_FOR_REVIEW"}
          className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-100 border border-amber-200 transition-colors"
        >
          <Save size={16} />
          Save Draft
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={openCompleteModal}
          disabled={saving || appointment.status === "READY_FOR_REVIEW"}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Send size={16} />
              Complete Consultation
            </>
          )}
        </button>
      </div>

      {/* Admission Modal */}
{showAdmissionModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <BedDouble size={20} className="text-orange-600" />
          Admission Request
        </h2>
        <button
          onClick={() => setShowAdmissionModal(false)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-4 overflow-y-auto flex-1">
        <div>
          <label className={labelClass}>
            Inpatient Evaluation Service <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Determines the admission evaluation fee (separate from the bed charge).
          </p>

          {loadingAdmissionServices ? (
            <div className="flex items-center justify-center py-6 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : admissionServices.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              No consultation services enabled for this hospital.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {admissionServices.map((service) => {
                const isSelected = selectedAdmissionService?.id === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedAdmissionService(service)}
                    className={`w-full flex items-center justify-between p-3 text-left border rounded-lg transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
                        {service.service.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${isSelected ? "text-blue-600/80" : "text-slate-500"}`}>
                        CPT: {service.service.cpt?.code || "N/A"}
                      </p>
                    </div>
                    <p className={`text-sm font-semibold ${isSelected ? "text-blue-700" : "text-slate-600"}`}>
                      ₦{service.price.toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

{prescriptions.length > 0 && (
  <div>
    <label className={labelClass}>Continue Medications into Admission</label>
    <p className="text-xs text-slate-500 mb-2">
      Choose which prescriptions from this consultation should continue as inpatient orders.
    </p>
    <div className="space-y-3">
      {prescriptions.map((p, index) => {
        const decision = medicationDecisions[index];
        return (
          <div key={index} className="border border-slate-200 rounded-lg p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={!!decision?.continue}
                onChange={() => toggleContinue(index)}
              />
              {p.medication || "Unnamed medication"} — {p.dosage}
            </label>
            {decision?.continue && (
              <div className="mt-3 pl-6">
                <MedicationScheduleFields
                  orderType={decision.orderType}
                  scheduledTimes={decision.scheduledTimes}
                  quantityLimit={decision.quantityLimit}
                  onOrderTypeChange={(orderType) => updateDecision(index, { orderType })}
                  onScheduledTimesChange={(scheduledTimes) => updateDecision(index, { scheduledTimes })}
                  onQuantityLimitChange={(quantityLimit) => updateDecision(index, { quantityLimit })}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}

        <div>
          <label className={labelClass}>Reason for Admission *</label>
          <textarea
            placeholder="Clinical reason for admission..."
            value={admissionReason}
            onChange={(e) => setAdmissionReason(e.target.value)}
            className={`${inputClass} min-h-20`}
            rows={3}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Additional Notes</label>
          <textarea
            placeholder="Any special requirements or notes..."
            value={admissionNotes}
            onChange={(e) => setAdmissionNotes(e.target.value)}
            className={`${inputClass} min-h-15`}
            rows={2}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 p-4 flex items-center justify-end gap-3 bg-white shrink-0">
        <button
          onClick={() => setShowAdmissionModal(false)}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={requestAdmission}
          disabled={submittingAdmission || !admissionReason.trim() || !selectedAdmissionService}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          {submittingAdmission ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={14} />
              Submit Request
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
     {/* Complete Consultation Modal */}
{showCompleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
    
    <div className="w-full max-w-lg bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <h2 className="text-lg font-semibold text-slate-800">
          Complete Consultation
        </h2>
        <button
          onClick={() => setShowCompleteModal(false)}
          className="p-2 text-slate-400 transition-colors rounded-full hover:text-slate-700 hover:bg-slate-200/50 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body — this is the part that scrolls */}
      <div className="p-6 overflow-y-auto flex-1">
        {loadingConsultationServices ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium">Loading services...</span>
          </div>
        ) : consultationServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2 text-slate-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm font-medium">No consultation services enabled</span>
            <p className="text-xs text-slate-400 text-center max-w-xs">
              Ask an admin to enable at least one consultation service under Hospital Services before completing consultations.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {consultationServices.map((service) => {
              const isSelected = selectedConsultationService?.id === service.id;
              
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedConsultationService(service)}
                  className={`
                    w-full flex flex-col items-start p-4 text-left border rounded-xl transition-all duration-200 focus:outline-none
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm"
                    }
                  `}
                >
                  <div className={`font-semibold transition-colors ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
                    {service.service.name}
                  </div>
                  <div className={`text-sm mt-1 transition-colors ${isSelected ? "text-blue-600/80" : "text-slate-500"}`}>
                    CPT: {service.service.cpt?.code || "N/A"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer — always stays visible */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
        <button
          onClick={() => setShowCompleteModal(false)}
          className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          Cancel
        </button>
        <button
          disabled={!selectedConsultationService || saving}
          onClick={() => {
            if (!selectedConsultationService) return;
            submit(selectedConsultationService.id);
          }}
          className="px-4 py-2 text-sm font-medium text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center justify-center min-w-[160px]"
        >
          {saving ? (
             <span className="flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin" />
               Saving...
             </span>
          ) : (
            "Complete Consultation"
          )}
        </button>
      </div>

    </div>
  </div>
)}
  </div>
  );
}
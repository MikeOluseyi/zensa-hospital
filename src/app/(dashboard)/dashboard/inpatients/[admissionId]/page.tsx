"use client";

import { useEffect, useState, use } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import InventorySearch from "@/components/inventory/InventorySearch";
import MedicationScheduleFields from "@/components/medications/MedicationScheduleFields";
import ServiceSearch from "@/components/search/ServiceSearch";
import VoiceInputButton from "@/components/common/VoiceInputButton";
import {
  Activity,
  Pill,
  Stethoscope,
  FileText,
  HeartPulse,
  UserRound,
  BedDouble,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Calendar,
  ArrowRightLeft,
  Plus,
  LogOut,
  FlaskConical,
  Loader2
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────

interface Note {
  id: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  createdAt: string;
  doctor: { firstName: string; lastName: string; specialization?: string };
}

interface Administration {
  id: string;
  scheduledAt?: string;
  status: "PENDING" | "GIVEN" | "MISSED" | "REFUSED";
  administeredAt?: string;
  administeredById?: { firstName: string; lastName: string };
  notes?: string;
}

interface Medication {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  orderType: "SCHEDULED" | "PRN";
  quantityLimit?: number;
  administrations: Administration[];
  doctor: { firstName: string; lastName: string };
}

interface Admission {
  visitId: string;
  id: string;
  reason: string;
  patient: { firstName: string; lastName: string; gender: string; dateOfBirth?: string };
  attendingDoctor?: { firstName: string; lastName: string };
  bed: { bedNumber: string; ward: { name: string } };
  status?: "ADMITTED" |"DISCHARGE_ORDERED"| "DISCHARGED" | "TRANSFERRED";
  admittedAt?: string;
  dischargeInstructions: string;
}

interface InventoryMedication {
  id: string;
  name: string;
  quantity: number;
  saleUnit?: string;
  baseUnit?: string;
  unitsPerSaleUnit?: number;
}

interface Vital {
  id: string;
  temperature?: number;
  pulse?: number;
  respiratoryRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  oxygenSaturation?: number;
  weight?: number;
  createdAt: string;
  nurse?: { firstName: string; lastName: string };
}

// ─── Components ─────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ADMITTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DISCHARGED: "bg-slate-100 text-slate-600 border-slate-200",
    TRANSFERRED: "bg-amber-50 text-amber-700 border-amber-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    GIVEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MISSED: "bg-red-50 text-red-700 border-red-200",
    REFUSED: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles[status] || styles.ADMITTED)}>
      {status}
    </span>
  );
}

function Card({ children, className, title, icon: Icon, action }: any) {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm", className)}>
      {(title || Icon) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon size={18} className="text-slate-500" />}
            <h3 className="font-semibold text-slate-900">{title}</h3>
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyState({ message, icon: Icon }: { message: string; icon?: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
      {Icon && <Icon size={32} className="mb-2 opacity-50" />}
      <p className="text-sm">{message}</p>
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: { label: string; href: string } }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {action && (
        <a href={action.href} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          {action.label}
          <ChevronRight size={14} />
        </a>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────

export default function InpatientChart({ params }: { params: Promise<{ admissionId: string }> }) {
  const { admissionId } = use(params);

  // State — SINGLE angle brackets only
  const [admission, setAdmission] = useState<Admission | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [nursingNotes, setNursingNotes] = useState<any[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [stagedAdmissionProcedures, setStagedAdmissionProcedures] = useState<any[]>([]);
  const [sendingAdmissionProcIndex, setSendingAdmissionProcIndex] = useState<number | null>(null);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const hasAttendingDoctor = !!admission?.attendingDoctor;

  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorTransfer, setDoctorTransfer] = useState({ doctorId: "", reason: "" });
  const [transferring, setTransferring] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [dischargeInstructions, setDischargeInstructions] = useState("");
  const [orderingDischarge, setOrderingDischarge] = useState(false);
  const [confirmingDischarge, setConfirmingDischarge] = useState(false);

  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  // Forms
  const [form, setForm] = useState({ subjective: "", objective: "", assessment: "", plan: "" });
  const [medForm, setMedForm] = useState({
    inventoryItemId: "", medicationName: "", dosage: "", frequency: "", duration: "", route: "ORAL",
    saleUnit: "", baseUnit: "", unitsPerSaleUnit: 0,
    orderType: "SCHEDULED" as "SCHEDULED" | "PRN",
    scheduledTimes: [""] as string[],
    quantityLimit: "",
  });
  const [nursingNote, setNursingNote] = useState("");
  const [vitalForm, setVitalForm] = useState({
    temperature: "", pulse: "", respiratoryRate: "", systolicBP: "", diastolicBP: "", oxygenSaturation: "", weight: "",
  });
  const [addingDoseFor, setAddingDoseFor] = useState<string | null>(null);
  const [newDoseTime, setNewDoseTime] = useState("");
  const [savingDose, setSavingDose] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchAdmission(), fetchDoctors(), fetchNotes(), fetchMedications(),
        fetchNursingNotes(), fetchVitals(), fetchTimeline(),
      ]);
      setLoading(false);
    };
    load();
  }, []);
  useEffect(() => {
  if (admission?.visitId) fetchProcedures();
}, [admission?.visitId]);

  async function fetchAdmission() {
    const res = await api.get(`/admissions/${admissionId}`);
    setAdmission(res.data);
  }
  async function fetchDoctors() {
    try { setDoctors((await api.get("/staff?role=DOCTOR")).data); } catch {}
  }
  async function fetchNotes() {
    const res = await api.get(`/admission-doctor-notes/${admissionId}`);
    setNotes(res.data);
  }
  async function fetchMedications() {
    const res = await api.get(`/admission-medications/${admissionId}`);
    setMedications(res.data);
  }
  async function fetchNursingNotes() {
    try { setNursingNotes((await api.get(`/nursing-notes/${admissionId}`)).data); } catch {}
  }
  async function fetchVitals() {
    try { setVitals((await api.get(`/vitals/admission/${admissionId}`)).data); } catch {}
  }
  async function fetchProcedures() {
  try {
    const res = await api.get(`/procedure/visit/${admission?.visitId}`);
    setProcedures(res.data);
  } catch (err) {
    console.error("Failed to fetch procedures:", err);
  }
}
  async function fetchTimeline() {
    try { setTimeline((await api.get(`/admission-timeline/${admissionId}`)).data); } catch {}
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/admission-doctor-notes", { admissionId, ...form });
    setForm({ subjective: "", objective: "", assessment: "", plan: "" });
    fetchNotes();
  }
  
  // AFTER
  async function prescribeMedication(e: React.FormEvent) {
    e.preventDefault();
    if (!medForm.inventoryItemId) {
      alert("Please search and select a medication first.");
      return;
    }
    if (medForm.orderType === "SCHEDULED" && medForm.scheduledTimes.filter(Boolean).length === 0) {
      alert("Please add at least one dose time, or switch to As-needed (PRN).");
      return;
    }
    await api.post("/admission-medications", {
      admissionId,
      inventoryItemId: medForm.inventoryItemId,
      medicationName: medForm.medicationName,
      dosage: medForm.dosage,
      frequency: medForm.frequency,
      duration: medForm.duration,
      route: medForm.route,
      orderType: medForm.orderType,
      quantityLimit: medForm.orderType === "PRN" ? Number(medForm.quantityLimit) || null : null,
      scheduledTimes: medForm.orderType === "SCHEDULED"
        ? medForm.scheduledTimes.filter(Boolean).map((t) => new Date(t).toISOString())
        : undefined,
    });
    setMedForm({
      inventoryItemId: "", medicationName: "", dosage: "", frequency: "", duration: "", route: "ORAL",
      saleUnit: "", baseUnit: "", unitsPerSaleUnit: 0,
      orderType: "SCHEDULED", scheduledTimes: [""], quantityLimit: "",
    });
    fetchMedications();
  }
  async function createNursingNote(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/nursing-notes", { admissionId, note: nursingNote });
    setNursingNote("");
    fetchNursingNotes();
  }
  async function recordVitals(e: React.FormEvent) {
    e.preventDefault();
    await api.post(`/vitals/admission/${admissionId}`, {
      temperature: Number(vitalForm.temperature), pulse: Number(vitalForm.pulse),
      respiratoryRate: Number(vitalForm.respiratoryRate), systolicBP: Number(vitalForm.systolicBP),
      diastolicBP: Number(vitalForm.diastolicBP), oxygenSaturation: Number(vitalForm.oxygenSaturation),
      weight: Number(vitalForm.weight),
    });
    setVitalForm({ temperature: "", pulse: "", respiratoryRate: "", systolicBP: "", diastolicBP: "", oxygenSaturation: "", weight: "" });
    fetchVitals();
  }
  // Replace updateMedicationStatus with a dose-level call
async function administerDose(orderId: string, administrationId: string | null, status: string) {
  await api.post(`/admission-medications/${orderId}/administer`, { administrationId, status });
  fetchMedications();
}
async function addDoseTime(orderId: string) {
  if (!newDoseTime) return;
  setSavingDose(true);
  try {
    await api.post(`/admission-medications/${orderId}/schedule`, {
      scheduledAt: new Date(newDoseTime).toISOString(),
    });
    setAddingDoseFor(null);
    setNewDoseTime("");
    fetchMedications();
  } catch (err: any) {
    alert(err.response?.data?.error || "Failed to add dose time.");
  } finally {
    setSavingDose(false);
  }
}
  // Stage instead of order immediately
function stageProcedure(service: { hospitalServiceId: string; serviceId: string; name: string; code: string; description: string }) {
  const alreadyStaged = stagedAdmissionProcedures.some((p) => p.hospitalServiceId === service.hospitalServiceId);
  const alreadyOrdered = procedures.some((p: any) => p.medicalRecordService?.hospitalService?.hospitalServiceId === service.hospitalServiceId);

  if (alreadyStaged || alreadyOrdered) {
    alert("Already added");
    return;
  }

  setStagedAdmissionProcedures([...stagedAdmissionProcedures, { ...service, notes: "" }]);
}

function updateStagedProcedureNotes(index: number, notes: string) {
  const updated = [...stagedAdmissionProcedures];
  updated[index] = { ...updated[index], notes };
  setStagedAdmissionProcedures(updated);
}

function removeStagedProcedure(index: number) {
  setStagedAdmissionProcedures(stagedAdmissionProcedures.filter((_, i) => i !== index));
}

async function sendAdmissionProcedureToLab(index: number) {
  if (!admission) return;
  const staged = stagedAdmissionProcedures[index];
  setSendingAdmissionProcIndex(index);
  try {
    await api.post("/procedure/admission", {
      admissionId: admission.id,
      hospitalServiceId: staged.hospitalServiceId,
      notes: staged.notes,
    });
    setStagedAdmissionProcedures(stagedAdmissionProcedures.filter((_, i) => i !== index));
    fetchProcedures();
  } catch (err: any) {
    alert(err.response?.data?.error || "Failed to order procedure.");
  } finally {
    setSendingAdmissionProcIndex(null);
  }
}
  async function changeDoctor(e: React.FormEvent) {
    e.preventDefault();
    setTransferring(true);
    await api.patch(`/admissions/${admission?.id}/change-doctor`, doctorTransfer);
    setShowDoctorModal(false);
    setDoctorTransfer({ doctorId: "", reason: "" });
    fetchAdmission();
    setTransferring(false);
  }

  async function orderDischarge(e: React.FormEvent) {
  e.preventDefault();
  setOrderingDischarge(true);
  try {
    await api.patch(`/admissions/${admission?.id}/order-discharge`, {
      instructions: dischargeInstructions,
    });
    setShowDischargeModal(false);
    setDischargeInstructions("");
    fetchAdmission();
  } catch (err: any) {
    alert(err.response?.data?.error || "Failed to order discharge.");
  } finally {
    setOrderingDischarge(false);
  }
}

async function confirmDischarge() {
  setConfirmingDischarge(true);
  try {
    await api.patch(`/admissions/${admission?.id}/confirm-discharge`);
    fetchAdmission();
  } catch (err: any) {
    alert(err.response?.data?.error || "Failed to confirm discharge.");
  } finally {
    setConfirmingDischarge(false);
  }
}

  if (!hydrated) return null;

  const latestVitals = vitals[0];
  const pendingMeds = medications.reduce(
    (count, m) => count + m.administrations.filter((a) => a.status === "PENDING").length,
    0
);

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      {admission && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white text-xl font-bold border border-white/20">
                  {admission.patient.firstName[0]}{admission.patient.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-white">
                      {admission.patient.firstName} {admission.patient.lastName}
                    </h1>
                    <StatusBadge status={admission.status || "ADMITTED"} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <BedDouble size={14} />
                      {admission.bed.ward.name} · Bed {admission.bed.bedNumber}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      Admitted {admission.admittedAt ? new Date(admission.admittedAt).toLocaleDateString() : "Recently"}
                    </span>
                    <span>·</span>
                    <span className="capitalize">{admission.patient.gender}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Attending Doctor</p>
                <p className="text-white font-medium">
                  {admission.attendingDoctor
                    ? `Dr. ${admission.attendingDoctor.firstName} ${admission.attendingDoctor.lastName}`
                    : "Unassigned"}
                </p>
                {(user?.role === "DOCTOR" || (!hasAttendingDoctor && (user?.role === "NURSE" || user?.role === "ADMIN"))) && (
                  <button
                    onClick={() => setShowDoctorModal(true)}
                    className="mt-2 text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1 ml-auto transition-colors"
                  >
                    <ArrowRightLeft size={12} />
                    {hasAttendingDoctor ? "Transfer Care" : "Assign Doctor"}
                  </button>
                )}
                {user?.role === "DOCTOR" && admission.status === "ADMITTED" && (
                    <button
                      onClick={() => setShowDischargeModal(true)}
                      className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
                    >
                      <LogOut size={12} />
                      Order Discharge
                    </button>
                  )}
                  {user?.role === "NURSE" && admission.status === "DISCHARGE_ORDERED" && (
                    <button
                      onClick={confirmDischarge}
                      disabled={confirmingDischarge}
                      className="text-xs text-emerald-300 hover:text-emerald-200 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={12} />
                      {confirmingDischarge ? "Confirming..." : "Confirm Discharge"}
                    </button>
                  )}
              </div>
            </div>
          </div>
          
{admission.status === "DISCHARGE_ORDERED" && admission.dischargeInstructions && (
  <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
    <p className="text-xs font-medium text-amber-800">Discharge ordered — instructions</p>
    <p className="text-sm text-amber-900 mt-0.5">{admission.dischargeInstructions}</p>
  </div>
)}

<div className="grid grid-cols-4 divide-x divide-slate-100 border-t border-slate-100">
  <div className="px-5 py-3">
    <p className="text-xs text-slate-500 mb-1">Latest Vitals</p>
              <p className="text-sm font-semibold text-slate-900">
                {latestVitals ? `${latestVitals.temperature}°C · ${latestVitals.pulse}bpm` : "No data"}
              </p>
            </div>
            <div className="px-5 py-3">
              <p className="text-xs text-slate-500 mb-1">Pending Medications</p>
              <p className="text-sm font-semibold text-slate-900">
                {pendingMeds > 0 ? (
                  <span className="text-amber-600">{pendingMeds} pending</span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> All caught up
                  </span>
                )}
              </p>
            </div>
            <div className="px-5 py-3">
              <p className="text-xs text-slate-500 mb-1">Total Reviews</p>
              <p className="text-sm font-semibold text-slate-900">{notes.length} doctor notes</p>
            </div>
            <div className="px-5 py-3">
              <p className="text-xs text-slate-500 mb-1">Nursing Notes</p>
              <p className="text-sm font-semibold text-slate-900">{nursingNotes.length} entries</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg w-fit">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "timeline", label: "Timeline", icon: Clock },
          { id: "vitals", label: "Vitals", icon: HeartPulse },
          ...(hasAttendingDoctor ? [
            { id: "medications", label: "Medications", icon: Pill },
            { id: "labs", label: "Lab & Procedures", icon: FlaskConical },
          ] : []),
          { id: "notes", label: "Clinical Notes", icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card title="Recent Activity" icon={Clock}>
              {timeline.length === 0 ? (
                <EmptyState message="No events recorded yet" icon={Clock} />
              ) : (
                <div className="space-y-4">
                  {timeline.slice(0, 5).map((event) => (
                    <div key={`${event.type}-${event.data.id}`} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                          event.type === "DOCTOR_NOTE" && "bg-blue-50 text-blue-600",
                          event.type === "NURSING_NOTE" && "bg-green-50 text-green-600",
                          event.type === "VITALS" && "bg-rose-50 text-rose-600",
                          event.type === "LAB_TESTS" && "bg-amber-300 text-amber-300",
                          event.type === "MEDICATION" && "bg-amber-50 text-amber-600",
                          event.type === "DOCTOR_TRANSFER" && "bg-purple-50 text-purple-600",
                        )}>
                          {event.type === "DOCTOR_NOTE" && <Stethoscope size={14} />}
                          {event.type === "NURSING_NOTE" && <FileText size={14} />}
                          {event.type === "VITALS" && <HeartPulse size={14} />}
                          {event.type === "LAB_TESTS" && <FlaskConical size={14} />}
                          {event.type === "MEDICATION" && <Pill size={14} />}
                          {event.type === "DOCTOR_TRANSFER" && <ArrowRightLeft size={14} />}
                        </div>
                        <div className="w-px h-full bg-slate-200 mt-2" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {event.type === "DOCTOR_NOTE" && "Doctor Review"}
                            {event.type === "NURSING_NOTE" && "Nursing Note"}
                            {event.type === "VITALS" && "Vital Signs Recorded"}
                            {event.type === "LAB_TESTS" && "Lab and Results"}
                            {event.type === "MEDICATION" && "Medication Update"}
                            {event.type === "DOCTOR_TRANSFER" && "Doctor Handover"}
                          </p>
                          <span className="text-xs text-slate-400">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {event.type === "DOCTOR_NOTE" && (
                            <>Dr. {event.data.doctor.firstName} {event.data.doctor.lastName} — {event.data.assessment}</>
                          )}
                          {event.type === "NURSING_NOTE" && event.data.note}
                          {event.type === "VITALS" && (
                            <>Temp: {event.data.temperature}°C · BP: {event.data.systolicBP}/{event.data.diastolicBP}</>
                          )}
                          {event.type === "MEDICATION" && (
                            <>{event.data.medicationName} — <StatusBadge status={event.data.status} /></>
                          )}
                          {event.type === "DOCTOR_TRANSFER" && (
                            <>Dr. {event.data.fromDoctor.lastName} → Dr. {event.data.toDoctor.lastName}</>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Latest Vitals" icon={HeartPulse}>
              {!latestVitals ? (
                <EmptyState message="No vitals recorded" icon={HeartPulse} />
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Temperature", value: latestVitals.temperature, unit: "°C", icon: Activity, color: "text-rose-600", bg: "bg-rose-50" },
                    { label: "Pulse", value: latestVitals.pulse, unit: "bpm", icon: HeartPulse, color: "text-red-600", bg: "bg-red-50" },
                    { label: "Blood Pressure", value: `${latestVitals.systolicBP}/${latestVitals.diastolicBP}`, unit: "mmHg", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Respiratory", value: latestVitals.respiratoryRate, unit: "rpm", icon: Activity, color: "text-cyan-600", bg: "bg-cyan-50" },
                    { label: "SpO₂", value: latestVitals.oxygenSaturation, unit: "%", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Weight", value: latestVitals.weight, unit: "kg", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
                  ].map((vital) => (
                    <div key={vital.label} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", vital.bg)}>
                        <vital.icon size={18} className={vital.color} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{vital.label}</p>
                        <p className="text-lg font-bold text-slate-900">
                          {vital.value || "-"} <span className="text-xs font-normal text-slate-400">{vital.unit}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            {user?.role === "DOCTOR" && (
              <Card title="Quick Actions" icon={Plus}>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab("notes")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Stethoscope size={16} />
                    Add Doctor Review
                    <ChevronRight size={14} className="ml-auto" />
                  </button>
                  <button
                    onClick={() => setActiveTab("medications")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-sm font-medium"
                  >
                    <Pill size={16} />
                    Prescribe Medication
                    <ChevronRight size={14} className="ml-auto" />
                  </button>
                </div>
              </Card>
            )}

            {user?.role === "NURSE" && (
              <Card title="Quick Actions" icon={Plus}>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab("vitals")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors text-sm font-medium"
                  >
                    <HeartPulse size={16} />
                    Record Vitals
                    <ChevronRight size={14} className="ml-auto" />
                  </button>
                  <button
                    onClick={() => setActiveTab("notes")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <FileText size={16} />
                    Add Nursing Note
                    <ChevronRight size={14} className="ml-auto" />
                  </button>
                </div>
              </Card>
            )}

            <Card title="Medication Status" icon={Pill}>
              {medications.length === 0 ? (
                <EmptyState message="No medications prescribed" icon={Pill} />
              ) : (
                <div className="space-y-3">
                 
                  {medications.slice(0, 4).map((med) => {
                    const hasPending = med.administrations.some((a) => a.status === "PENDING");
                    const summaryStatus = hasPending ? "PENDING" : (med.administrations[0]?.status ?? "PENDING");
                    return (
                      <div key={med.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{med.medicationName}</p>
                          <p className="text-xs text-slate-500">{med.dosage} · {med.frequency}</p>
                        </div>
                        <StatusBadge status={summaryStatus} />
                      </div>
                    );
                  })}
                  {medications.length > 4 && (
                    <button onClick={() => setActiveTab("medications")} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View all {medications.length} medications →
                    </button>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === "timeline" && (
        <Card title="Admission Timeline" icon={Clock}>
          {timeline.length === 0 ? (
            <EmptyState message="No events recorded yet" icon={Clock} />
          ) : (
            <div className="space-y-6">
              {timeline.map((event) => (
                <div key={`${event.type}-${event.data.id}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      event.type === "DOCTOR_NOTE" && "bg-blue-100 text-blue-600",
                      event.type === "NURSING_NOTE" && "bg-green-100 text-green-600",
                      event.type === "VITALS" && "bg-rose-100 text-rose-600",
                      event.type === "MEDICATION" && "bg-amber-100 text-amber-600",
                      event.type === "TRANSFER" && "bg-purple-100 text-purple-600",
                      event.type === "DOCTOR_TRANSFER" && "bg-indigo-100 text-indigo-600",
                    )}>
                      {event.type === "DOCTOR_NOTE" && <Stethoscope size={18} />}
                      {event.type === "NURSING_NOTE" && <FileText size={18} />}
                      {event.type === "VITALS" && <HeartPulse size={18} />}
                      {event.type === "MEDICATION" && <Pill size={18} />}
                      {event.type === "TRANSFER" && <BedDouble size={18} />}
                      {event.type === "DOCTOR_TRANSFER" && <ArrowRightLeft size={18} />}
                    </div>
                    <div className="w-px flex-1 bg-slate-200 mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">
                        {event.type === "DOCTOR_NOTE" && "Doctor Review"}
                        {event.type === "NURSING_NOTE" && "Nursing Note"}
                        {event.type === "VITALS" && "Vital Signs"}
                        {event.type === "MEDICATION" && "Medication"}
                        {event.type === "TRANSFER" && "Bed Transfer"}
                        {event.type === "DOCTOR_TRANSFER" && "Doctor Handover"}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700">
                      {event.type === "DOCTOR_NOTE" && (
                        <div className="space-y-2">
                          <p className="font-medium text-slate-900">Dr. {event.data.doctor.firstName} {event.data.doctor.lastName}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <p><span className="text-slate-500">Subjective:</span> {event.data.subjective}</p>
                            <p><span className="text-slate-500">Objective:</span> {event.data.objective}</p>
                            <p><span className="text-slate-500">Assessment:</span> {event.data.assessment}</p>
                            <p><span className="text-slate-500">Plan:</span> {event.data.plan}</p>
                          </div>
                        </div>
                      )}
                      {event.type === "NURSING_NOTE" && (
                        <div>
                          <p className="font-medium text-slate-900 mb-1">Nurse {event.data.nurse.firstName} {event.data.nurse.lastName}</p>
                          <p>{event.data.note}</p>
                        </div>
                      )}
                      {event.type === "VITALS" && (
                        <div className="grid grid-cols-3 gap-4">
                          <p>Temp: <strong>{event.data.temperature}°C</strong></p>
                          <p>Pulse: <strong>{event.data.pulse} bpm</strong></p>
                          <p>BP: <strong>{event.data.systolicBP}/{event.data.diastolicBP}</strong></p>
                          <p>Resp: <strong>{event.data.respiratoryRate}</strong></p>
                          <p>SpO₂: <strong>{event.data.oxygenSaturation}%</strong></p>
                          <p>Weight: <strong>{event.data.weight}kg</strong></p>
                        </div>
                      )}
                      {event.type === "MEDICATION" && (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{event.data.medicationName}</p>
                            <p className="text-slate-500">{event.data.dosage} · {event.data.frequency}</p>
                          </div>
                          <StatusBadge status={event.data.status} />
                        </div>
                      )}
                      {event.type === "TRANSFER" && (
                        <p>Moved from <strong>Bed {event.data.fromBed.bedNumber}</strong> to <strong>Bed {event.data.toBed.bedNumber}</strong></p>
                      )}
                      {event.type === "DOCTOR_TRANSFER" && (
                        <div>
                          <p>Dr. {event.data.fromDoctor.firstName} {event.data.fromDoctor.lastName} → Dr. {event.data.toDoctor.firstName} {event.data.toDoctor.lastName}</p>
                          <p className="text-slate-500 mt-1">Reason: {event.data.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* VITALS TAB */}
      {activeTab === "vitals" && (
        <div className="space-y-6">
          {user?.role === "NURSE" && (
            <Card title="Record New Vitals" icon={Plus} className="border-blue-200 bg-blue-50/30">
              <form onSubmit={recordVitals} className="grid grid-cols-4 gap-3">
                {[
                  { key: "temperature", placeholder: "Temperature (°C)" },
                  { key: "pulse", placeholder: "Pulse (bpm)" },
                  { key: "respiratoryRate", placeholder: "Respiratory Rate" },
                  { key: "systolicBP", placeholder: "Systolic BP" },
                  { key: "diastolicBP", placeholder: "Diastolic BP" },
                  { key: "oxygenSaturation", placeholder: "Oxygen Saturation (%)" },
                  { key: "weight", placeholder: "Weight (kg)" },
                ].map((field) => (
                  <input
                    key={field.key}
                    placeholder={field.placeholder}
                    value={vitalForm[field.key as keyof typeof vitalForm]}
                    onChange={(e) => setVitalForm({ ...vitalForm, [field.key]: e.target.value })}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    type="number"
                    step="0.1"
                  />
                ))}
                <div className="col-span-4 flex justify-end">
                  <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Record Vitals
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card title="Vitals History" icon={TrendingUp}>
            {vitals.length === 0 ? (
              <EmptyState message="No vitals recorded" icon={HeartPulse} />
            ) : (
              <div className="space-y-3">
                {vitals.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <HeartPulse size={20} />
                    </div>
                    <div className="flex-1 grid grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Temp</p>
                        <p className="font-semibold">{v.temperature ?? "-"}°C</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Pulse</p>
                        <p className="font-semibold">{v.pulse ?? "-"} bpm</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">BP</p>
                        <p className="font-semibold">{v.systolicBP}/{v.diastolicBP}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Resp</p>
                        <p className="font-semibold">{v.respiratoryRate ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">SpO₂</p>
                        <p className="font-semibold">{v.oxygenSaturation ?? "-"}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Weight</p>
                        <p className="font-semibold">{v.weight ?? "-"} kg</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>{v.nurse?.firstName} {v.nurse?.lastName}</p>
                      <p>{new Date(v.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "labs" && (
  <div className="space-y-6">
    {user?.role === "DOCTOR" && (
      <Card title="Order Lab / Procedure" icon={FlaskConical} className="border-violet-200 bg-violet-50/30">
        <ServiceSearch category="SPECIALIST" onSelect={stageProcedure} />

        {stagedAdmissionProcedures.length > 0 && (
          <div className="space-y-3 mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Not yet sent — review before ordering
            </p>
            {stagedAdmissionProcedures.map((staged, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-violet-200 border-dashed">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{staged.name}</span>
                  <span className="font-mono text-xs bg-slate-100 border rounded px-1.5 py-0.5">{staged.code}</span>
                </div>
                <textarea
                  placeholder="Notes (optional)..."
                  value={staged.notes}
                  onChange={(e) => updateStagedProcedureNotes(index, e.target.value)}
                  className="mt-2 w-full border border-violet-200 rounded-lg px-3 py-2 text-sm resize-none"
                  rows={2}
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => sendAdmissionProcedureToLab(index)}
                    disabled={sendingAdmissionProcIndex === index}
                    className="flex items-center gap-1.5 bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-700 disabled:opacity-50"
                  >
                    {sendingAdmissionProcIndex === index ? <Loader2 size={12} className="animate-spin" /> : null}
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
            ))}
          </div>
        )}
      </Card>
    )}
    <Card title="Procedures & Results" icon={FlaskConical}>
      {procedures.length === 0 ? (
        <EmptyState message="No procedures ordered" icon={FlaskConical} />
      ) : (
        <div className="space-y-3">
          {procedures.map((p: any) => (
            <div key={p.id} className="p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {p.medicalRecordService?.hospitalService?.service?.name}
                  </p>
                  {p.notes && <p className="text-sm text-slate-500 mt-0.5">{p.notes}</p>}
                </div>
                <StatusBadge status={p.status} />
              </div>
              {p.labResult?.data && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {Object.entries(p.labResult.data).map(([key, val]: any) => (
                    <div key={key} className="bg-slate-50 rounded-lg border border-slate-100 p-2">
                      <p className="text-[10px] text-slate-400 uppercase">{key.replace(/_/g, " ")}</p>
                      <p className="text-sm font-semibold text-slate-800">{String(val)}</p>
                    </div>
                  ))}
                </div>
              )}
              {p.procedureResult?.results && !p.labResult && (
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-2 mt-3">{p.procedureResult.results}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  </div>
)}

      {/* MEDICATIONS TAB */}
      {activeTab === "medications" && (
        <div className="space-y-6">
          {user?.role === "DOCTOR" && (
            <Card title="Prescribe Medication" icon={Plus} className="border-amber-200 bg-amber-50/30">
              <form onSubmit={prescribeMedication} className="grid grid-cols-2 gap-3">
              
                <div className="col-span-2">
                  <InventorySearch
                    filterType="MEDICATION"
                    placeholder="Search medication..."
                    onSelect={(item: InventoryMedication) => {
                      setMedForm({
                        ...medForm,
                        inventoryItemId: item.id,
                        medicationName: item.name,
                        saleUnit: item.saleUnit || "",
                        baseUnit: item.baseUnit || "",
                        unitsPerSaleUnit: item.unitsPerSaleUnit || 0,
                      });
                    }}
                  />
                  {medForm.medicationName && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-amber-200 text-sm">
                      <Pill size={14} className="text-amber-600 shrink-0" />
                      <span className="font-medium text-slate-900">{medForm.medicationName}</span>
                      {medForm.saleUnit && (
                        <span className="text-slate-500">
                          — each {medForm.saleUnit} contains {medForm.unitsPerSaleUnit} {medForm.baseUnit}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <input placeholder="Dosage" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={medForm.dosage} onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })} />
                <input placeholder="Frequency" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={medForm.frequency} onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })} />
                <input placeholder="Duration" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={medForm.duration} onChange={(e) => setMedForm({ ...medForm, duration: e.target.value })} />
                <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={medForm.route} onChange={(e) => setMedForm({ ...medForm, route: e.target.value })}>
                  <option value="ORAL">Oral</option>
                  <option value="IV">IV</option>
                  <option value="IM">IM</option>
                  <option value="SUBCUTANEOUS">Subcutaneous</option>
                  <option value="TOPICAL">Topical</option>
                  <option value="INHALATION">Inhalation</option>
                </select>
                <MedicationScheduleFields
                  orderType={medForm.orderType}
                  scheduledTimes={medForm.scheduledTimes}
                  quantityLimit={medForm.quantityLimit}
                  onOrderTypeChange={(orderType) => setMedForm({ ...medForm, orderType })}
                  onScheduledTimesChange={(scheduledTimes) => setMedForm({ ...medForm, scheduledTimes })}
                  onQuantityLimitChange={(quantityLimit) => setMedForm({ ...medForm, quantityLimit })}
                />
                <div className="col-span-2 flex justify-end">
                  <button type="submit" className="bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                    Prescribe
                  </button>
                </div>
              </form>
            </Card>
          )}

<Card title="Medication Chart" icon={Pill}>
  {medications.length === 0 ? (
    <EmptyState message="No medications prescribed" icon={Pill} />
  ) : (
    <div className="space-y-4">
      {medications.map((med) => {
        const givenCount = med.administrations.filter((a) => a.status === "GIVEN").length;
        return (
          <div key={med.id} className="p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-900">{med.medicationName}</p>
                <p className="text-sm text-slate-500">{med.dosage} · {med.route}</p>
                <p className="text-xs text-slate-400">Dr. {med.doctor.firstName} {med.doctor.lastName}</p>
              </div>
              {med.orderType === "PRN" && (
                <span className="text-xs font-medium text-slate-500">
                  {givenCount}{med.quantityLimit ? ` / ${med.quantityLimit}` : ""} given
                </span>
              )}
            </div>

            <div className="space-y-2 mt-3">
              {med.administrations.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">
                    {a.scheduledAt
                      ? new Date(a.scheduledAt).toLocaleString()
                      : a.administeredAt
                      ? new Date(a.administeredAt).toLocaleString()
                      : "As-needed"}
                  </span>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={a.status} />
                    {user?.role === "NURSE" && a.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button onClick={() => administerDose(med.id, a.id, "GIVEN")} className="px-2.5 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">Given</button>
                        <button onClick={() => administerDose(med.id, a.id, "MISSED")} className="px-2.5 py-1 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600">Missed</button>
                        <button onClick={() => administerDose(med.id, a.id, "REFUSED")} className="px-2.5 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600">Refused</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {med.orderType === "SCHEDULED" && med.administrations.length === 0 && user?.role === "DOCTOR" && (
  addingDoseFor === med.id ? (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="datetime-local"
        value={newDoseTime}
        onChange={(e) => setNewDoseTime(e.target.value)}
        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
      />
      <button
        onClick={() => addDoseTime(med.id)}
        disabled={savingDose || !newDoseTime}
        className="px-3 py-2 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-700 disabled:opacity-50"
      >
        Add
      </button>
      <button
        onClick={() => { setAddingDoseFor(null); setNewDoseTime(""); }}
        className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700"
      >
        Cancel
      </button>
    </div>
  ) : (
    <button
      onClick={() => setAddingDoseFor(med.id)}
      className="w-full text-sm text-violet-600 hover:text-violet-700 font-medium py-2 border border-dashed border-violet-200 rounded-lg mt-2"
    >
      + Add dose time (this order has none)
    </button>
  )
)}

              {med.orderType === "PRN" && user?.role === "NURSE" && (!med.quantityLimit || givenCount < med.quantityLimit) && (
                <button
                  onClick={() => administerDose(med.id, null, "GIVEN")}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-dashed border-blue-200 rounded-lg"
                >
                  + Record a dose now
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}
</Card>
        </div>
      )}

      {/* CLINICAL NOTES TAB */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          
          {!hasAttendingDoctor && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              No attending doctor assigned yet. Nursing notes and vitals can still be recorded — medications, lab orders, and doctor reviews will be available once a doctor is assigned.
            </div>
          )}

          {user?.role === "DOCTOR" && hasAttendingDoctor && (
            <Card title="New Doctor Review (SOAP)" icon={Stethoscope} className="border-blue-200 bg-blue-50/30">
              <form onSubmit={addNote} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-medium text-slate-500">Subjective</span>
      <VoiceInputButton
        onTranscript={(text) =>
          setForm((prev) => ({
            ...prev,
            subjective: prev.subjective ? `${prev.subjective} ${text}` : text,
          }))
        }
      />
    </div>
    <textarea
      placeholder="Subjective"
      rows={3}
      className="border border-slate-300 rounded-lg p-3 text-sm resize-none w-full"
      value={form.subjective}
      onChange={(e) => setForm({ ...form, subjective: e.target.value })}
    />
  </div>

  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-medium text-slate-500">Objective</span>
      <VoiceInputButton
        onTranscript={(text) =>
          setForm((prev) => ({
            ...prev,
            objective: prev.objective ? `${prev.objective} ${text}` : text,
          }))
        }
      />
    </div>
    <textarea
      placeholder="Objective"
      rows={3}
      className="border border-slate-300 rounded-lg p-3 text-sm resize-none w-full"
      value={form.objective}
      onChange={(e) => setForm({ ...form, objective: e.target.value })}
    />
  </div>

  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-medium text-slate-500">Assessment</span>
      <VoiceInputButton
        onTranscript={(text) =>
          setForm((prev) => ({
            ...prev,
            assessment: prev.assessment ? `${prev.assessment} ${text}` : text,
          }))
        }
      />
    </div>
    <textarea
      placeholder="Assessment"
      rows={3}
      className="border border-slate-300 rounded-lg p-3 text-sm resize-none w-full"
      value={form.assessment}
      onChange={(e) => setForm({ ...form, assessment: e.target.value })}
    />
  </div>

  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-medium text-slate-500">Plan</span>
      <VoiceInputButton
        onTranscript={(text) =>
          setForm((prev) => ({
            ...prev,
            plan: prev.plan ? `${prev.plan} ${text}` : text,
          }))
        }
      />
    </div>
    <textarea
      placeholder="Plan"
      rows={3}
      className="border border-slate-300 rounded-lg p-3 text-sm resize-none w-full"
      value={form.plan}
      onChange={(e) => setForm({ ...form, plan: e.target.value })}
    />
  </div>
</div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Save Review
                  </button>
                </div>
              </form>
            </Card>
          )}

          {user?.role === "NURSE" && (
            <Card title="New Nursing Note" icon={FileText} className="border-green-200 bg-green-50/30">
              <form onSubmit={createNursingNote} className="space-y-3">
  <div className="flex items-center justify-between mb-1">
    <span className="text-xs font-medium text-slate-500">Observation</span>
    <VoiceInputButton
      onTranscript={(text) =>
        setNursingNote((prev) => (prev ? `${prev} ${text}` : text))
      }
    />
  </div>
                <textarea
                  value={nursingNote}
                  onChange={(e) => setNursingNote(e.target.value)}
                  placeholder="Enter nursing observation..."
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm min-h-[100px] resize-none"
                  required
                />
                <div className="flex justify-end">
                  <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    Save Note
                  </button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-6">
            <Card title="Doctor Reviews" icon={Stethoscope}>
              {notes.length === 0 ? (
                <EmptyState message="No doctor reviews yet" icon={Stethoscope} />
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {note.doctor.firstName[0]}{note.doctor.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Dr. {note.doctor.firstName} {note.doctor.lastName}</p>
                            <p className="text-xs text-slate-500">{note.doctor.specialization}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-2 bg-white rounded border border-slate-100">
                          <p className="text-xs font-semibold text-blue-600 mb-1">SUBJECTIVE</p>
                          <p className="text-slate-700">{note.subjective || "-"}</p>
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-100">
                          <p className="text-xs font-semibold text-blue-600 mb-1">OBJECTIVE</p>
                          <p className="text-slate-700">{note.objective || "-"}</p>
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-100">
                          <p className="text-xs font-semibold text-amber-600 mb-1">ASSESSMENT</p>
                          <p className="text-slate-700">{note.assessment || "-"}</p>
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-100">
                          <p className="text-xs font-semibold text-emerald-600 mb-1">PLAN</p>
                          <p className="text-slate-700">{note.plan || "-"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Nursing Notes" icon={FileText}>
              {nursingNotes.length === 0 ? (
                <EmptyState message="No nursing notes recorded" icon={FileText} />
              ) : (
                <div className="space-y-3">
                  {nursingNotes.map((note) => (
                    <div key={note.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-sm text-slate-700 mb-2">{note.note}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                          {note.nurse?.firstName[0]}
                        </div>
                        <span>{note.nurse?.firstName} {note.nurse?.lastName}</span>
                        <span>·</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Doctor Transfer Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Transfer Patient Care</h2>
            <form onSubmit={changeDoctor} className="space-y-4">
              <select
                value={doctorTransfer.doctorId}
                onChange={(e) => setDoctorTransfer({ ...doctorTransfer, doctorId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select New Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>Dr. {doctor.firstName} {doctor.lastName}</option>
                ))}
              </select>
              <textarea
                placeholder="Reason for handover (optional)"
                value={doctorTransfer.reason}
                onChange={(e) => setDoctorTransfer({ ...doctorTransfer, reason: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowDoctorModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {transferring ? "Transferring..." : "Confirm Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDischargeModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Order Discharge</h2>
      <form onSubmit={orderDischarge} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Instructions for nursing staff <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            autoFocus
            value={dischargeInstructions}
            onChange={(e) => setDischargeInstructions(e.target.value)}
            placeholder="e.g. Monitor for 3 hours — if vitals stable, discharge."
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm min-h-25 resize-none focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={() => setShowDischargeModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={orderingDischarge}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {orderingDischarge ? "Ordering..." : "Order Discharge"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}
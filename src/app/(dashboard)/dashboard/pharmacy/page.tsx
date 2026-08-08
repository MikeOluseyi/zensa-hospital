"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import {
  Pill,
  Loader2,
  AlertCircle,
  PackageCheck,
  User,
  Clock,
  Printer,
  BedDouble,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useHospitalInfo } from "@/hooks/useHospitalInfo";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
}

interface MedicalRecord {
  patient: Patient;
}

interface AdmissionOrder {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  createdAt: string;
  doctor: { firstName: string; lastName: string };
  inventoryItem?: { id: string; name: string; quantity: number; sellingPrice: number | null } | null;
  admission: {
    patient: { firstName: string; lastName: string; patientNumber: string };
    bed: { bedNumber: string; ward: { name: string } };
  };
}

interface Prescription {
  id: string;
  prescribedBy?: { firstName: string; lastName: string } | null;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  saleUnit: string;
  status: "PENDING" | "DISPENSED";
  instructions: string;
  medicalRecord: MedicalRecord;
  createdAt: string;
}

export default function PharmacyPage() {
  const user = useAuthStore((s) => s.user);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [admissionOrders, setAdmissionOrders] = useState<AdmissionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const { hospital } = useHospitalInfo();

  async function loadPrescriptions() {
    try {
      setLoading(true);
      const [presRes, admRes] = await Promise.all([
        api.get("/pharmacy/pending"),
        api.get("/admission-medications/pending-verification"),
      ]);
      setPrescriptions(presRes.data);
      setAdmissionOrders(admRes.data);
    } catch {
      alert("Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrescriptions();
  }, []);

  async function verifyOrder(orderId: string) {
    try {
      await api.patch(`/admission-medications/${orderId}/verify`);
      loadPrescriptions();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to verify order.");
    }
  }

  async function rejectOrder(orderId: string) {
    const reason = prompt("Reason for rejecting this order:");
    if (!reason) return;
    setRejectingId(orderId);
    try {
      await api.patch(`/admission-medications/${orderId}/reject`, { rejectionReason: reason });
      loadPrescriptions();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to reject order.");
    } finally {
      setRejectingId(null);
    }
  }

  async function dispense(id: string) {
    try {
      await api.patch(`/pharmacy/dispense/${id}`);
      loadPrescriptions();
    } catch {
      alert("Failed to dispense. Please try again.");
    }
  }

  function handlePrint(item: Prescription) {
    setPrintingId(item.id);
    setTimeout(() => {
      if (printRef.current) {
        const printWindow = window.open("", "_blank", "width=300,height=400");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Prescription Label</title>
                <style>
                  @media print {
                    body { margin: 0; padding: 0; }
                  }
                  body {
                    font-family: monospace;
                    font-size: 12px;
                    line-height: 1.4;
                    padding: 8px;
                    width: 58mm;
                  }
                  .header {
                    text-align: center;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 4px;
                    margin-bottom: 8px;
                  }
                  .header h2 {
                    font-size: 14px;
                    margin: 0;
                  }
                  .header p {
                    font-size: 10px;
                    margin: 2px 0 0;
                    color: #666;
                  }
                  .section {
                    margin-bottom: 6px;
                  }
                  .label {
                    font-weight: bold;
                    font-size: 10px;
                    text-transform: uppercase;
                    color: #666;
                  }
                  .value {
                    font-size: 12px;
                  }
                  .barcode {
                    text-align: center;
                    font-family: "Libre Barcode 39", monospace;
                    font-size: 24px;
                    margin: 8px 0;
                    letter-spacing: 2px;
                  }
                  .footer {
                    border-top: 1px dashed #000;
                    padding-top: 4px;
                    margin-top: 8px;
                    font-size: 9px;
                    text-align: center;
                    color: #666;
                  }
                </style>
              </head>
              <body>
                <div class="header">
  <h2>${hospital?.name ?? "Zensa Health"}</h2>
  ${hospital?.phone ? `<p>${hospital.phone}</p>` : ""}
  <p>Prescription Label</p>
</div>
                <div class="section">
                  <div class="label">Patient</div>
                  <div class="value">${item.medicalRecord?.patient?.firstName || ""} ${item.medicalRecord?.patient?.lastName || ""}</div>
                  <div class="value" style="font-size:10px;color:#666;">ID: ${item.medicalRecord?.patient?.patientNumber || "N/A"}</div>
                </div>
                <div class="section">
                  <div class="label">Medication</div>
                  <div class="value" style="font-size:14px;font-weight:bold;">${item.medication}</div>
                </div>
                <div class="section">
                  <div class="label">Dosage</div>
                  <div class="value">${item.dosage}</div>
                </div>
                <div class="section">
                  <div class="label">Frequency</div>
                  <div class="value">${item.frequency}</div>
                </div>
                <div class="section">
                  <div class="label">Duration</div>
                  <div class="value">${item.duration}</div>
                </div>
                <div class="section">
                  <div class="label">Quantity</div>
                  <div class="value">${item.quantity} ${item.saleUnit}</div>
                </div>
                ${item.instructions ? `
                <div class="section">
                  <div class="label">Instructions</div>
                  <div class="value">${item.instructions}</div>
                </div>
                ` : ""}
                <div class="section">
  <div class="label">Prescribed By</div>
  <div class="value">Dr. ${item.prescribedBy?.firstName ?? "-"} ${item.prescribedBy?.lastName ?? ""}</div>
</div>
<div class="section">
  <div class="label">Dispensed By</div>
  <div class="value">${user?.firstName ?? ""} ${user?.lastName ?? ""}</div>
</div>
                <div class="barcode">*${item.id.slice(-8).toUpperCase()}*</div>
               <div class="footer">
  <p>Dispensed: ${new Date().toLocaleDateString()}</p>
  <p>Keep out of reach of children</p>
  <div style="margin-top:6px;display:flex;align-items:center;justify-content:center;gap:4px;">
    <img src="${window.location.origin}/zensa-mark.png" style="width:10px;height:10px;" />
    <span>Powered by Zensa</span>
  </div>
</div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 250);
        }
      }
      setPrintingId(null);
    }, 100);
  }

  function handlePrintAdmission(order: AdmissionOrder) {
  const printWindow = window.open("", "_blank", "width=300,height=450");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Medication Label</title>
        <style>
          @media print { body { margin: 0; padding: 0; } }
          body { font-family: monospace; font-size: 12px; line-height: 1.4; padding: 8px; width: 58mm; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 8px; }
          .header h2 { font-size: 14px; margin: 0; }
          .header p { font-size: 10px; margin: 2px 0 0; color: #666; }
          .section { margin-bottom: 6px; }
          .label { font-weight: bold; font-size: 10px; text-transform: uppercase; color: #666; }
          .value { font-size: 12px; }
          .footer { border-top: 1px dashed #000; padding-top: 4px; margin-top: 8px; font-size: 9px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${hospital?.name ?? "Zensa Health"}</h2>
          <p>Inpatient Medication Label</p>
        </div>
        <div class="section">
          <div class="label">Patient</div>
          <div class="value">${order.admission.patient.firstName} ${order.admission.patient.lastName}</div>
          <div class="value" style="font-size:10px;color:#666;">ID: ${order.admission.patient.patientNumber}</div>
        </div>
        <div class="section">
          <div class="label">Ward / Bed</div>
          <div class="value">${order.admission.bed.ward.name} — Bed ${order.admission.bed.bedNumber}</div>
        </div>
        <div class="section">
          <div class="label">Medication</div>
          <div class="value" style="font-size:14px;font-weight:bold;">${order.medicationName}</div>
        </div>
        <div class="section">
          <div class="label">Dosage / Route</div>
          <div class="value">${order.dosage} — ${order.route}</div>
        </div>
        <div class="section">
          <div class="label">Frequency</div>
          <div class="value">${order.frequency}</div>
        </div>
        <div class="section">
          <div class="label">Prescribed By</div>
          <div class="value">Dr. ${order.doctor.firstName} ${order.doctor.lastName}</div>
        </div>
        <div class="section">
          <div class="label">Verified By</div>
          <div class="value">${user?.firstName ?? ""} ${user?.lastName ?? ""}</div>
        </div>
        <div class="footer">
          <p>${new Date().toLocaleDateString()}</p>
          <div style="margin-top:6px;display:flex;align-items:center;justify-content:center;gap:4px;">
            <img src="${window.location.origin}/zensa-mark.png" style="width:10px;height:10px;" />
            <span>Powered by Zensa</span>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
}

  const pendingCount = prescriptions.filter((p) => p.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Hidden print template ref */}
      <div ref={printRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill size={24} className="text-blue-600" />
            Pharmacy
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {pendingCount} pending {pendingCount === 1 ? "prescription" : "prescriptions"} to dispense
          </p>
        </div>
      </div>

      {/* Inpatient Medication Orders — Awaiting Verification */}
      {admissionOrders.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <BedDouble size={18} className="text-violet-600" />
              Inpatient Orders Awaiting Verification
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {admissionOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-slate-900">{order.medicationName}</p>
                  <p className="text-sm text-slate-600">
                    {order.dosage} · {order.route} · {order.frequency}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {order.admission.patient.firstName} {order.admission.patient.lastName} · {order.admission.patient.patientNumber} · {order.admission.bed.ward.name} Bed {order.admission.bed.bedNumber}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ordered by Dr. {order.doctor.firstName} {order.doctor.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => verifyOrder(order.id)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    <CheckCircle2 size={12} />
                    Verify
                  </button>
                  <button
                    onClick={() => rejectOrder(order.id)}
                    disabled={rejectingId === order.id}
                    className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle size={12} />
                    Reject
                  </button>
                  <button
  onClick={() => handlePrintAdmission(order)}
  className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
>
  <Printer size={12} />
  Print
</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">Loading prescriptions...</p>
            </div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-16">
            <PackageCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-600">No pending prescriptions</p>
            <p className="text-sm text-slate-400 mt-1">All prescriptions have been dispensed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-left font-medium text-slate-600">Patient</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-600">Medication</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-600">Prescription</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-600">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-600 w-48">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                          {item.medicalRecord?.patient?.firstName?.[0]}
                          {item.medicalRecord?.patient?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.medicalRecord?.patient?.firstName} {item.medicalRecord?.patient?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            <User size={10} className="inline mr-1" />
                            {item.medicalRecord?.patient?.patientNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{item.medication}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-slate-700">{item.dosage}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} />
                          {item.frequency}
                        </p>
                        <p className="text-xs text-slate-500">Duration: {item.duration}</p>
                        {item.instructions && (
                          <p className="text-xs text-slate-400 italic">{item.instructions}</p>
                        )}
                        <p className="text-xs font-medium text-blue-700 mt-1">
                          Dispense: {item.quantity} {item.saleUnit}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrint(item)}
                          disabled={printingId === item.id}
                          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                          title="Print thermal label"
                        >
                          {printingId === item.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Printer size={12} />
                          )}
                          Print
                        </button>
                        {item.status === "PENDING" && (
                          <button
                            onClick={() => dispense(item.id)}
                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                          >
                            <PackageCheck size={12} />
                            Dispense
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Prescription["status"] }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    DISPENSED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
}

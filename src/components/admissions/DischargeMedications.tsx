"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import InventorySearch from "@/components/inventory/InventorySearch";
import { Pill, Loader2, Plus } from "lucide-react";

interface DischargeMed {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  saleUnit: string;
  instructions?: string;
  createdAt: string;
  prescribedBy: { firstName: string; lastName: string };
}

export default function DischargeMedications({ admissionId }: { admissionId: string }) {
  const [meds, setMeds] = useState<DischargeMed[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    inventoryItemId: "", medicationName: "", saleUnit: "",
    dosage: "", frequency: "", duration: "", quantity: 1, instructions: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [admissionId]);

  async function load() {
    try {
      const res = await api.get(`/admissions/${admissionId}/discharge-medications`);
      setMeds(res.data);
    } catch (err) {
      console.error("Failed to load discharge medications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.inventoryItemId) {
      alert("Please select a medication first.");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/admissions/${admissionId}/discharge-medications`, form);
      setForm({ inventoryItemId: "", medicationName: "", saleUnit: "", dosage: "", frequency: "", duration: "", quantity: 1, instructions: "" });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to prescribe medication.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
      <h2 className="font-semibold text-slate-900 flex items-center gap-2">
        <Pill size={18} className="text-emerald-600" />
        Discharge Medications
      </h2>

      <form onSubmit={submit} className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <InventorySearch
          filterType="MEDICATION"
          placeholder="Search medication to prescribe..."
          onSelect={(item: any) =>
            setForm({ ...form, inventoryItemId: item.id, medicationName: item.name, saleUnit: item.saleUnit })
          }
        />
        {form.medicationName && (
          <p className="text-sm font-medium text-slate-800">{form.medicationName}</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Dosage (e.g. 500mg)" value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
          <input placeholder="Frequency (e.g. Twice daily)" value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
          <input placeholder="Duration (e.g. 5 days)" value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
          <input type="number" min={1} placeholder={`Quantity (${form.saleUnit || "units"})`} value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <textarea placeholder="Instructions for patient (optional)..." value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none" rows={2} />
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add Discharge Medication
        </button>
      </form>

      {loading ? (
        <Loader2 size={18} className="animate-spin text-slate-400" />
      ) : meds.length === 0 ? (
        <p className="text-sm text-slate-400">No discharge medications prescribed yet.</p>
      ) : (
        <div className="space-y-2">
          {meds.map((m) => (
            <div key={m.id} className="p-3 border border-slate-200 rounded-lg">
              <p className="font-medium text-slate-900">{m.medication}</p>
              <p className="text-sm text-slate-600">{m.dosage} · {m.frequency} · {m.duration} · Qty {m.quantity} {m.saleUnit}</p>
              {m.instructions && <p className="text-xs text-slate-500 mt-1">{m.instructions}</p>}
              <p className="text-xs text-slate-400 mt-1">Dr. {m.prescribedBy.firstName} {m.prescribedBy.lastName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
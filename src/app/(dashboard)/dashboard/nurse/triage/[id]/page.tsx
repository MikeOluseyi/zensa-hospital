"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  HeartPulse,
  Thermometer,
  Activity,
  Wind,
  Weight,
  Ruler,
  Save,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";

interface TriageForm {
  bloodPressure: string;
  temperature: string;
  pulse: string;
  spo2: string;
  weight: string;
  height: string;
}

export default function TriageFormPage() {
  const router = useRouter();
  const params = useParams();
  const visitId = params.id as string;

  const [form, setForm] = useState<TriageForm>({
    bloodPressure: "",
    temperature: "",
    pulse: "",
    spo2: "",
    weight: "",
    height: "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof TriageForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  async function submit() {
    // Validate required fields
    const required = ["bloodPressure", "temperature", "pulse", "spo2", "weight"];
    const missing = required.filter((f) => !form[f as keyof TriageForm]);
    if (missing.length > 0) {
      alert(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/visits/${visitId}/triage`, form);
      setSaved(true);
       router.push(
        "/dashboard/nurse/queue"
      ); 
    } catch (err) {
      console.error("Failed to save triage:", err);
      alert("Failed to save triage. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const fields: {
    key: keyof TriageForm;
    label: string;
    placeholder: string;
    unit: string;
    icon: any;
    type: string;
    step?: string;
  }[] = [
    { key: "bloodPressure", label: "Blood Pressure", placeholder: "120/80", unit: "mmHg", icon: HeartPulse, type: "text" },
    { key: "temperature", label: "Temperature", placeholder: "37.0", unit: "°C", icon: Thermometer, type: "number", step: "0.1" },
    { key: "pulse", label: "Pulse Rate", placeholder: "72", unit: "bpm", icon: Activity, type: "number" },
    { key: "spo2", label: "SpO₂", placeholder: "98", unit: "%", icon: Wind, type: "number" },
    { key: "weight", label: "Weight", placeholder: "70", unit: "kg", icon: Weight, type: "number", step: "0.1" },
    { key: "height", label: "Height", placeholder: "170", unit: "cm", icon: Ruler, type: "number", step: "0.1" },
  ];

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/nurse/triage"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope size={24} className="text-rose-600" />
            Patient Triage
          </h1>
          <p className="text-sm text-slate-500">Record vital signs for appointment {visitId.slice(0, 8)}</p>
        </div>
      </div>

      {/* Success Banner */}
      {saved && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">Triage saved successfully. Redirecting...</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Vital Signs</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key}>
                <label className={labelClass}>
                  {field.label}
                  {field.key !== "height" && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={field.type}
                    step={field.step}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                    {field.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation hint */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            All fields except height are required. Ensure readings are accurate before saving.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/nurse/triage"
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={submit}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Triage
            </>
          )}
        </button>
      </div>
    </div>
  );
}
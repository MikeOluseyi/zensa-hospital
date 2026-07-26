// src/components/lab/ResultsModal.tsx

import React, { useState, useEffect } from "react";
import { labTemplates } from "@/services/lab-templates";
import api from "@/lib/api";

export interface ProcedureRequest {
  id: string;
  notes?: string;
  status: string;
  createdAt: string;
  medicalRecordService: {
    hospitalService: {
      service: {
        name: string;
        cpt?: { code: string };
      };
    };
  };
}

interface ResultsModalProps {
  target: ProcedureRequest | null;
  onClose: () => void;
  onSaved?: () => void;
}

export default function ResultsModal({
  target,
  onClose,
  onSaved,
}: ResultsModalProps) {
  
  const cptCode = target?.medicalRecordService?.hospitalService?.service?.cpt?.code || "";
  const orderId = target?.id || "";
  const serviceName = target?.medicalRecordService?.hospitalService?.service?.name || "";

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retrieve the correct template based on the CPT code
  const template = labTemplates[cptCode];

  // Reset form data when modal opens or target changes
  useEffect(() => {
    if (template && target) {
      const initialData: Record<string, any> = {};
      template.fields.forEach((field) => {
        initialData[field.name] = "";
      });
      setFormData(initialData);
    }
  }, [template, target]);

  if (!target) return null;
  
  if (!template) {
    return (
      <GenericResultForm
        target={target}
        onClose={onClose}
        onSaved={onSaved}
      />
    );
  }

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/lab-results", {
        orderId,
        cptCode,
        results: formData,
      });

      if (onSaved) {
        onSaved();
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {template.serviceName}
            </h2>
            <p className="text-xs text-slate-500">
              CPT Code: <span className="font-mono">{template.cptCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-xl"
          >
            &times;
          </button>
        </div>

        {/* Modal Body / Dynamic Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {template.fields.map((field) => (
              <div key={field.name} className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">
                  {field.label}
                  {field.unit && <span className="text-slate-400 font-normal"> ({field.unit})</span>}
                </label>

                {field.type === "select" ? (
                  <select
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select option...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    step={field.type === "number" ? "any" : undefined}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.referenceRange ? `Ref: ${field.referenceRange}` : ""}
                    className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                )}

                {field.referenceRange && (
                  <span className="text-xs text-slate-400 mt-1">
                    Normal: {field.referenceRange} {field.unit || ""}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Results"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GenericResultForm({
  target,
  onClose,
  onSaved,
}: {
  target: ProcedureRequest;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [results, setResults] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceName = target.medicalRecordService?.hospitalService?.service?.name || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!results.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/procedure/${target.id}/result`, {
        results: results.trim(),
        notes: notes.trim() || undefined,
      });
      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save result.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">{serviceName}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            No structured template configured for this test — enter results as free text.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Result <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              autoFocus
              value={results}
              onChange={(e) => setResults(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {submitting ? "Saving..." : "Save Results"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
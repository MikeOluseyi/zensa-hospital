"use client";

import { useEffect, useState } from "react";
import { X, Building2, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { HospitalService, ServiceAPI } from "@/services/services";

interface Department {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  service: HospitalService | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function DepartmentModal({ open, service, onClose, onSaved }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api
      .get("/departments")
      .then((res) => setDepartments(res.data))
      .catch(() => {
        // silently fail
      })
      .finally(() => setLoading(false));
    setDepartmentId(service?.department?.id || "");
  }, [open, service]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSave() {
    if (!service) return;
    setSubmitting(true);
    try {
      await ServiceAPI.assignDepartment(service.id, departmentId || null);
      onSaved();
      onClose();
    } catch {
      alert("Failed to assign department.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />
            Assign Department
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {service && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Service</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{service.service.name}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{service.service.cpt.code}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Building2 size={12} className="inline mr-1" />
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              disabled={loading}
            >
              <option value="">{loading ? "Loading departments..." : "No Department"}</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

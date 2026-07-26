"use client";

import { useEffect, useState } from "react";
import { X, BedDouble, Loader2, Building2 } from "lucide-react";
import { Ward } from "@/services/ward";
import { DepartmentService, Department } from "@/services/departments";

interface Props {
  open: boolean;
  ward: Ward | null;
  onClose: () => void;
  onSaved: () => void;
  onSubmit: (data: {
    name: string;
    type: string;
    departmentId: string;
  }) => Promise<void>;
}

export default function WardModal({
  open,
  ward,
  onClose,
  onSaved,
  onSubmit,
}: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!ward;

  useEffect(() => {
    if (open) {
      loadDepartments();
      setName(ward?.name ?? "");
      setType(ward?.type ?? "");
      setDepartmentId(ward?.departmentId ?? "");
    }
  }, [open, ward]);

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

  async function loadDepartments() {
    setLoading(true);
    try {
      const data = await DepartmentService.getAll();
      setDepartments(data);
    } catch {
      alert("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !departmentId) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        type: type.trim(),
        departmentId,
      });
      setName("");
      setType("");
      setDepartmentId("");
      onSaved();
    } catch {
      alert("Failed to save ward. Please try again.");
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
            <BedDouble size={18} className="text-blue-600" />
            {isEditing ? "Edit Ward" : "New Ward"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Ward Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. General Ward A"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Ward Type
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. General, ICU, Maternity"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Building2 size={12} className="inline mr-1" />
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              required
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading departments..." : "Select Department"}
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !departmentId}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Ward"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

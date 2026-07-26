"use client";

import { useEffect, useState } from "react";
import { X, Search, ClipboardList, Loader2, Check, Building2 } from "lucide-react";
import { ServiceAPI, Service } from "@/services/services";
import { api } from "@/services/api";

interface Department {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EnableServiceModal({ open, onClose, onSaved }: Props) {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [departmentId, setDepartmentId] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    loadDepartments();
    searchServices("");
  }, [open]);

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
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch {
      // silently fail
    }
  }

  async function searchServices(value: string) {
    setFetching(true);
    try {
      const data = await ServiceAPI.getCatalog(value);
      setServices(data);
    } catch {
      // silently fail
    } finally {
      setFetching(false);
    }
  }

  async function handleEnable(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !price) return;

    setSubmitting(true);
    try {
      await ServiceAPI.enable({
        serviceId: selectedService.id,
        departmentId: departmentId || undefined,
        price: Number(price),
      });
      resetForm();
      onSaved();
    } catch {
      alert("Failed to enable service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSelectedService(null);
    setDepartmentId("");
    setPrice("");
    setSearch("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) handleClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList size={18} className="text-blue-600" />
            Enable Hospital Service
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleEnable} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Search size={12} className="inline mr-1" />
                Search Service
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    searchServices(e.target.value);
                  }}
                  placeholder="Search by name or CPT code..."
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                />
                {fetching && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                )}
              </div>
            </div>

            {/* Service List */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Select Service <span className="text-red-500">*</span>
              </label>
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                {services.length === 0 && !fetching ? (
                  <div className="p-6 text-center text-sm text-slate-400">
                    No services found.
                  </div>
                ) : (
                  services.map((service) => {
                    const isSelected = selectedService?.id === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setSelectedService(service)}
                        className={`w-full text-left p-3 border-b border-slate-100 last:border-b-0 transition-colors flex items-start gap-3 ${
                          isSelected
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-blue-600 border-blue-600"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-slate-900">{service.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{service.cpt?.code ?? "_"}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{service.cpt?.description ?? ""}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Building2 size={12} className="inline mr-1" />
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">No Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₦</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 shrink-0 bg-white">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedService || !price || submitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Enabling...
                </>
              ) : (
                "Enable Service"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

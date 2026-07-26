"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  BedDouble,
  Plus,
  X,
  Loader2,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  CheckCircle2,
  XCircle,
  Wrench,
  Banknote,
} from "lucide-react";

interface Ward {
  id: string;
  name: string;
  type: string;
}

interface Bed {
  id: string;
  bedNumber: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  dailyRate: number | null;
  ward: Ward | null;
  patient: {
    firstName: string;
    lastName: string;
  } | null;
}

const statusStyles = {
  AVAILABLE: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
    label: "Available",
  },
  OCCUPIED: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
    label: "Occupied",
  },
  MAINTENANCE: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Wrench,
    label: "Maintenance",
  },
};

export default function BedsPage() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [filtered, setFiltered] = useState<Bed[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [wardFilter, setWardFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    wardId: "",
    bedNumber: "",
    dailyRate: "",
  });

  useEffect(() => {
    fetchBeds();
    fetchWards();
  }, []);

  useEffect(() => {
    let result = beds;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.bedNumber.toLowerCase().includes(term) ||
          b.ward?.name.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (wardFilter !== "ALL") {
      result = result.filter((b) => b.ward?.id === wardFilter);
    }

    setFiltered(result);
  }, [search, statusFilter, wardFilter, beds]);

  async function fetchBeds() {
    try {
      setLoading(true);
      const res = await api.get("/beds");
      setBeds(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch beds:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWards() {
    try {
      const res = await api.get("/wards");
      setWards(res.data);
    } catch (err) {
      console.error("Failed to fetch wards:", err);
    }
  }

  async function createBed(e: React.FormEvent) {
    e.preventDefault();
    if (!form.wardId || !form.bedNumber.trim()) return;

    setCreating(true);
    try {
      await api.post("/beds", {
        ...form,
        dailyRate: form.dailyRate ? Number(form.dailyRate) : null,
      });
      setShowModal(false);
      setForm({ wardId: "", bedNumber: "", dailyRate: "" });
      fetchBeds();
    } catch (err) {
      console.error("Failed to create bed:", err);
      alert("Failed to create bed. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  const availableCount = beds.filter((b) => b.status === "AVAILABLE").length;
  const occupiedCount = beds.filter((b) => b.status === "OCCUPIED").length;
  const maintenanceCount = beds.filter((b) => b.status === "MAINTENANCE").length;

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
  const selectClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BedDouble size={24} className="text-blue-600" />
            Beds
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {beds.length} bed{beds.length !== 1 ? "s" : ""} across {wards.length} ward{wards.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Bed
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Available</p>
          </div>
          <p className="text-2xl font-bold text-emerald-900">{availableCount}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={16} className="text-red-600" />
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Occupied</p>
          </div>
          <p className="text-2xl font-bold text-red-900">{occupiedCount}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wrench size={16} className="text-amber-600" />
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Maintenance</p>
          </div>
          <p className="text-2xl font-bold text-amber-900">{maintenanceCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bed number or ward..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="ALL">All Wards</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Bed</th>
                <th className="px-4 py-3">Ward</th>
                <th className="px-4 py-3">Daily Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Current Patient</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm">Loading beds...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <BedDouble size={32} />
                      <p className="text-sm font-medium text-slate-600">
                        {search || statusFilter !== "ALL" || wardFilter !== "ALL"
                          ? "No beds match your filters"
                          : "No beds found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((bed) => {
                  const style = statusStyles[bed.status];
                  const StatusIcon = style.icon;

                  return (
                    <tr key={bed.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center`}>
                            <BedDouble size={14} className={style.text} />
                          </div>
                          <span className="font-medium text-slate-900">{bed.bedNumber}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Building2 size={14} className="text-slate-400" />
                          {bed.ward?.name || "Unassigned"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Banknote size={14} className="text-slate-400" />
                          {bed.dailyRate ? `₦${bed.dailyRate.toLocaleString()}` : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
                          <StatusIcon size={10} />
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {bed.patient ? (
                          <span className="text-sm text-slate-700">
                            {bed.patient.firstName} {bed.patient.lastName}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bed Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Add Bed</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createBed} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ward</label>
                <select
                  value={form.wardId}
                  onChange={(e) => setForm({ ...form, wardId: e.target.value })}
                  className={selectClass}
                  required
                >
                  <option value="">Select ward</option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bed Number</label>
                <input
                  placeholder="e.g. GMW-001"
                  value={form.bedNumber}
                  onChange={(e) => setForm({ ...form, bedNumber: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Daily Rate (₦)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={form.dailyRate}
                  onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !form.wardId || !form.bedNumber.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Create Bed
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
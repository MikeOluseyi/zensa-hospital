"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { assignDepartment } from "@/services/ward";
import {
  BedDouble,
  ArrowLeft,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Banknote,
} from "lucide-react";

interface Bed {
  id: string;
  bedNumber: string;
  status: "AVAILABLE" | "OCCUPIED";
  dailyRate: number | null;
}

interface Ward {
  id: string;
  name: string;
  type: string;
  departmentId?: string | null;
  beds: Bed[];
}

export default function WardPage() {
  const params = useParams();
  const router = useRouter();
  const [ward, setWard] = useState<Ward | null>(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [bedNumber, setBedNumber] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  
  useEffect(() => {
    loadWard();
    loadDepartments();
  }, []);

  async function loadWard() {
    try {
      setLoading(true);
      const res = await api.get(`/wards/${params.id}`);
      setWard(res.data);
    } catch {
      alert("Failed to load ward.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
  try {
    const res = await api.get("/departments");
    setDepartments(res.data);
  } catch {
    alert("Failed to load departments.");
  }
}

  async function addBed(e: React.FormEvent) {
    e.preventDefault();
    if (!bedNumber.trim()) return;

    setAdding(true);
    try {
      await api.post(`/wards/${params.id}/beds`, {
        bedNumber: bedNumber.trim(),
        dailyRate: dailyRate ? Number(dailyRate) : null,
      });
      setBedNumber("");
      setDailyRate("");
      loadWard();
    } catch {
      alert("Failed to add bed.");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading ward...</p>
        </div>
      </div>
    );
  }

  if (!ward) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-lg font-medium text-slate-600">Ward not found</p>
        <button
  onClick={() => router.push("/dashboard/facility/wards")}
  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
>
  <ArrowLeft size={16} />
  Back to wards
</button>
      </div>
    );
  }

  const availableBeds = ward.beds.filter((b) => b.status === "AVAILABLE").length;
  const occupiedBeds = ward.beds.filter((b) => b.status === "OCCUPIED").length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Back + Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.push("/dashboard/facility/wards")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to wards
        </button>

        <div className="space-y-3">
  <div>
    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
      <BedDouble size={24} className="text-blue-600" />
      {ward.name}
    </h1>

    <p className="text-sm text-slate-500 mt-1 capitalize">
      {ward.type}
    </p>
  </div>

  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      Department
    </label>

    <select
      value={(ward as any).departmentId || ""}
      onChange={async (e) => {
        await assignDepartment(
          ward.id,
          e.target.value
        );

        loadWard();
      }}
      className="border border-slate-300 rounded-lg p-2 text-sm bg-white"
    >
      <option value="">
        No Department
      </option>

      {departments.map((d: any) => (
        <option
          key={d.id}
          value={d.id}
        >
          {d.name}
        </option>
      ))}
    </select>
  </div>
</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<BedDouble size={20} />}
          label="Total Beds"
          value={ward.beds.length}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Available"
          value={availableBeds}
          color="emerald"
        />
        <StatCard
          icon={<XCircle size={20} />}
          label="Occupied"
          value={occupiedBeds}
          color="amber"
        />
      </div>

      {/* Add Bed Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-5">
          <Plus size={18} className="text-slate-500" />
          Add Bed
        </h2>
        <form onSubmit={addBed} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Bed Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={bedNumber}
              onChange={(e) => setBedNumber(e.target.value)}
              placeholder="e.g. Bed 101"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Banknote size={12} className="inline mr-1" />
              Daily Rate (₦)
            </label>
            <input
              type="number"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !bedNumber.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {adding ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus size={14} />
                Add Bed
              </>
            )}
          </button>
        </form>
      </div>

      {/* Beds Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Beds</h2>
        </div>
        {ward.beds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left font-medium text-slate-600">Bed Number</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-600">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-600">Daily Rate</th>
                </tr>
              </thead>
              <tbody>
                {ward.beds.map((bed) => (
                  <tr key={bed.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">{bed.bedNumber}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={bed.status} />
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {bed.dailyRate ? `₦${bed.dailyRate.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <BedDouble size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No beds yet</p>
            <p className="text-sm text-slate-400 mt-1">Add a bed using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "emerald" | "amber";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Bed["status"] }) {
  const styles = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    OCCUPIED: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
}

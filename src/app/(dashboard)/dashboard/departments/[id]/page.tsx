"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDepartment } from "@/services/departments";
import AssignStaffModal from "../components/AssignStaffModal";
import {
  Building2,
  BedDouble,
  Users,
  LayoutGrid,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
} from "lucide-react";

interface Ward {
  id: string;
  name: string;
  beds: { id: string; bedNumber: string; status: string }[];
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  wards: Ward[];
  staff: Staff[];
}

export default function DepartmentPage() {
  const params = useParams();
  const router = useRouter();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);

  useEffect(() => {
    loadDepartment();
  }, []);

  async function loadDepartment() {
    try {
      const data = await getDepartment(params.id as string);
      setDepartment(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  const totalBeds =
    department?.wards.reduce((sum, ward) => sum + ward.beds.length, 0) ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading department...</p>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-lg font-medium text-slate-600">Department not found</p>
        <button
          onClick={() => router.push("/dashboard/departments")}
          className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Back to departments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Back + Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.push("/dashboard/departments")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to departments
        </button>

        <div className="flex items-start justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
      <Building2 size={24} className="text-blue-600" />
      {department.name}
    </h1>

    {department.description && (
      <p className="text-sm text-slate-500 mt-1 max-w-2xl">
        {department.description}
      </p>
    )}
  </div>

  <button
    onClick={() => setAssignOpen(true)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
  >
    Assign Staff
  </button>
</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<LayoutGrid size={20} />}
          label="Wards"
          value={department.wards?.length ?? 0}
          color="blue"
        />
        <StatCard
          icon={<Users size={20} />}
          label="Staff"
          value={department.staff?.length ?? 0}
          color="emerald"
        />
        <StatCard
          icon={<BedDouble size={20} />}
          label="Beds"
          value={totalBeds}
          color="violet"
        />
      </div>

      {/* Wards List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-5">
          <MapPin size={18} className="text-slate-500" />
          Wards
        </h2>

        {department.wards && department.wards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {department.wards.map((ward) => {
              const availableBeds = ward.beds.filter(
                (b) => b.status === "AVAILABLE"
              ).length;
              const occupiedBeds = ward.beds.filter(
                (b) => b.status === "OCCUPIED"
              ).length;

              return (
                <div
                  key={ward.id}
                  className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-slate-900">{ward.name}</h3>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-slate-600">
                      <BedDouble size={14} className="inline mr-1" />
                      {ward.beds.length} beds
                    </span>
                    <span className="text-emerald-600">
                      {availableBeds} available
                    </span>
                    <span className="text-amber-600">
                      {occupiedBeds} occupied
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400">No wards in this department.</p>
          </div>
        )}
      </div>
      <AssignStaffModal
  open={assignOpen}
  departmentId={department.id}
  onClose={() => setAssignOpen(false)}
  onSaved={loadDepartment}
/>
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
  color: "blue" | "emerald" | "violet";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    violet: "bg-violet-50 text-violet-600 border-violet-200",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colors[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

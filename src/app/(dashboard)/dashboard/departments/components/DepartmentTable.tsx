"use client";

import { useEffect, useState } from "react";
import { Department, DepartmentService } from "@/services/departments";
import DepartmentCard from "./DepartmentCard";
import DepartmentModal from "./DepartmentModal";
import {
  Building2,
  LayoutGrid,
  Users,
  Search,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function DepartmentTable() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  async function loadDepartments() {
    try {
      setLoading(true);
      const data = await DepartmentService.getAll();
      setDepartments(data);
    } catch {
      alert("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  const filteredDepartments = departments.filter((department) => {
    const query = search.toLowerCase();
    return (
      department.name.toLowerCase().includes(query) ||
      (department.description ?? "").toLowerCase().includes(query)
    );
  });

  const stats = {
    departments: departments.length,
    wards: departments.reduce((sum, d) => sum + (d._count?.wards ?? 0), 0),
    staff: departments.reduce((sum, d) => sum + (d._count?.staff ?? 0), 0),
  };

  async function handleDelete(department: Department) {
    const confirmed = confirm(`Delete "${department.name}"? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await DepartmentService.delete(department.id);
      loadDepartments();
    } catch {
      alert("Unable to delete department.");
    }
  }

  function handleCreate() {
    setSelectedDepartment(null);
    setModalOpen(true);
  }

  function handleEdit(department: Department) {
    setSelectedDepartment(department);
    setModalOpen(true);
  }

  async function handleSubmit(data: { name: string; description: string }) {
    if (selectedDepartment) {
      await DepartmentService.update(selectedDepartment.id, data);
    } else {
      await DepartmentService.create(data);
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Building2 size={20} />} label="Departments" value={stats.departments} color="blue" />
        <StatCard icon={<LayoutGrid size={20} />} label="Wards" value={stats.wards} color="emerald" />
        <StatCard icon={<Users size={20} />} label="Staff" value={stats.staff} color="violet" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus size={16} />
          New Department
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Loading departments...</p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredDepartments.length === 0 && (
        <div className="border border-slate-200 rounded-xl p-12 text-center">
          <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">
            {search ? "No departments match your search." : "No departments found."}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? "Try a different search term." : "Create your first department to get started."}
          </p>
        </div>
      )}

      {/* Cards */}
      {!loading && filteredDepartments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDepartments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              onEdit={() => handleEdit(department)}
              onDelete={() => handleDelete(department)}
            />
          ))}
        </div>
      )}

      <DepartmentModal
        open={modalOpen}
        department={selectedDepartment}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          loadDepartments();
        }}
        onSubmit={handleSubmit}
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

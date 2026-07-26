"use client";

import { Building2, Plus } from "lucide-react";
import DepartmentTable from "./components/DepartmentTable";

export default function DepartmentsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 size={24} className="text-blue-600" />
            Departments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and organize hospital departments.
          </p>
        </div>
        
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <DepartmentTable />
      </div>
    </div>
  );
}

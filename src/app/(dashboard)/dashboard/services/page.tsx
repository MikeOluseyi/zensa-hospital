"use client";

import { ClipboardList, Plus } from "lucide-react";
import ServiceTable from "./components/ServiceTable";

export default function ServicesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList size={24} className="text-blue-600" />
            Hospital Services
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage services available in your hospital.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <ServiceTable />
      </div>
    </div>
  );
}

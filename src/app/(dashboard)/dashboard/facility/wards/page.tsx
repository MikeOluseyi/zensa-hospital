"use client";

import { BedDouble } from "lucide-react";
import WardTable from "./ward/components/WardTable";

export default function WardsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BedDouble size={24} className="text-blue-600" />
            Wards
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and organize hospital wards.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <WardTable />
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { BedDouble, Pencil, Trash2, Users } from "lucide-react";
import { Ward } from "@/services/ward";

interface Props {
  ward: Ward;
  onEdit: () => void;
  onDelete: () => void;
}

export default function WardCard({ ward, onEdit, onDelete }: Props) {
  const availableBeds = ward.beds.filter((b) => b.status === "AVAILABLE").length;
  const occupiedBeds = ward.beds.filter((b) => b.status === "OCCUPIED").length;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        {/* Main content */}
        <Link
          href={`/dashboard/facility/wards/ward/${ward.id}`}
          className="flex items-start gap-3 flex-1 min-w-0"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <BedDouble size={18} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900 truncate">{ward.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5 capitalize">{ward.type}</p>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <BedDouble size={13} />
          {ward.beds.length} {ward.beds.length === 1 ? "bed" : "beds"}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600">
          {availableBeds} available
        </span>
        <span className="flex items-center gap-1.5 text-xs text-amber-600">
          {occupiedBeds} occupied
        </span>
      </div>
    </div>
  );
}

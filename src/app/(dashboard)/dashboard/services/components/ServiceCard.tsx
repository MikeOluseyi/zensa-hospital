"use client";

import { ClipboardList, Pencil, Building2, Trash2, Tag } from "lucide-react";
import { HospitalService } from "@/services/services";

interface Props {
  service: HospitalService;
  onDelete: () => void;
  onDepartment: () => void;
  onPrice: () => void;
}

export default function ServiceCard({ service, onDelete, onDepartment, onPrice }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <ClipboardList size={18} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{service.service.name}</h3>
            <p className="text-sm text-slate-500 font-mono mt-0.5">{service.service.cpt.code}</p>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{service.service.cpt.description}</p>
          </div>
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-500">Price</p>
          <p className="text-2xl font-bold text-emerald-600">₦{service.price.toLocaleString()}</p>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Building2 size={14} className="text-slate-400" />
          <span className="font-medium">{service.department?.name ?? "No department"}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrice}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
            title="Edit Price"
          >
            <Tag size={14} />
            Price
          </button>
          <button
            onClick={onDepartment}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
            title="Change Department"
          >
            <Building2 size={14} />
            Dept
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            title="Disable Service"
          >
            <Trash2 size={14} />
            Disable
          </button>
        </div>
      </div>
    </div>
  );
}

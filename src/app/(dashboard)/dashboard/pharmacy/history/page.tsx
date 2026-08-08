"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { History, PackageCheck, Loader2, Search, ArrowLeft } from "lucide-react";

interface DispensedRx {
  id: string;
  medication: string;
  dosage: string;
  quantity: number;
  saleUnit: string;
  dispensedAt: string;
  medicalRecord: { patient: { firstName: string; lastName: string; patientNumber: string } };
  dispensedBy: { firstName: string; lastName: string } | null;
}

export default function DispenseHistoryPage() {
  const [items, setItems] = useState<DispensedRx[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/pharmacy/dispensed")
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) => {
    const term = search.toLowerCase();
    const patient = i.medicalRecord.patient;
    return (
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(term) ||
      patient.patientNumber.toLowerCase().includes(term) ||
      i.medication.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pharmacy" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History size={24} className="text-blue-600" />
            Dispense History
          </h1>
          <p className="text-sm text-slate-500 mt-1">{items.length} recently dispensed</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient or medication..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-slate-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <PackageCheck size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No dispensed items yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-slate-900">
                  {item.medicalRecord.patient.firstName} {item.medicalRecord.patient.lastName}
                  <span className="text-xs text-slate-400 ml-2">{item.medicalRecord.patient.patientNumber}</span>
                </p>
                <p className="text-sm text-slate-600">{item.medication} — {item.dosage} · Qty {item.quantity} {item.saleUnit}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {item.dispensedBy ? `Dispensed by ${item.dispensedBy.firstName} ${item.dispensedBy.lastName} · ` : ""}
                  {new Date(item.dispensedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
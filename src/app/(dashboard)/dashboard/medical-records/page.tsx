"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ICD10Search from "@/components/medical-records/ICD10Search";
import {
  BarChart3, Loader2, Calendar, Stethoscope, Pill,
  FlaskConical, Building2, TrendingUp, X, ArrowLeft
} from "lucide-react";

interface Doctor { id: string; firstName: string; lastName: string; }
interface Department { id: string; name: string; }
interface ICD10Item { id: string; code: string; description: string; }

interface AnalyticsData {
  totalConsultations: number;
  byDiagnosis: { code: string; description: string; count: number }[];
  byDoctor: { id: string; name: string; count: number }[];
  byDepartment: { id: string; name: string; count: number }[];
  byProcedure: { name: string; count: number }[];
  byPrescription: { medication: string; count: number }[];
  trend: { date: string; count: number }[];
}

export default function ClinicalAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [icd10, setIcd10] = useState<ICD10Item | null>(null);

  useEffect(() => {
    api.get("/staff?role=DOCTOR").then((r) => setDoctors(r.data)).catch(() => {});
    api.get("/departments").then((r) => setDepartments(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [from, to, doctorId, departmentId, icd10]);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (doctorId) params.doctorId = doctorId;
      if (departmentId) params.departmentId = departmentId;
      if (icd10) params.icd10Id = icd10.id;

      const res = await api.get("/medical-records/analytics", { params });
      setData(res.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setFrom(""); setTo(""); setDoctorId(""); setDepartmentId(""); setIcd10(null);
  }

  const hasFilters = from || to || doctorId || departmentId || icd10;
  const maxTrend = data ? Math.max(1, ...data.trend.map((t) => t.count)) : 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/medical-records" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={24} className="text-blue-600" />
            Clinical Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">Breakdown of clinical activity across your hospital</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Doctor</label>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">All doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">Diagnosis (ICD-10)</label>
            <ICD10Search onSelect={(item) => setIcd10(item)} />
            {icd10 && (
              <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <span className="font-mono font-semibold text-blue-700">{icd10.code}</span>
                <span className="text-blue-800">{icd10.description}</span>
                <button onClick={() => setIcd10(null)}><X size={12} className="text-blue-600" /></button>
              </div>
            )}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-slate-500 hover:text-slate-700 font-medium">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-slate-400" /></div>
      ) : !data ? null : (
        <>
          {/* Summary + trend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:col-span-1">
              <p className="text-sm text-slate-500">Total Consultations</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{data.totalConsultations}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:col-span-2">
              <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-3">
                <TrendingUp size={14} className="text-blue-600" /> Daily Trend
              </p>
              {data.trend.length === 0 ? (
                <p className="text-sm text-slate-400">No data for this range.</p>
              ) : (
                <div className="flex items-end gap-1 h-16">
                  {data.trend.map((t) => (
                    <div key={t.date} className="flex-1 group relative">
                      <div
                        className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                        style={{ height: `${Math.max(4, (t.count / maxTrend) * 64)}px` }}
                      />
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                        {t.date}: {t.count}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Breakdown grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BreakdownCard
              title="Top Diagnoses"
              icon={Stethoscope}
              items={data.byDiagnosis.map((d) => ({ label: `${d.code} — ${d.description}`, count: d.count }))}
            />
            <BreakdownCard
              title="Top Procedures"
              icon={FlaskConical}
              items={data.byProcedure.map((p) => ({ label: p.name, count: p.count }))}
            />
            <BreakdownCard
              title="Top Prescriptions"
              icon={Pill}
              items={data.byPrescription.map((p) => ({ label: p.medication, count: p.count }))}
            />
            <BreakdownCard
              title="By Department"
              icon={Building2}
              items={data.byDepartment.map((d) => ({ label: d.name, count: d.count }))}
            />
            <BreakdownCard
              title="Staff Activity"
              icon={Calendar}
              items={data.byDoctor.map((d) => ({ label: `Dr. ${d.name}`, count: d.count }))}
              fullWidth
            />
          </div>
        </>
      )}
    </div>
  );
}

function BreakdownCard({
  title, icon: Icon, items, fullWidth,
}: {
  title: string;
  icon: any;
  items: { label: string; count: number }[];
  fullWidth?: boolean;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${fullWidth ? "md:col-span-2" : ""}`}>
      <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
        <Icon size={16} className="text-slate-500" />
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No data for this range.</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-700 truncate pr-2">{item.label}</span>
                <span className="text-slate-500 font-medium shrink-0">{item.count}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
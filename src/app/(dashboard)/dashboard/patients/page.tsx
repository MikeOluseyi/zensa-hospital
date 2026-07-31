"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Users, Plus, Search, Eye, Pencil, UserX } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  phone: string;
  dateOfBirth: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filtered, setFiltered] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      patients.filter((p) =>
        `${p.firstName} ${p.middleName} ${p.lastName}`.toLowerCase().includes(term) ||
        p.phone.includes(term)
      )
    );
  }, [search, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/patients");
      setPatients(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500">
            {patients.length} patient{patients.length !== 1 ? "s" : ""} in system
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* CHANGED: Link to full registration page instead of modal */}
          <Link
            href="/dashboard/patients/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Patient
          </Link>
          <Link
            href="/dashboard/patients/import"
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Bulk Import Patients
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full max-w-md pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">D.O.B</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-sm">Loading patients...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Users size={32} />
                      <p className="text-sm font-medium text-slate-600">
                        {search ? "No patients match your search" : "No patients found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {patient.firstName[0]}{patient.middleName?.[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/patients/${patient.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {patient.firstName} {patient.middleName} {patient.lastName}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-slate-600">{patient.gender}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{patient.phone}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/patients/${patient.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Eye size={12} />
                          View
                        </Link>
                        <Link
                          href={`/dashboard/patients/${patient.id}/edit`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
                        >
                          <Pencil size={12} />
                          Edit
                        </Link>
                        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors">
                          <UserX size={12} />
                          Disable
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Papa from "papaparse";
import { Upload, Download, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

const TEMPLATE_HEADERS = [
  "patientNumber", "firstName", "middleName", "lastName", "dateOfBirth",
  "gender", "phone", "email", "address", "bloodGroup", "genotype",
  "stateOfOrigin", "localGovernmentOfOrigin", "nextOfKinName", "nextOfKinRelationship",
  "nextOfKinAddress" , "nextOfKinPhone", "nextOfKinEmail",
];

export default function BulkImportPatientsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  function downloadTemplate() {
    const csv = Papa.unparse([TEMPLATE_HEADERS]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patient_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setRows(res.data as any[]),
    });
  }

  async function handleImport() {
    if (rows.length === 0) return;
    setImporting(true);
    try {
      const res = await api.post("/patients/bulk-import", { patients: rows });
      setResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Upload size={24} className="text-blue-600" />
          Bulk Import Patients
        </h1>
        <p className="text-sm text-slate-500 mt-1">Upload a CSV to register multiple patients at once.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Download size={14} />
          Download CSV template
        </button>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload CSV</label>
          <input type="file" accept=".csv" onChange={handleFile} className="text-sm" />
          {fileName && <p className="text-xs text-slate-500 mt-1">{fileName} — {rows.length} rows detected</p>}
        </div>

        <button
          onClick={handleImport}
          disabled={importing || rows.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {importing ? "Importing..." : `Import ${rows.length} Patients`}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 size={18} />
            <span className="font-medium">{result.created} patients created</span>
          </div>

          {result.skipped.length > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-700 flex items-center gap-1.5 mb-1">
                <AlertTriangle size={14} /> {result.skipped.length} skipped (already exist)
              </p>
              <ul className="text-xs text-slate-500 space-y-0.5 max-h-32 overflow-y-auto">
                {result.skipped.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-700 flex items-center gap-1.5 mb-1">
                <AlertTriangle size={14} /> {result.errors.length} errors
              </p>
              <ul className="text-xs text-slate-500 space-y-0.5 max-h-32 overflow-y-auto">
                {result.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <button
            onClick={() => router.push("/dashboard/patients")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to Patients →
          </button>
        </div>
      )}
    </div>
  );
}
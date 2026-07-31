"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Save, Loader2, User, AlertCircle } from "lucide-react";
import Link from "next/link";

interface PatientForm {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  genotype: string;
  stateOfOrigin: string;
  localGovernmentOfOrigin: string;
  maritalStatus: string;
  numberOfChildren: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinAddress: string;
  nextOfKinPhone: string;
  nextOfKinEmail: string;
}

const EMPTY_FORM: PatientForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  address: "",
  bloodGroup: "",
  genotype: "",
  stateOfOrigin: "",
  localGovernmentOfOrigin: "",
  maritalStatus: "",
  numberOfChildren: "",
  nextOfKinName: "",
  nextOfKinRelationship: "",
  nextOfKinAddress: "",
  nextOfKinPhone: "",
  nextOfKinEmail: "",
};

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [patientNumber, setPatientNumber] = useState("");
  const [form, setForm] = useState<PatientForm>(EMPTY_FORM);

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  async function fetchPatient() {
    try {
      setLoading(true);
      const res = await api.get(`/patients/${patientId}`);
      const p = res.data;

      setPatientNumber(p.patientNumber ?? "");

      setForm({
        firstName: p.firstName || "",
        middleName: p.middleName || "",
        lastName: p.lastName || "",
        gender: p.gender || "",
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : "",
        phone: p.phone || "",
        email: p.email || "",
        address: p.address || "",
        bloodGroup: p.bloodGroup || "",
        genotype: p.genotype || "",
        stateOfOrigin: p.stateOfOrigin || "",
        localGovernmentOfOrigin: p.localGovernmentOfOrigin || "",
        maritalStatus: p.maritalStatus || "",
        numberOfChildren:
          p.numberOfChildren !== null && p.numberOfChildren !== undefined
            ? String(p.numberOfChildren)
            : "",
        nextOfKinName: p.nextOfKinName || "",
        nextOfKinRelationship: p.nextOfKinRelationship || "",
        nextOfKinAddress: p.nextOfKinAddress || "",
        nextOfKinPhone: p.nextOfKinPhone || "",
        nextOfKinEmail: p.nextOfKinEmail || "",
      });
    } catch (err) {
      console.error("Failed to load patient:", err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await api.patch(`/patients/${patientId}`, form);
      router.push(`/dashboard/patients/${patientId}`);
    } catch (err) {
      console.error("Failed to update patient:", err);
      alert("Failed to update patient. Please check all fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
  const selectClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading patient...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-lg font-medium text-slate-600">Could not load patient</p>
        <Link href="/dashboard/patients" className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium inline-block">
          Back to patients
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/patients/${patientId}`}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Patient</h1>
          <p className="text-sm text-slate-500">
            {form.firstName} {form.lastName} · {patientNumber}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Personal Information */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Middle Name</label>
              <input name="middleName" value={form.middleName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={selectClass} required>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State of Origin</label>
              <input name="stateOfOrigin" value={form.stateOfOrigin} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LGA of Origin</label>
              <input name="localGovernmentOfOrigin" value={form.localGovernmentOfOrigin} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Marital Status</label>
              <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className={selectClass}>
                <option value="">Select Status</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="SEPARATED">Separated</option>
                <option value="WIDOWED">Widowed</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Number of Children</label>
              <input type="number" name="numberOfChildren" value={form.numberOfChildren} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>
                    {/* Blood Group Selection */}
            <div>
              <label className={labelClass}>Blood Group</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={selectClass}>
                <option value="">Select Blood Group</option>
                <option value="A_POSITIVE">A+</option>
                <option value="A_NEGATIVE">A-</option>
                <option value="B_POSITIVE">B+</option>
                <option value="B_NEGATIVE">B-</option>
                <option value="AB_POSITIVE">AB+</option>
                <option value="AB_NEGATIVE">AB-</option>
                <option value="O_POSITIVE">O+</option>
                <option value="O_NEGATIVE">O-</option>
              </select>
            </div>

            {/* Genotype Selection */}
            <div>
              <label className={labelClass}>Genotype</label>
              <select name="genotype" value={form.genotype} onChange={handleChange} className={selectClass}>
                <option value="">Select Genotype</option>
                <option value="AA">AA</option>
                <option value="AS">AS</option>
                <option value="AC">AC</option>
                <option value="SS">SS</option>
                <option value="SC">SC</option>
              </select>
            </div>

        {/* Address */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Address</h2>
          <div>
            <label className={labelClass}>Residential Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} className={inputClass} rows={3} />
          </div>
        </div>
        

        {/* Next of Kin */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Next of Kin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input name="nextOfKinName" value={form.nextOfKinName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Relationship</label>
              <select name="nextOfKinRelationship" value={form.nextOfKinRelationship} onChange={handleChange} className={selectClass}>
                <option value="">Select Relationship</option>
                <option value="SPOUSE">Spouse</option>
                <option value="PARENT">Parent</option>
                <option value="CHILD">Child</option>
                <option value="SIBLING">Sibling</option>
                <option value="UNCLE">Uncle</option>
                <option value="AUNT">Aunt</option>
                <option value="COUSIN">Cousin</option>
                <option value="FRIEND">Friend</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="nextOfKinPhone" value={form.nextOfKinPhone} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="nextOfKinEmail" value={form.nextOfKinEmail} onChange={handleChange} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address</label>
              <textarea name="nextOfKinAddress" value={form.nextOfKinAddress} onChange={handleChange} className={inputClass} rows={3} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="p-6 bg-slate-50 flex items-center justify-between">
          <Link
            href={`/dashboard/patients/${patientId}`}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
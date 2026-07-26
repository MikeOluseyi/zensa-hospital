"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import Link from "next/link";

interface PatientForm {
  patientNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
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

export default function NewPatientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<PatientForm>({
    patientNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    stateOfOrigin: "",
    localGovernmentOfOrigin: "",
    maritalStatus: "",
    numberOfChildren: "",
    nextOfKinName: "",
    nextOfKinRelationship: "",
    nextOfKinAddress: "",
    nextOfKinPhone: "",
    nextOfKinEmail: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.post("/patients", form);
      router.push("/dashboard/patients");
    } catch (err) {
      console.error("Failed to create patient:", err);
      alert("Failed to create patient. Please check all fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
  const selectClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/patients"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Register Patient</h1>
          <p className="text-sm text-slate-500">Create a new patient profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Personal Information */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <UserPlus size={18} className="text-blue-600" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Patient Number</label>
              <input name="patientNumber" placeholder="e.g. ZEN-001" onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>First Name</label>
              <input name="firstName" placeholder="First name" onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Middle Name</label>
              <input name="middleName" placeholder="Middle name" onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input name="lastName" placeholder="Last name" onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" onChange={handleChange} className={selectClass} required>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" name="dateOfBirth" onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" placeholder="Phone number" onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" placeholder="Email address" onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State of Origin</label>
              <input name="stateOfOrigin" placeholder="State" onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LGA of Origin</label>
              <input name="localGovernmentOfOrigin" placeholder="Local Government Area" onChange={handleChange} className={inputClass} />
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
              <input type="number" name="numberOfChildren" placeholder="0" onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Address</h2>
          <div>
            <label className={labelClass}>Residential Address</label>
            <textarea name="address" placeholder="Full address" onChange={handleChange} className={inputClass} rows={3} />
          </div>
        </div>

        {/* Next of Kin */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Next of Kin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input name="nextOfKinName" placeholder="Next of kin name" onChange={handleChange} className={inputClass} />
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
              <input name="nextOfKinPhone" placeholder="Phone number" onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="nextOfKinEmail" placeholder="Email address" onChange={handleChange} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address</label>
              <textarea name="nextOfKinAddress" placeholder="Next of kin address" onChange={handleChange} className={inputClass} rows={3} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="p-6 bg-slate-50 flex items-center justify-between">
          <Link
            href="/dashboard/patients"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {saving ? "Registering..." : "Register Patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
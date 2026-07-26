"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getPatients } from "@/services/patients";
import { getDoctors } from "@/services/staff";
import { X, Search, Calendar, User, Stethoscope, FileText, Loader2, CheckCircle2 } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber?: string;
  phone?: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAppointmentModal({ open, onClose, onSuccess }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [patientsData, doctorsData] = await Promise.all([getPatients(), getDoctors()]);
        setPatients(patientsData);
        setDoctors(doctorsData);
      } catch (err) {
        console.error("Failed to load modal data:", err);
      }
    }
    if (open) {
      loadData();
      // Reset form when opening
      setForm({ patientId: "", doctorId: "", appointmentDate: "", reason: "", notes: "" });
      setPatientSearch("");
      setDoctorSearch("");
      setShowPatientDropdown(false);
      setShowDoctorDropdown(false);
    }
  }, [open]);

  const filteredPatients = patients.filter((patient) =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.patientNumber?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.phone?.includes(patientSearch)
  );

  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectPatient = (patient: Patient) => {
    setForm({ ...form, patientId: patient.id });
    setPatientSearch(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
  };

  const selectDoctor = (doctor: Doctor) => {
    setForm({ ...form, doctorId: doctor.id });
    setDoctorSearch(`Dr. ${doctor.firstName} ${doctor.lastName}`);
    setShowDoctorDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.appointmentDate) {
      alert("Please select a patient, doctor, and appointment date");
      return;
    }

    setSaving(true);
    try {
      await api.post("/appointments", form);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create appointment:", err);
      alert("Failed to create appointment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const selectedPatient = patients.find((p) => p.id === form.patientId);
  const selectedDoctor = doctors.find((d) => d.id === form.doctorId);

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              Create Appointment
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Schedule a new patient visit</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Patient & Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Search */}
              <div className="relative">
                <label className={labelClass}>
                  <User size={14} className="inline mr-1 text-slate-400" />
                  Patient
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search patient..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientDropdown(true);
                      if (!e.target.value) setForm({ ...form, patientId: "" });
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className={`${inputClass} pl-9`}
                  />
                  {selectedPatient && (
                    <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                  )}
                </div>

                {showPatientDropdown && patientSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredPatients.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-500">No patients found</p>
                    ) : (
                      filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => selectPatient(patient)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <p className="text-sm font-medium text-slate-900">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {patient.patientNumber} · {patient.phone}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Doctor Search */}
              <div className="relative">
                <label className={labelClass}>
                  <Stethoscope size={14} className="inline mr-1 text-slate-400" />
                  Doctor
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search doctor..."
                    value={doctorSearch}
                    onChange={(e) => {
                      setDoctorSearch(e.target.value);
                      setShowDoctorDropdown(true);
                      if (!e.target.value) setForm({ ...form, doctorId: "" });
                    }}
                    onFocus={() => setShowDoctorDropdown(true)}
                    className={`${inputClass} pl-9`}
                  />
                  {selectedDoctor && (
                    <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                  )}
                </div>

                {showDoctorDropdown && doctorSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredDoctors.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-500">No doctors found</p>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <button
                          key={doctor.id}
                          type="button"
                          onClick={() => selectDoctor(doctor)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <p className="text-sm font-medium text-slate-900">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{doctor.specialization}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Date & Reason */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <Calendar size={14} className="inline mr-1 text-slate-400" />
                  Appointment Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="appointmentDate"
                  value={form.appointmentDate}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Reason for Visit</label>
                <input
                  name="reason"
                  placeholder="e.g. Routine checkup, Follow-up"
                  value={form.reason}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>
                <FileText size={14} className="inline mr-1 text-slate-400" />
                Additional Notes
              </label>
              <textarea
                name="notes"
                placeholder="Any special instructions or notes..."
                value={form.notes}
                onChange={handleChange}
                className={`${inputClass} min-h-[120px] resize-none`}
                rows={4}
              />
            </div>

            {/* Selected Summary */}
            {(selectedPatient || selectedDoctor) && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointment Summary</p>
                {selectedPatient && (
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Patient:</span> {selectedPatient.firstName} {selectedPatient.lastName}
                  </p>
                )}
                {selectedDoctor && (
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Doctor:</span> Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </p>
                )}
                {form.appointmentDate && (
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Date:</span> {new Date(form.appointmentDate).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-4 flex items-center justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.patientId || !form.doctorId || !form.appointmentDate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Calendar size={14} />
                  Create Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
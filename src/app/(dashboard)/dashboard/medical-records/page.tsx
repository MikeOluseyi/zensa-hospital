"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

type MedicalRecord = {
  id: string;

  diagnosis: string;

  patient: {
    firstName: string;
    lastName: string;
    patientNumber: string;
  };

  doctor: {
    firstName: string;
    lastName: string;
  };

  createdAt: string;
};

export default function MedicalRecordsPage() {

  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);

  async function fetchRecords() {

    try {

      const response =
        await api.get("/medical-records");

      setRecords(response.data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (

    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Medical Records
          </h1>

          <p className="text-slate-500 mt-1">
            Consultation history
          </p>

        </div>

      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-50 border-b">

            <tr className="text-left">

              <th className="p-4">
                Patient
              </th>

              <th className="p-4">
                Diagnosis
              </th>

              <th className="p-4">
                Doctor
              </th>

              <th className="p-4">
                Date
              </th>

            </tr>

          </thead>

          <tbody>

            {records.map((record) => (

            <tr
  key={record.id}
  className="
    border-b
    cursor-pointer
    hover:bg-slate-50
  "
  onClick={() =>
    window.location.href =
      `/dashboard/medical-records/${record.id}`
  }
>

                <td className="p-4">

                  <div className="font-medium">

                    {record.patient.firstName}{" "}
                    {record.patient.lastName}

                  </div>

                  <div className="text-sm text-slate-500">

                    {record.patient.patientNumber}

                  </div>

                </td>

                <td className="p-4">
                  {record.diagnosis}
                </td>

                <td className="p-4">

                  Dr.{" "}

                  {record.doctor.firstName}{" "}
                  {record.doctor.lastName}

                </td>

                <td className="p-4">

                  {new Date(
                    record.createdAt
                  ).toLocaleDateString()}

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
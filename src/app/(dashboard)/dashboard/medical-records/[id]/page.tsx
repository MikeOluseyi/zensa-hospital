"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";

export default function ConsultationDetailsPage() {

  const params = useParams();

  const [record, setRecord] =
    useState<any>(null);

  useEffect(() => {

    async function load() {

      try {

        const res =
          await api.get(
            `/medical-records/${params.id}`
          );

        setRecord(res.data);

      } catch (err) {

        console.log(err);
      }
    }

    load();

  }, [params.id]);

  if (!record) {
    return <div>Loading...</div>;
  }

  return (

    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Consultation Details
      </h1>

      <div className="bg-white p-6 rounded-xl border">

        <h2 className="font-semibold mb-2">
          Patient
        </h2>

        <p>
          {record.patient.firstName}{" "}
          {record.patient.lastName}
        </p>

      </div>

      <div className="bg-white p-6 rounded-xl border">

        <h2 className="font-semibold mb-2">
          Chief Complaint
        </h2>

        <p>
          {record.chiefComplaint}
        </p>

      </div>

      <div className="bg-white p-6 rounded-xl border">

        <h2 className="font-semibold mb-2">
          Diagnosis
        </h2>

        <p>
          {record.diagnosis}
        </p>

      </div>

      <div className="bg-white p-6 rounded-xl border">

        <h2 className="font-semibold mb-2">
          Treatment
        </h2>

        <p>
          {record.treatment}
        </p>

      </div>

      <div className="bg-white p-6 rounded-xl border">

        <h2 className="font-semibold mb-2">
          Notes
        </h2>

        <p>
          {record.notes}
        </p>

      </div>

      <div className="bg-white p-6 rounded-xl border">

        <h2 className="font-semibold mb-4">
          Prescriptions
        </h2>

        {record.prescriptions?.map(
          (p: any) => (

            <div
              key={p.id}
              className="border-b py-2"
            >
              {p.inventoryItem.name}
              {" - "}
              {p.dosage}
            </div>
          )
        )}

      </div>

    </div>
  );
}
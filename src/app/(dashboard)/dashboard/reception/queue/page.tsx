"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function QueuePage() {

  const [appointments, setAppointments] =
    useState([]);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {

    const res =
      await api.get("/appointments");

    const queued =
      res.data.filter(
        (a: any) =>
          a.status === "QUEUED"
      );

    setAppointments(queued);
  }

  return (

    <div>

      <h1 className="text-3xl font-bold mb-6">
        Consultation Queue
      </h1>

      <div className="space-y-4">

        {appointments.map((a: any) => (

          <div
            key={a.id}
            className="border rounded-lg p-4"
          >

            <p>
              {a.patient.firstName}
              {" "}
              {a.patient.lastName}
            </p>

            <p>
              {a.reason}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}
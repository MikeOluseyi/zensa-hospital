"use client";

export default function TriageCard({
  appointment,
  onSubmit,
}: {
  appointment: any;
  onSubmit: (appointmentId: string) => Promise<void>;
}) {
  return (
    <div className="border rounded p-4 flex justify-between items-center">
      <div>
        <div className="font-semibold">
          {appointment.patient?.firstName}{" "}
          {appointment.patient?.lastName}
        </div>

        <div className="text-sm text-gray-500">
          {appointment.patient?.patientNumber}
        </div>
      </div>

      <button
        onClick={() => onSubmit(appointment.id)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Move To Queue
      </button>
    </div>
  );
}
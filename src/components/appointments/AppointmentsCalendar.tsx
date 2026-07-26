"use client";

type Appointment = {
  id: string;
  appointmentDate: string;
  status: string;

  patient: {
    firstName: string;
    lastName: string;
  };

  doctor: {
    firstName: string;
    lastName: string;
  };
};

interface Props {
  appointments: Appointment[];
}

export default function AppointmentsCalendar({
  appointments
}: Props) {

  const upcomingAppointments =
    appointments.filter((appointment) => {

      const appointmentDate =
        new Date(appointment.appointmentDate);

      const now = new Date();

      return (
        appointment.status !== "COMPLETED" &&
        appointment.status !== "ADMITTED" &&
        appointmentDate >= now
      );
    });

  return (

    <div className="bg-white rounded-2xl border p-6">

      <h2 className="text-xl font-semibold mb-6">
        Upcoming Appointments
      </h2>

      <div className="space-y-4">

        {upcomingAppointments.length === 0 ? (

          <p className="text-slate-500">
            No upcoming appointments
          </p>

        ) : (

          upcomingAppointments.map((appointment) => (

            <div
              key={appointment.id}
              className="
                flex items-center justify-between
                border rounded-xl
                p-4
              "
            >

              <div>

                <p className="font-medium">

                  {appointment.patient.firstName}
                  {" "}
                  {appointment.patient.lastName}

                </p>

                <p className="text-sm text-slate-500">

                  Dr.
                  {" "}
                  {appointment.doctor.firstName}
                  {" "}
                  {appointment.doctor.lastName}

                </p>

              </div>

              <div className="text-sm text-slate-600">

                {new Date(
                  appointment.appointmentDate
                ).toLocaleString()}

              </div>

            </div>

          ))
        )}

      </div>

    </div>
  );
}
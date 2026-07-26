"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function EditStaffPage(
  { params }: any
) {

  const router = useRouter();

  const [form, setForm] = useState({

    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    role: "",

    specialization: "",
    licenseNumber: ""
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {

    try {

      const res =
        await api.get(
          `/staff/${params.id}`
        );

      setForm({

        firstName:
          res.data.firstName || "",

        lastName:
          res.data.lastName || "",

        email:
          res.data.email || "",

        phone:
          res.data.phone || "",

        role:
          res.data.role || "",

        specialization:
          res.data.specialization || "",

        licenseNumber:
          res.data.licenseNumber || ""
      });

    } catch (err) {

      console.log(err);

      alert("Failed to load staff");
    }
  }

  function handleChange(
    e:
      React.ChangeEvent<
        HTMLInputElement |
        HTMLSelectElement
      >
  ) {

    setForm({

      ...form,

      [e.target.name]:
        e.target.value
    });
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    try {

      await api.patch(
        `/staff/${params.id}`,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          specialization: form.specialization,
          licenseNumber: form.licenseNumber
        }
      );

      alert(
        "Staff updated successfully"
      );

      router.push(
        "/dashboard/staff"
      );

    } catch (err) {

      console.log(err);

      alert(
        "Failed to update staff"
      );
    }
  }

  return (

    <div className="max-w-3xl">

      <h1 className="text-3xl font-bold mb-6">
        Edit Staff
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="w-full border rounded-lg px-4 py-3"
        />

        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="w-full border rounded-lg px-4 py-3"
        />

        <input
          name="email"
          value={form.email}
          disabled
          className="w-full border rounded-lg px-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed"
        />
        <p className="text-xs text-slate-400 -mt-2">
          Email cannot be changed here.
        </p>

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full border rounded-lg px-4 py-3"
        />

        <select
          name="role"
          value={form.role}
          disabled
          className="w-full border rounded-lg px-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed"
        >

          <option value="">
            Select Role
          </option>

          <option value="ADMIN">
            Admin
          </option>

          <option value="DOCTOR">
            Doctor
          </option>

          <option value="NURSE">
            Nurse
          </option>

          <option value="PHARMACIST">
            Pharmacist
          </option>

          <option value="LAB_TECH">
            Lab Technician
          </option>

          <option value="RADIOLOGY">
            Radiology
          </option>

          <option value="ACCOUNTANT">
            Accountant
          </option>

          <option value="RECEPTIONIST">
            Receptionist
          </option>

        </select>
        <p className="text-xs text-slate-400 -mt-2">
          Role changes are not supported from this form.
        </p>

        <input
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
          placeholder="Specialization"
          className="w-full border rounded-lg px-4 py-3"
        />

        <input
          name="licenseNumber"
          value={form.licenseNumber}
          onChange={handleChange}
          placeholder="License Number"
          className="w-full border rounded-lg px-4 py-3"
        />

        <button
          className="
            bg-blue-600
            text-white
            px-6 py-3
            rounded-lg
          "
        >
          Save Changes
        </button>

      </form>

    </div>
  );
}
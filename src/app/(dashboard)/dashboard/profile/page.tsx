"use client";

import { useEffect, useState } from "react";

import api from "@/lib/api";

export default function ProfilePage() {

  const [form, setForm] = useState({

    phone: "",
    address: "",
    maritalStatus: "",

    nextOfKin: "",
    nextOfKinPhone: "",

    specialization: "",
    licenseNumber: ""
  });

  async function fetchProfile() {

    try {

      const res =
        await api.get("/staff/profile");

      setForm({

        phone:
          res.data.phone || "",

        address:
          res.data.address || "",

        maritalStatus:
          res.data.maritalStatus || "",

        nextOfKin:
          res.data.nextOfKin || "",

        nextOfKinPhone:
          res.data.nextOfKinPhone || "",

        specialization:
          res.data.specialization || "",

        licenseNumber:
          res.data.licenseNumber || ""
      });

    } catch (err) {

      console.log(err);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    try {

      await api.patch(
        "/staff/profile",
        form
      );

      alert("Profile updated");

    } catch (err) {

      console.log(err);

      alert("Failed to update");
    }
  }

  function handleChange(
    e: React.ChangeEvent<
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

  return (

    <div className="max-w-3xl">

      <h1 className="text-3xl font-bold mb-8">
        My Profile
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-8 rounded-2xl shadow"
      >

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="border rounded-lg px-4 py-3 w-full"
        />

        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="border rounded-lg px-4 py-3 w-full"
        />

        <select
          name="maritalStatus"
          value={form.maritalStatus}
          onChange={handleChange}
          className="border rounded-lg px-4 py-3 w-full"
        >

          <option value="">
            Select marital status
          </option>

          <option value="SINGLE">
            Single
          </option>

          <option value="MARRIED">
            Married
          </option>

          <option value="DIVORCED">
            Divorced
          </option>

        </select>

        <input
          name="nextOfKin"
          placeholder="Next of Kin"
          value={form.nextOfKin}
          onChange={handleChange}
          className="border rounded-lg px-4 py-3 w-full"
        />

        <input
          name="nextOfKinPhone"
          placeholder="NOK Phone"
          value={form.nextOfKinPhone}
          onChange={handleChange}
          className="border rounded-lg px-4 py-3 w-full"
        />

        <input
          name="specialization"
          placeholder="Specialization"
          value={form.specialization}
          onChange={handleChange}
          className="border rounded-lg px-4 py-3 w-full"
        />

        <input
          name="licenseNumber"
          placeholder="License Number"
          value={form.licenseNumber}
          onChange={handleChange}
          className="border rounded-lg px-4 py-3 w-full"
        />

        <button
          className="bg-slate-900 text-white px-6 py-3 rounded-xl"
        >
          Save Changes
        </button>

      </form>

    </div>
  );
}
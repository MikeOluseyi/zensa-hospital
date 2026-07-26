"use client";

import { useState } from "react";

import api from "@/lib/api";

export default function ChangePasswordPage() {

  const [form, setForm] = useState({

    currentPassword: "",
    newPassword: ""
  });

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    try {

      await api.patch(
        "/password/change-password",
        form
      );

      alert("Password updated");

      setForm({
        currentPassword: "",
        newPassword: ""
      });

    } catch (err) {

      console.log(err);

      alert("Failed to change password");
    }
  }

  return (

    <div className="max-w-xl">

      <h1 className="text-3xl font-bold mb-8">
        Change Password
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-8 rounded-2xl shadow"
      >

        <input
          type="password"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={(e) =>
            setForm({
              ...form,
              currentPassword:
                e.target.value
            })
          }
          className="border rounded-lg px-4 py-3 w-full"
        />

        <input
          type="password"
          placeholder="New Password"
          value={form.newPassword}
          onChange={(e) =>
            setForm({
              ...form,
              newPassword:
                e.target.value
            })
          }
          className="border rounded-lg px-4 py-3 w-full"
        />

        <button
          className="bg-slate-900 text-white px-6 py-3 rounded-xl"
        >
          Update Password
        </button>

      </form>

    </div>
  );
}
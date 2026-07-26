"use client";

import { useEffect, useState } from "react";

import {
  getAvailableStaff,
  assignStaff,
} from "@/services/departments";

interface Props {

  open: boolean;

  departmentId: string;

  onClose: () => void;

  onSaved: () => void;

}

export default function AssignStaffModal({

  open,

  departmentId,

  onClose,

  onSaved

}: Props) {

  const [staff, setStaff] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (open) {

      loadStaff();

    }

  }, [open]);

  async function loadStaff() {

    try {

      setLoading(true);

      const data =
        await getAvailableStaff(departmentId);

      setStaff(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }

  async function handleAssign(

    staffId: string

  ) {

    try {

      await assignStaff(

        departmentId,

        staffId

      );

      onSaved();

      onClose();

    } catch (err) {

      console.error(err);

      alert("Failed to assign staff.");

    }

  }

  if (!open) return null;

  const filtered = staff.filter((member) => {

    const query = search.toLowerCase();

    return (

      `${member.firstName} ${member.lastName}`

        .toLowerCase()

        .includes(query)

    );

  });

  return (

    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-150 p-6">

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-xl font-semibold">

            Assign Staff

          </h2>

          <button

            onClick={onClose}

            className="text-slate-500"

          >

            ✕

          </button>

        </div>

        <input

          className="border rounded-lg w-full p-3 mb-5"

          placeholder="Search staff..."

          value={search}

          onChange={(e)=>

            setSearch(e.target.value)

          }

        />

        <div className="max-h-100 overflow-y-auto space-y-2">

          {loading && (

            <div>

              Loading...

            </div>

          )}

          {!loading &&

            filtered.length === 0 && (

              <div className="text-center text-slate-500 py-8">

                No available staff.

              </div>

          )}

          {filtered.map((member)=>(

            <div

              key={member.id}

              className="border rounded-lg p-4 flex justify-between items-center"

            >

              <div>

                <div className="font-medium">

                  {member.firstName} {member.lastName}

                </div>

                <div className="text-sm text-slate-500">

                  {member.role}

                </div>

              </div>

              <button

                onClick={()=>

                  handleAssign(member.id)

                }

                className="bg-blue-600 text-white px-4 py-2 rounded-lg"

              >

                Assign

              </button>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}
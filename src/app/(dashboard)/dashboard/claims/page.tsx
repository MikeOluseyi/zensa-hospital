// app/dashboard/claims/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

type Claim = {
  id: string;
  claimNumber?: string;
  status: string;
  totalAmount: number;
  approvedAmount?: number;

  patient: {
    firstName: string;
    lastName: string;
  };

  insurance: {
    provider: {
      name: string;
    };
  };

  invoice: {
    id: string;
  };

  createdAt: string;
};

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  async function fetchClaims() {
    try {
      const res = await api.get("/claims");
      setClaims(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    return {
      total: claims.length,
      pending: claims.filter(
        c =>
          c.status === "PENDING" ||
          c.status === "SUBMITTED"
      ).length,

      approved: claims.filter(
        c =>
          c.status === "APPROVED"
      ).length,

      partial: claims.filter(
        c =>
          c.status === "PARTIALLY_APPROVED"
      ).length,

      rejected: claims.filter(
        c =>
          c.status === "REJECTED"
      ).length,

      paid: claims.filter(
        c =>
          c.status === "PAID"
      ).length
    };
  }, [claims]);

  if (loading) {
    return (
      <div className="p-6">
        Loading claims...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Claims
          </h1>

          <p className="text-gray-500">
            Insurance claims management
          </p>
        </div>

        <div className="flex gap-3">
        </div>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">

        <Card
          title="Total"
          value={stats.total}
        />

        <Card
          title="Pending"
          value={stats.pending}
        />

        <Card
          title="Approved"
          value={stats.approved}
        />

        <Card
          title="Partial"
          value={stats.partial}
        />

        <Card
          title="Rejected"
          value={stats.rejected}
        />

        <Card
          title="Paid"
          value={stats.paid}
        />

      </div>

      {/* Table */}

      <div className="overflow-x-auto rounded-lg border bg-white">

        <table className="min-w-full">

          <thead className="border-b bg-gray-100">

            <tr>

              <th className="px-4 py-3 text-left">
                Claim
              </th>

              <th className="px-4 py-3 text-left">
                Patient
              </th>

              <th className="px-4 py-3 text-left">
                Insurer
              </th>

              <th className="px-4 py-3 text-right">
                Total
              </th>

              <th className="px-4 py-3 text-right">
                Approved
              </th>

              <th className="px-4 py-3 text-center">
                Status
              </th>

              <th className="px-4 py-3">
              </th>

            </tr>

          </thead>

          <tbody>

            {claims.map(claim => (

              <tr
                key={claim.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="px-4 py-3">

                  {claim.claimNumber ??
                    claim.id.slice(0, 8)}

                </td>

                <td className="px-4 py-3">

                  {claim.patient.firstName}{" "}
                  {claim.patient.lastName}

                </td>

                <td className="px-4 py-3">

                  {
                    claim.insurance.provider.name
                  }

                </td>

                <td className="px-4 py-3 text-right">

                  ₦
                  {claim.totalAmount.toLocaleString()}

                </td>

                <td className="px-4 py-3 text-right">

                  ₦
                  {(
                    claim.approvedAmount ??
                    claim.totalAmount
                  ).toLocaleString()}

                </td>

                <td className="px-4 py-3 text-center">

                  <StatusBadge
                    status={claim.status}
                  />

                </td>

                <td className="px-4 py-3 text-right">

                  <Link
                    href={`/dashboard/claims/${claim.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

function Card({
  title,
  value
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">

      <div className="text-sm text-gray-500">
        {title}
      </div>

      <div className="mt-2 text-2xl font-bold">
        {value}
      </div>

    </div>
  );
}

function StatusBadge({
  status
}: {
  status: string;
}) {

  const colours: Record<string, string> = {

    PENDING:
      "bg-yellow-100 text-yellow-800",

    SUBMITTED:
      "bg-blue-100 text-blue-800",

    APPROVED:
      "bg-green-100 text-green-800",

    PARTIALLY_APPROVED:
      "bg-orange-100 text-orange-800",

    REJECTED:
      "bg-red-100 text-red-800",

    PAID:
      "bg-purple-100 text-purple-800"

  };

  return (

    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        colours[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>

  );
}
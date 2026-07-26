"use client";

import { useEffect, useState } from "react";
import { InsuranceAPI, InsuranceProvider } from "@/services/insurance";

interface Props {
  value: string;
  onChange: (providerId: string) => void;
}

export default function InsuranceProviderSelect({ value, onChange }: Props) {
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    InsuranceAPI.getProviders()
      .then(setProviders)
      .finally(() => setLoading(false));
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
      disabled={loading}
    >
      <option value="">{loading ? "Loading providers..." : "Select insurer"}</option>
      {providers.map((p) => (
        <option key={p.id} value={p.id}>
          {p.organization.name}
        </option>
      ))}
    </select>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { InsuranceAPI, InsuranceProvider } from "@/services/insurance";

interface Props {
  value: string;
  onChange: (providerId: string) => void;
}

export default function InsuranceProviderSelect({ value, onChange }: Props) {
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [claimsEmail, setClaimsEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  function loadProviders() {
    setLoading(true);
    InsuranceAPI.getProviders()
      .then(setProviders)
      .finally(() => setLoading(false));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    try {
      const provider = await InsuranceAPI.quickAddProvider({
        name: name.trim(),
        claimsEmail: claimsEmail.trim() || undefined,
      });

      setProviders((prev) => [provider, ...prev]);
      onChange(provider.id);
      setShowAdd(false);
      setName("");
      setClaimsEmail("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to add insurer.");
    } finally {
      setAdding(false);
    }
  }

  if (showAdd) {
    return (
      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-600">Add a new insurer</p>
          <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Insurer name"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/50"
          autoFocus
        />
        <input
          value={claimsEmail}
          onChange={(e) => setClaimsEmail(e.target.value)}
          placeholder="Claims email (optional)"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || !name.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {adding ? <Loader2 size={14} className="animate-spin" /> : "Add & Select"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
        disabled={loading}
      >
        <option value="">{loading ? "Loading providers..." : "Select insurer"}</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.organization.name}{p.integrationMode === "EXTERNAL" ? " (External)" : ""}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
      >
        <Plus size={12} />
        Insurer not listed? Add one
      </button>
    </div>
  );
}
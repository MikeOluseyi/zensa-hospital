"use client";

import { useEffect, useState } from "react";
import { Ward, WardService } from "@/services/ward";
import WardCard from "./WardCard";
import WardModal from "./WardModal";
import {
  LayoutGrid,
  BedDouble,
  Search,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function WardTable() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  async function loadWards() {
    try {
      setLoading(true);
      const data = await WardService.getAll();
      setWards(data);
    } catch {
      alert("Failed to load wards.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWards();
  }, []);

  const filteredWards = wards.filter((ward) => {
    const query = search.toLowerCase();

    return (
      ward.name.toLowerCase().includes(query) ||
      (ward.type ?? "").toLowerCase().includes(query)
    );
  });

  const stats = {
    wards: wards.length,

    beds: wards.reduce(
      (sum, ward) => sum + ward.beds.length,
      0
    ),
  };

  async function handleDelete(ward: Ward) {
    const confirmed = confirm(
      `Delete "${ward.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await WardService.delete(ward.id);
      loadWards();
    } catch {
      alert("Unable to delete ward.");
    }
  }

  function handleCreate() {
    setSelectedWard(null);
    setModalOpen(true);
  }

  function handleEdit(ward: Ward) {
    setSelectedWard(ward);
    setModalOpen(true);
  }

  async function handleSubmit(data: any) {
    if (selectedWard) {
      await WardService.update(selectedWard.id, data);
    } else {
      await WardService.create(data);
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={<LayoutGrid size={20} />}
          label="Wards"
          value={stats.wards}
          color="blue"
        />

        <StatCard
          icon={<BedDouble size={20} />}
          label="Beds"
          value={stats.beds}
          color="emerald"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wards..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus size={16} />
          New Ward
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Loading wards...</p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredWards.length === 0 && (
        <div className="border border-slate-200 rounded-xl p-12 text-center">
          <AlertCircle
            size={40}
            className="mx-auto text-slate-300 mb-3"
          />

          <p className="text-slate-500 font-medium">
            {search
              ? "No wards match your search."
              : "No wards found."}
          </p>

          <p className="text-sm text-slate-400 mt-1">
            {search
              ? "Try a different search term."
              : "Create your first ward to get started."}
          </p>
        </div>
      )}

      {/* Cards */}
      {!loading && filteredWards.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredWards.map((ward) => (
            <WardCard
              key={ward.id}
              ward={ward}
              onEdit={() => handleEdit(ward)}
              onDelete={() => handleDelete(ward)}
            />
          ))}
        </div>
      )}

      <WardModal
        open={modalOpen}
        ward={selectedWard}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          loadWards();
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "emerald";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colors[color]}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}
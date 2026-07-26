"use client";

import { useEffect, useMemo, useState } from "react";
import { HospitalService, ServiceAPI } from "@/services/services";
import ServiceCard from "./ServiceCard";
import EnableServiceModal from "./EnableServiceModal";
import PriceModal from "./PriceModal";
import {
  BriefcaseMedical,
  Building2,
  CircleOff,
  Search,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function ServiceTable() {
  const [services, setServices] = useState<HospitalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<HospitalService | null>(null);
  const [priceModal, setPriceModal] = useState(false);
  const [departmentModal, setDepartmentModal] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<HospitalService | null>(null);
  
  function editPrice(service: HospitalService) {
  setSelectedService(service);
  setPriceModalOpen(true);
}

  async function loadServices() {
    try {
      setLoading(true);
      const data = await ServiceAPI.getHospitalServices();
      setServices(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  const filtered = useMemo(() => {
    return services.filter((service) => {
      const q = search.toLowerCase();
      return (
        service.service.name.toLowerCase().includes(q) ||
        service.service.cpt.code.toLowerCase().includes(q) ||
        service.service.cpt.description.toLowerCase().includes(q)
      );
    });
  }, [services, search]);

  const statistics = useMemo(() => {
    return {
      total: services.length,
      assigned: services.filter((service) => service.department).length,
      unassigned: services.filter((service) => !service.department).length,
    };
  }, [services]);

  async function removeService(id: string) {
    if (!confirm("Disable this service?")) return;
    await ServiceAPI.remove(id);
    loadServices();
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<BriefcaseMedical size={20} />} label="Enabled" value={statistics.total} color="blue" />
        <StatCard icon={<Building2 size={20} />} label="Assigned" value={statistics.assigned} color="emerald" />
        <StatCard icon={<CircleOff size={20} />} label="Unassigned" value={statistics.unassigned} color="amber" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus size={16} />
          Enable Service
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Loading services...</p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="border border-slate-200 rounded-xl p-12 text-center">
          <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">
            {search ? "No services match your search." : "No enabled services."}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? "Try a different search term." : "Enable a service to get started."}
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onDelete={() => removeService(service.id)}
            onDepartment={() => {
              setSelected(service);
              setDepartmentModal(true);
            }}
            onPrice={() => {
              setSelected(service);
              setPriceModal(true);
            }}
          />
        ))}
      </div>

      <EnableServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => loadServices()}
      />

        <PriceModal
          open={priceModalOpen}
          service={selectedService}
          onClose={() => {
          setPriceModalOpen(false);
          setSelectedService(null);
          }}
          onSaved={loadServices}
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
  color: "blue" | "emerald" | "amber";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

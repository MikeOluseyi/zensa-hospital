"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Clock, Loader2, CheckCircle2 } from "lucide-react";

export default function DefaultDailyRoundSetting() {
  const [services, setServices] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get("/services?category=CONSULTATION&visitSetting=INPATIENT");
      setServices(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await api.patch("/services/default-daily-round", { hospitalServiceId: selected || null });
      alert("Default daily round service updated.");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update default.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
      <h2 className="font-semibold text-slate-900 flex items-center gap-2">
        <Clock size={18} className="text-slate-500" />
        Default Daily Round Service
      </h2>
      <p className="text-sm text-slate-500">
        Used automatically each day a doctor sees an inpatient, without needing to pick one every time.
      </p>
      {loading ? (
        <Loader2 size={18} className="animate-spin text-slate-400" />
      ) : (
        <div className="flex items-center gap-3">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white"
          >
            <option value="">No default set</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.service.name} — ₦{s.price.toLocaleString()}</option>
            ))}
          </select>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Save
          </button>
        </div>
      )}
    </div>
  );
}
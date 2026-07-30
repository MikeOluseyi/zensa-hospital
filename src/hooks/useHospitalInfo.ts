"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface HospitalInfo {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

let cached: HospitalInfo | null = null;

export function useHospitalInfo() {
  const [hospital, setHospital] = useState<HospitalInfo | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;

    api.get("/hospitals/me")
      .then((res) => {
        cached = res.data;
        setHospital(res.data);
      })
      .catch(() => setHospital(null))
      .finally(() => setLoading(false));
  }, []);

  return { hospital, loading };
}
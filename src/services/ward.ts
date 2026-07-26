import api from "@/lib/api";

export interface Bed {
  id: string;
  bedNumber: string;
  status: string;
  dailyRate?: number;
}

export interface Ward {
  id: string;
  name: string;
  type: string;
  departmentId?: string;
  beds: Bed[];
}

export const WardService = {

  async getAll() {

    const res = await api.get("/wards");

    return res.data;

  },

  async create(data: {

    name: string;

    type: string;

    departmentId: string;

  }) {

    const res = await api.post("/wards", data);

    return res.data;

  },

  async update(id: string, data: any) {

    const res = await api.patch(`/wards/${id}`, data);

    return res.data;

  },

  async delete(id: string) {

    const res = await api.delete(`/wards/${id}`);

    return res.data;

  }

};

export async function assignDepartment(
  wardId: string,
  departmentId: string
) {
  const res = await api.patch(
    `/wards/${wardId}/department`,
    { departmentId }
  );

  return res.data;
}
import { api } from "./api";

export interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  cpt: {
    code: string;
    description: string;
  };
}

export interface HospitalService {
  id: string;
  active: boolean;
  price: number;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
  service: Service;
}

export const ServiceAPI = {
  getCatalog: (search = "") =>
    api
      .get(`/services/catalog?search=${search}`)
      .then((r) => r.data),

  getHospitalServices: (category?: string, visitSetting?: "OUTPATIENT" | "INPATIENT") =>
  api
    .get("/services", {
      params: {
        ...(category && { category }),
        ...(visitSetting && { visitSetting }),
      },
    })
    .then((r) => r.data),

  enable: (data: {
    serviceId: string;
    departmentId?: string;
    price: number;
  }) =>
    api.post("/services", data),

  assignDepartment: (
    id: string,
    departmentId: string | null
  ) =>
    api.patch(
      `/services/${id}/department`,
      {
        departmentId,
      }
    ),

  updatePrice: (
    id: string,
    price: number
  ) =>
    api.patch(
      `/services/${id}/price`,
      {
        price,
      }
    ),

  remove: (id: string) =>
    api.delete(`/services/${id}`),
};


import api from "@/lib/api";

export interface Department {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;

   wards?: any[];
    staff?: any[];

  _count?: {
    wards: number;
    staff: number;
  };
}

async function getAll() {
  const res = await api.get("/departments");
  return res.data;
}

async function get(id: string) {
  const res = await api.get(`/departments/${id}`);
  return res.data;
}

async function create(data: any) {
  const res = await api.post("/departments", data);
  return res.data;
}

async function update(id: string, data: any) {
  const res = await api.patch(`/departments/${id}`, data);
  return res.data;
}

async function remove(id: string) {
  const res = await api.delete(`/departments/${id}`);
  return res.data;
}

export const DepartmentService = {
  getAll,
  get,
  create,
  update,
  delete: remove,
};

export async function getDepartments() {
  const res = await api.get("/departments");
  return res.data;
}

export async function getDepartment(id: string) {
  const res = await api.get(`/departments/${id}`);
  return res.data;
}

export async function createDepartment(data: {
  name: string;
  description?: string;
}) {
  const res = await api.post("/departments", data);
  return res.data;
}

export async function updateDepartment(
  id: string,
  data: {
    name: string;
    description?: string;
  }
) {
  const res = await api.patch(`/departments/${id}`, data);
  return res.data;
}

export async function deleteDepartment(id: string) {
  const res = await api.delete(`/departments/${id}`);
  return res.data;
}


export async function getAvailableStaff(id: string) {

  const res = await api.get(

    `/departments/${id}/available-staff`

  );

  return res.data;

}

export async function assignStaff(

  departmentId: string,

  staffId: string

) {

  const res = await api.patch(

    `/departments/${departmentId}/assign-staff`,

    {

      staffId

    }

  );

  return res.data;

}

export async function removeStaff(

  departmentId: string,

  staffId: string

) {

  const res = await api.patch(

    `/departments/${departmentId}/remove-staff`,

    {

      staffId

    }

  );

  return res.data;

}
import api from "@/lib/api";

export async function getStaff() {
  const res = await api.get("/staff");
  return res.data;
}

export async function getDoctors() {
  const res = await api.get("/staff/doctors");
  return res.data;
}

export async function assignDepartment(
  staffId: string,
  departmentId: string
) {

  return api.patch(

    `/staff/${staffId}/department`,

    {

      departmentId

    }

  );

}

export async function removeDepartment(
  staffId: string
) {

  return api.patch(

    `/staff/${staffId}/remove-department`

  );

}
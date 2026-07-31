import { api } from "./api";

export async function getPatients() {

  const response =
    await api.get("/patients");

  return response.data;
}

export const PatientBulkImportAPI = {
  import: (patients: any[]) =>
    api.post("/patients/bulk-import", { patients }).then((r) => r.data),
};